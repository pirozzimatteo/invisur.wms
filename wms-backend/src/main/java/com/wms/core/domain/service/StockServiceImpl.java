package com.wms.core.domain.service;

import com.wms.core.adapter.out.persistence.entity.StockEntity;
import com.wms.core.adapter.out.persistence.entity.StockMovementEntity;
import com.wms.core.adapter.out.persistence.entity.WarehouseLocationEntity;
import com.wms.core.adapter.out.persistence.mapper.StockMapper;
import com.wms.core.adapter.out.persistence.repository.ItemRepository;
import com.wms.core.adapter.out.persistence.repository.StockMovementRepository;
import com.wms.core.adapter.out.persistence.repository.StockRepository;
import com.wms.core.adapter.out.persistence.repository.WarehouseLocationRepository;
import com.wms.core.domain.model.Stock;
import com.wms.core.domain.port.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final StockRepository stockRepository;
    private final ItemRepository itemRepository;
    private final WarehouseLocationRepository locationRepository;
    private final StockMovementRepository movementRepository;
    private final StockMapper stockMapper;

    @Override
    @Transactional
    public Stock createStock(UUID itemId, UUID locationId, BigDecimal quantity, String batchNumber) {
        var itemEntity = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemId));

        var locationEntity = locationRepository.findById(locationId)
                .orElseThrow(() -> new IllegalArgumentException("Location not found: " + locationId));

        StockEntity stockEntity = new StockEntity();
        stockEntity.setItem(itemEntity);
        stockEntity.setLocation(locationEntity);
        stockEntity.setBatchNumber(batchNumber);
        stockEntity.setStatus(StockEntity.StockStatus.AVAILABLE);
        stockEntity.setQuantity(quantity);
        if (locationEntity.getCurrentVolume() == null) {
            locationEntity.setCurrentVolume(BigDecimal.ZERO);
        }

        StockEntity saved = stockRepository.save(stockEntity);

        // Log Movement
        StockMovementEntity movement = new StockMovementEntity();
        movement.setItemId(itemEntity.getId());
        movement.setDestLocationId(locationEntity.getId());
        movement.setQuantity(quantity);
        movement.setReason("INBOUND");
        movement.setOperatorName("System"); // Replace with auth context later
        movementRepository.save(movement);

        // Update Location Volume & Status
        updateLocationVolumeAndStatus(locationEntity, quantity, itemEntity.getUnitVolume(), true);

        return stockMapper.toDomain(saved);
    }

    private void updateLocationVolumeAndStatus(WarehouseLocationEntity location, BigDecimal quantity,
            BigDecimal unitVolume,
            boolean isAdding) {
        if (location.getCurrentVolume() == null) {
            location.setCurrentVolume(BigDecimal.ZERO);
        }

        if (unitVolume == null)
            unitVolume = BigDecimal.ONE; // Fallback
        BigDecimal totalVolume = quantity.multiply(unitVolume);

        if (isAdding) {
            BigDecimal newVolume = location.getCurrentVolume().add(totalVolume);
            if (location.getCapacityVolume() != null && newVolume.compareTo(location.getCapacityVolume()) > 0) {
                throw new IllegalArgumentException("Location capacity exceeded. Max: " + location.getCapacityVolume()
                        + ", Current: " + location.getCurrentVolume() + ", Adding: " + totalVolume);
            }
            location.setCurrentVolume(newVolume);
        } else {
            location.setCurrentVolume(location.getCurrentVolume().subtract(totalVolume));
            if (location.getCurrentVolume().compareTo(BigDecimal.ZERO) < 0) {
                location.setCurrentVolume(BigDecimal.ZERO);
            }
        }

        if (location.getCurrentVolume().compareTo(BigDecimal.ZERO) > 0) {
            if (location.getCapacityVolume() != null
                    && location.getCurrentVolume().compareTo(location.getCapacityVolume()) >= 0) {
                location.setStatus(WarehouseLocationEntity.LocationStatus.FULL);
            } else {
                location.setStatus(WarehouseLocationEntity.LocationStatus.OCCUPIED);
            }
        } else {
            location.setStatus(WarehouseLocationEntity.LocationStatus.FREE);
        }

        locationRepository.save(location);
    }

    @Override
    @Transactional
    public Stock moveStockByCode(String itemCode, String sourceLocationCode, String targetLocationCode,
            BigDecimal quantity) {
        // Resolve entities
        var item = itemRepository.findByInternalCode(itemCode)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemCode));

        // Find source stock
        // Heuristic: Find all stock for this item in this location
        // NOTE: We need location ID first
        var sourceLoc = locationRepository.findByCode(sourceLocationCode)
                .orElseThrow(() -> new IllegalArgumentException("Source Location not found: " + sourceLocationCode));

        var targetLoc = locationRepository.findByCode(targetLocationCode)
                .orElseThrow(() -> new IllegalArgumentException("Target Location not found: " + targetLocationCode));

        // Find stock records in source location
        List<StockEntity> stocks = stockRepository.findByLocationId(sourceLoc.getId());

        // Filter by item and sort by quantity (optional heuristic)
        List<StockEntity> sourceStocks = stocks.stream()
                .filter(s -> s.getItem().getId().equals(item.getId()))
                .filter(s -> s.getQuantity().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toList());

        if (sourceStocks.isEmpty()) {
            throw new IllegalArgumentException("No stock found for item " + itemCode + " in " + sourceLocationCode);
        }

        BigDecimal totalAvailable = sourceStocks.stream()
                .map(StockEntity::getQuantity)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalAvailable.compareTo(quantity) < 0) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Available: " + totalAvailable + ", Requested: " + quantity);
        }

        BigDecimal remainingToMove = quantity;
        Stock lastMovedStock = null;

        for (StockEntity stock : sourceStocks) {
            if (remainingToMove.compareTo(BigDecimal.ZERO) <= 0)
                break;

            BigDecimal amountFromThisStock = stock.getQuantity().min(remainingToMove);

            // We use the ID-based moveStock for the actual movement of THIS chunk
            // Note: This is slightly inefficient as it re-fetches entities, but safe
            // reusing logic.
            // Improvement: Refactor moveStock to take Entity, or duplicate logic here.
            // For safety and time, we call moveStock.
            lastMovedStock = moveStock(stock.getId(), targetLoc.getId(), amountFromThisStock);

            remainingToMove = remainingToMove.subtract(amountFromThisStock);
        }

        return lastMovedStock; // Return the last affected stock (target state)
    }

    @Override
    @Transactional
    public Stock moveStock(UUID stockId, UUID targetLocationId, BigDecimal quantity) {
        StockEntity sourceStock = stockRepository.findById(stockId)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found: " + stockId));

        WarehouseLocationEntity targetLocation = locationRepository.findById(targetLocationId)
                .orElseThrow(() -> new IllegalArgumentException("Target Location not found: " + targetLocationId));

        // Logic:
        // 1. Check quantity availability
        if (sourceStock.getQuantity().compareTo(quantity) < 0) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + sourceStock.getQuantity());
        }

        // 2. Decrement source
        sourceStock.setQuantity(sourceStock.getQuantity().subtract(quantity));
        if (sourceStock.getQuantity().compareTo(BigDecimal.ZERO) == 0) {
            stockRepository.delete(sourceStock);
        } else {
            stockRepository.save(sourceStock);
        }

        // Update Source Location
        WarehouseLocationEntity sourceLocation = sourceStock.getLocation();
        updateLocationVolumeAndStatus(sourceLocation, quantity, sourceStock.getItem().getUnitVolume(), false);

        // 3. Increment/Create target
        // For MVP, simplistic check if matching item exists in location (simple merge)
        // Ideally should check batch/expiry too.
        List<StockEntity> existingInTarget = stockRepository.findByLocationId(targetLocationId);
        StockEntity targetStock = existingInTarget.stream()
                .filter(s -> s.getItem().getId().equals(sourceStock.getItem().getId()))
                .filter(s -> isSameBatch(s, sourceStock))
                .findFirst()
                .orElse(null);

        if (targetStock == null) {
            targetStock = new StockEntity();
            targetStock.setItem(sourceStock.getItem());
            targetStock.setLocation(targetLocation);
            targetStock.setQuantity(quantity);
            targetStock.setBatchNumber(sourceStock.getBatchNumber());
            targetStock.setStatus(sourceStock.getStatus());
        } else {
            targetStock.setQuantity(targetStock.getQuantity().add(quantity));
        }

        StockEntity savedTarget = stockRepository.save(targetStock);

        // Update Target Location
        updateLocationVolumeAndStatus(targetLocation, quantity, sourceStock.getItem().getUnitVolume(), true);

        // Log Movement
        StockMovementEntity movement = new StockMovementEntity();
        movement.setItemId(sourceStock.getItem().getId());
        movement.setSourceLocationId(sourceStock.getLocation().getId());
        movement.setDestLocationId(targetLocation.getId());
        movement.setQuantity(quantity);
        movement.setReason("MOVE");
        movement.setOperatorName("System");
        movementRepository.save(movement);

        return stockMapper.toDomain(savedTarget);
    }

    private boolean isSameBatch(StockEntity s1, StockEntity s2) {
        if (s1.getBatchNumber() == null && s2.getBatchNumber() == null)
            return true;
        if (s1.getBatchNumber() != null && s2.getBatchNumber() != null)
            return s1.getBatchNumber().equals(s2.getBatchNumber());
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Stock> getStockByLocation(UUID locationId) {
        return stockRepository.findByLocationId(locationId).stream()
                .map(stockMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Stock> getStockByItem(String itemCode) {
        var item = itemRepository.findByInternalCode(itemCode)
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + itemCode));

        // Naive implementation: fetch all and filter. optimize later with repo method
        return stockRepository.findAll().stream()
                .filter(s -> s.getItem().getId().equals(item.getId()))
                .map(stockMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Stock> findAll() {
        return stockRepository.findAll().stream()
                .map(stockMapper::toDomain)
                .toList();
    }
}
