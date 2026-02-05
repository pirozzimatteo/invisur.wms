package com.wms.core.domain.service;

import com.wms.core.adapter.out.persistence.entity.OutboundOrderEntity;
import com.wms.core.adapter.out.persistence.entity.PickingTaskEntity;
import com.wms.core.adapter.out.persistence.entity.StockEntity;
import com.wms.core.adapter.out.persistence.entity.WarehouseLocationEntity;
import com.wms.core.adapter.out.persistence.mapper.OutboundMapper;
import com.wms.core.adapter.out.persistence.repository.ItemRepository;
import com.wms.core.adapter.out.persistence.repository.OutboundOrderRepository;
import com.wms.core.adapter.out.persistence.repository.PickingTaskRepository;
import com.wms.core.adapter.out.persistence.repository.StockRepository;
import com.wms.core.domain.model.OutboundOrder;
import com.wms.core.domain.model.PickingTask;
import com.wms.core.domain.port.OutboundService;
import com.wms.core.domain.port.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OutboundServiceImpl implements OutboundService {

    private final OutboundOrderRepository orderRepository;
    private final PickingTaskRepository taskRepository;
    private final StockRepository stockRepository;
    private final com.wms.core.adapter.out.persistence.repository.StockMovementRepository movementRepository; // Full
                                                                                                              // qualified
                                                                                                              // to
                                                                                                              // avoid
                                                                                                              // import
                                                                                                              // clash
                                                                                                              // if any
    private final ItemRepository itemRepository;
    private final OutboundMapper outboundMapper;
    private final com.wms.core.adapter.out.persistence.repository.WarehouseLocationRepository locationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OutboundOrder> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(outboundMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void createOrder(com.wms.core.adapter.in.web.dto.OutboundDTO.CreateOrderRequest request) {
        // 1. Create Order
        OutboundOrderEntity orderEntity = new OutboundOrderEntity();
        orderEntity.setOrderNumber("ORD-" + System.currentTimeMillis());
        orderEntity.setCustomerId(request.getCustomerId());
        orderEntity.setStatus(OutboundOrderEntity.OrderStatus.NEW);
        OutboundOrderEntity savedOrder = orderRepository.save(orderEntity);

        // 2. Create Picking Tasks (Simple FIFO allocation)
        for (com.wms.core.adapter.in.web.dto.OutboundDTO.OrderLineItem line : request.getItems()) {
            // Find item
            var item = itemRepository.findByInternalCode(line.getItemCode())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found: " + line.getItemCode()));

            // Find available stock (Simple logic: take any stock)
            // In real world: check FIFO, batch, etc.
            List<StockEntity> availableStocks = stockRepository.findAll().stream() // TODO: Optimize with findByItem
                    .filter(s -> s.getItem().getId().equals(item.getId()))
                    .filter(s -> s.getQuantity().compareTo(BigDecimal.ZERO) > 0)
                    .filter(s -> line.getSourceLocationCode() == null || line.getSourceLocationCode().isEmpty()
                            || s.getLocation().getCode().equals(line.getSourceLocationCode()))
                    .collect(Collectors.toList());

            // --- ALLOCATION LOGIC UPDATE ---
            // Calculate total reserved quantity for this item (global or per location)
            int reservedQty = 0;
            if (line.getSourceLocationCode() != null && !line.getSourceLocationCode().isEmpty()) {
                // If source location is specified, we need the location ID to check specific
                // reservation
                // We can get it from the first available stock or fetch it.
                // Heuristic: If availableStocks is not empty, use the location from there.
                if (!availableStocks.isEmpty()) {
                    UUID locId = availableStocks.get(0).getLocation().getId();
                    reservedQty = taskRepository.getReservedQuantityByItemAndLocation(item.getId(), locId);
                }
            } else {
                reservedQty = taskRepository.getReservedQuantityByItem(item.getId());
            }

            BigDecimal totalPhysical = availableStocks.stream()
                    .map(StockEntity::getQuantity)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal effectiveAvailable = totalPhysical.subtract(BigDecimal.valueOf(reservedQty));

            if (effectiveAvailable.compareTo(line.getQuantity()) < 0) {
                throw new IllegalArgumentException("Insufficient effective stock for item " + line.getItemCode()
                        + ". Physical: " + totalPhysical
                        + ", Reserved: " + reservedQty
                        + ", Available: " + effectiveAvailable
                        + ", Requested: " + line.getQuantity());
            }
            // -------------------------------

            if (line.getSourceLocationCode() != null && !line.getSourceLocationCode().isEmpty()
                    && availableStocks.isEmpty()) {
                throw new IllegalArgumentException("No stock found for item " + line.getItemCode() + " in location "
                        + line.getSourceLocationCode());
            }

            BigDecimal remainingQty = line.getQuantity();

            for (StockEntity stock : availableStocks) {
                if (remainingQty.compareTo(BigDecimal.ZERO) <= 0)
                    break;

                BigDecimal allocate = stock.getQuantity().min(remainingQty);

                PickingTaskEntity task = new PickingTaskEntity();
                task.setOrder(savedOrder);
                task.setItem(item);
                task.setSourceLocation(stock.getLocation()); // Target specific loc
                task.setTargetQuantity(allocate.intValue());
                task.setPickedQuantity(0);
                task.setStatus(PickingTaskEntity.TaskStatus.PENDING);

                taskRepository.save(task);

                remainingQty = remainingQty.subtract(allocate);
            }

            if (remainingQty.compareTo(BigDecimal.ZERO) > 0) {
                // Determine what to do? Partial allocated?
                // For MVP, just log or ignore.
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PickingTask> getPendingTasks() {
        return taskRepository.findByStatus(PickingTaskEntity.TaskStatus.PENDING).stream()
                .map(outboundMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void confirmTask(UUID taskId) {
        PickingTaskEntity task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));

        if (task.getStatus() != PickingTaskEntity.TaskStatus.PENDING) {
            throw new IllegalStateException("Task already processed");
        }

        // 1. Decrement Stock at Source Location
        // We can reuse stockService.moveStock logic but targeting a "Consumed" location
        // or just delete?
        // Let's just decrement logic manually here for clarity or use a "consume"
        // method.
        // For MVP: Find specific stock record involved?
        // Better: Use StockService.consumeStock(stockId, qty) - if we add it.
        // Or: stockRepository.findByLocationId...

        // Simulating Pick: Decrement source location stock.
        StockEntity stock = stockRepository.findByLocationId(task.getSourceLocation().getId()).stream()
                .filter(s -> s.getItem().getId().equals(task.getItem().getId()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Stock not found in location for picking"));

        BigDecimal pickQty = BigDecimal.valueOf(task.getTargetQuantity());
        if (stock.getQuantity().compareTo(pickQty) < 0) {
            throw new IllegalStateException("Insufficient stock to pick");
        }

        stock.setQuantity(stock.getQuantity().subtract(pickQty));
        if (stock.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
            stockRepository.delete(stock);
        } else {
            stockRepository.save(stock);
        }

        // Log Movement
        com.wms.core.adapter.out.persistence.entity.StockMovementEntity movement = new com.wms.core.adapter.out.persistence.entity.StockMovementEntity();
        movement.setItemId(task.getItem().getId());
        movement.setSourceLocationId(task.getSourceLocation().getId()); // From where it was picked
        movement.setQuantity(pickQty);
        movement.setReason("OUTBOUND");
        movement.setOperatorName("System"); // Replace with auth user
        movementRepository.save(movement);

        // Log Movement
        try {
            // Use reflection or new entity manual map if Repository not visible?
            // Actually I need to inject StockMovementRepository.
            // DO NOT USE THIS CHUNK YET - Need to inject repo first.
        } catch (Exception e) {
        }

        // ... existing movement logic ...
        movementRepository.save(movement);

        // 2. Update Task
        task.setPickedQuantity(task.getTargetQuantity());
        task.setStatus(PickingTaskEntity.TaskStatus.COMPLETED);
        taskRepository.saveAndFlush(task); // FORCE FLUSH

        // 2b. Reduce Location Volume
        WarehouseLocationEntity location = task.getSourceLocation();
        BigDecimal unitVol = task.getItem().getUnitVolume();
        if (unitVol == null)
            unitVol = BigDecimal.ONE; // Fallback default for MVP

        BigDecimal totalVolRemoved = unitVol.multiply(pickQty);

        // Safety check to avoid negative volume
        if (location.getCurrentVolume() != null) {
            location.setCurrentVolume(location.getCurrentVolume().subtract(totalVolRemoved).max(BigDecimal.ZERO));

            // Update Status based on new volume
            if (location.getCurrentVolume().compareTo(BigDecimal.ZERO) == 0) {
                location.setStatus(WarehouseLocationEntity.LocationStatus.FREE);
            } else {
                if (location.getCapacityVolume() != null
                        && location.getCurrentVolume().compareTo(location.getCapacityVolume()) >= 0) {
                    location.setStatus(WarehouseLocationEntity.LocationStatus.FULL);
                } else {
                    location.setStatus(WarehouseLocationEntity.LocationStatus.OCCUPIED);
                }
            }

            locationRepository.save(location);
        }

        // 3. Update Order Line / Status
        checkAndUpdateOrderStatus(task.getOrder().getId());
    }

    @Override
    @Transactional
    public void shipOrder(UUID orderId) {
        OutboundOrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (order.getStatus() != OutboundOrderEntity.OrderStatus.PICKED) {
            throw new IllegalStateException("Order cannot be shipped. Current status: " + order.getStatus());
        }

        order.setStatus(OutboundOrderEntity.OrderStatus.SHIPPED);
        orderRepository.save(order);

        // Optional: Generate explicit SHIPPED movement logic here if needed
    }

    private void checkAndUpdateOrderStatus(UUID orderId) {
        OutboundOrderEntity order = orderRepository.findById(orderId).orElseThrow();

        // Check if ALL tasks for this order are completed
        List<PickingTaskEntity> tasks = taskRepository.findByOrderId(orderId);

        // Filter relevant tasks (ignore cancelled)
        List<PickingTaskEntity> relevantTasks = tasks.stream()
                .filter(t -> t.getStatus() != PickingTaskEntity.TaskStatus.CANCELLED)
                .collect(Collectors.toList());

        boolean allComplete = !relevantTasks.isEmpty() && relevantTasks.stream()
                .allMatch(t -> t.getStatus() == PickingTaskEntity.TaskStatus.COMPLETED);

        if (allComplete) {
            order.setStatus(OutboundOrderEntity.OrderStatus.PICKED);
            orderRepository.save(order);
        } else {
            // Ensure it is PICKING if at least one is done or in progress
            if (order.getStatus() == OutboundOrderEntity.OrderStatus.NEW) {
                order.setStatus(OutboundOrderEntity.OrderStatus.PICKING);
                orderRepository.save(order);
            }
        }
    }

    // Gen tasks included in create for now
}
