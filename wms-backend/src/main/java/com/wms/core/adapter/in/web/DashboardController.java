package com.wms.core.adapter.in.web;

import com.wms.core.adapter.out.persistence.repository.ItemRepository;
import com.wms.core.adapter.out.persistence.repository.OutboundOrderRepository;
import com.wms.core.adapter.out.persistence.repository.StockRepository;
import com.wms.core.adapter.out.persistence.repository.PickingTaskRepository;
import com.wms.core.adapter.out.persistence.entity.PickingTaskEntity;
import com.wms.core.adapter.out.persistence.entity.StockMovementEntity;
import com.wms.core.adapter.out.persistence.entity.WarehouseLocationEntity;
import com.wms.core.adapter.out.persistence.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final ItemRepository itemRepository;
    private final OutboundOrderRepository orderRepository;
    private final StockRepository stockRepository;
    private final PickingTaskRepository taskRepository;
    private final StockMovementRepository movementRepository;
    private final WarehouseLocationRepository locationRepository;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        // Real counts from DB
        // Total Items -> now Total Units of Stock
        BigDecimal totalStockUnits = stockRepository.sumTotalQuantity();

        // Pending Orders (NEW, PLANNED, PICKING)
        long pendingOrders = orderRepository.countByStatusIn(List.of(
                com.wms.core.adapter.out.persistence.entity.OutboundOrderEntity.OrderStatus.NEW,
                com.wms.core.adapter.out.persistence.entity.OutboundOrderEntity.OrderStatus.PLANNED,
                com.wms.core.adapter.out.persistence.entity.OutboundOrderEntity.OrderStatus.PICKING));

        long pendingTasks = taskRepository.findByStatus(PickingTaskEntity.TaskStatus.PENDING).size();

        // Low Stock: Items with < reorderPoint (default 10)
        long lowStockAlerts = stockRepository.countLowStockItems();

        return ResponseEntity.ok(DashboardStatsDTO.builder()
                .totalItems(totalStockUnits.longValue()) // Determine if UI expects quantity or count. Assuming "Total
                                                         // Stock" means units.
                .pendingOrders(pendingOrders)
                .outboundToday(pendingTasks)
                .lowStockAlerts(lowStockAlerts)
                .build());
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<List<ActivityDTO>> getRecentActivity() {
        return ResponseEntity.ok(movementRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(m -> {
                    String sourceLoc = m.getSourceLocationId() != null
                            ? locationRepository.findById(m.getSourceLocationId()).map(l -> l.getCode())
                                    .orElse("Unknown")
                            : null;
                    String targetLoc = m.getDestLocationId() != null
                            ? locationRepository.findById(m.getDestLocationId()).map(l -> l.getCode()).orElse("Unknown")
                            : null;

                    return ActivityDTO.builder()
                            .id(m.getId().toString())
                            .itemCode(itemRepository.findById(m.getItemId()).map(i -> i.getInternalCode())
                                    .orElse("Unknown"))
                            .type(m.getReason())
                            .quantity(m.getQuantity())
                            .sourceLocation(sourceLoc)
                            .targetLocation(targetLoc)
                            .timestamp(m.getCreatedAt().toString())
                            .description(formatDescription(m))
                            .build();
                })
                .collect(Collectors.toList()));
    }

    @GetMapping("/capacity")
    public ResponseEntity<List<ZoneCapacityDTO>> getCapacity() {
        // Fetch all Zones
        List<WarehouseLocationEntity> zones = locationRepository.findByType(WarehouseLocationEntity.LocationType.AREA);
        // Pre-fetch all locations to build stats in memory (avoid N+1 recursion
        // queries)
        // Optimization: For now, we will just fetch all child locations for each zone
        // using a recursive helper or flat list
        // Since we don't have a "findAllDescendants" query easily without CTE, we'll
        // fetch all locations and filter in memory
        List<WarehouseLocationEntity> allLocations = locationRepository.findAll();

        Map<UUID, List<WarehouseLocationEntity>> parentMap = allLocations.stream()
                .filter(l -> l.getParent() != null)
                .collect(Collectors.groupingBy(l -> l.getParent().getId()));

        return ResponseEntity.ok(zones.stream().map(zone -> {

            BigDecimal[] aggregates = new BigDecimal[] { BigDecimal.ZERO, BigDecimal.ZERO }; // [capacity, current]
            aggregateZoneStats(zone.getId(), parentMap, aggregates);

            BigDecimal totalCapacity = aggregates[0];
            BigDecimal totalCurrent = aggregates[1];

            int percentage = 0;
            if (totalCapacity.compareTo(BigDecimal.ZERO) > 0) {
                percentage = totalCurrent.divide(totalCapacity, 2, java.math.RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100")).intValue();
            }

            return ZoneCapacityDTO.builder()
                    .zoneName(
                            zone.getCode() + (zone.getDescription() != null ? " (" + zone.getDescription() + ")" : ""))
                    .percentage(percentage)
                    .build();
        }).collect(Collectors.toList()));
    }

    private void aggregateZoneStats(UUID parentId, Map<UUID, List<WarehouseLocationEntity>> parentMap,
            BigDecimal[] aggregates) {
        List<WarehouseLocationEntity> children = parentMap.get(parentId);
        if (children == null)
            return;

        for (WarehouseLocationEntity child : children) {
            if (child.getCapacityVolume() != null) {
                aggregates[0] = aggregates[0].add(child.getCapacityVolume());
            }
            if (child.getCurrentVolume() != null) {
                aggregates[1] = aggregates[1].add(child.getCurrentVolume());
            }
            // Recurse
            aggregateZoneStats(child.getId(), parentMap, aggregates);
        }
    }

    private String formatDescription(StockMovementEntity m) {
        if ("MOVE".equals(m.getReason())) {
            return "Moved " + m.getQuantity() + " units";
        }
        if ("INBOUND".equals(m.getReason())) {
            return "Received " + m.getQuantity() + " units";
        }
        if ("OUTBOUND".equals(m.getReason())) {
            return "Shipped " + m.getQuantity() + " units";
        }
        return m.getReason();
    }

    @Data
    @Builder
    public static class ActivityDTO {
        private String id;
        private String itemCode;
        private String type;
        private BigDecimal quantity;
        private String sourceLocation;
        private String targetLocation;
        private String timestamp;
        private String description;
    }

    @Data
    @Builder
    public static class ZoneCapacityDTO {
        private String zoneName;
        private int percentage;
    }

    @Data
    @Builder
    public static class DashboardStatsDTO {
        private long totalItems;
        private long pendingOrders;
        private long outboundToday;
        private long lowStockAlerts;
    }
}
