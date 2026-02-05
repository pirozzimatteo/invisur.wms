package com.wms.core.adapter.in.web;

import com.wms.core.domain.model.Stock;
import com.wms.core.domain.port.StockService;
import com.wms.core.adapter.in.web.dto.StockDTO;
import com.wms.core.adapter.in.web.dto.StockSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/stock")
@RequiredArgsConstructor
public class StockController {

        private final StockService stockService;

        @GetMapping("/inventory")
        public ResponseEntity<List<StockSummaryDTO>> getInventorySummary() {
                // Simple aggregation in memory for MVP
                // Real world: SQL Group By
                var allStock = stockService.findAll();

                var summaryMap = allStock.stream()
                                .collect(Collectors.groupingBy(
                                                s -> s.getItem().getInternalCode(),
                                                Collectors.summingInt(s -> s.getQuantity().intValue())));

                // This is a naive implementation, missing Description mapping efficiently
                // For MVP, we'll map back.
                List<StockSummaryDTO> summaries = summaryMap.entrySet().stream()
                                .map(entry -> {
                                        String itemCode = entry.getKey();
                                        int totalQty = entry.getValue();
                                        // Find first stock to get description (inefficient but works for MVP)
                                        String desc = allStock.stream()
                                                        .filter(s -> s.getItem().getInternalCode().equals(itemCode))
                                                        .findFirst()
                                                        .map(s -> s.getItem().getDescription())
                                                        .orElse("Unknown");

                                        long locCount = allStock.stream()
                                                        .filter(s -> s.getItem().getInternalCode().equals(itemCode))
                                                        .count();

                                        return new StockSummaryDTO(itemCode, desc, totalQty, (int) locCount);
                                })
                                .collect(Collectors.toList());

                return ResponseEntity.ok(summaries);
        }

        @GetMapping("/location/{locationId}")
        public ResponseEntity<List<StockDTO>> getStockByLocation(@PathVariable UUID locationId) {
                var stocks = stockService.getStockByLocation(locationId);
                var dtos = stocks.stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(dtos);
        }

        @GetMapping("/item/{itemCode}")
        public ResponseEntity<List<StockDTO>> getStockByItem(@PathVariable String itemCode) {
                var stocks = stockService.getStockByItem(itemCode);
                var dtos = stocks.stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(dtos);
        }

        @PostMapping("/move")
        public ResponseEntity<StockDTO> moveStock(@RequestBody com.wms.core.adapter.in.web.dto.StockMoveDTO request) {
                // Delegate to the new service method that handles resolution by Code
                Stock result = stockService.moveStockByCode(
                                request.getItemCode(),
                                request.getSourceLocationCode(),
                                request.getTargetLocationCode(),
                                request.getQuantity());
                return ResponseEntity.ok(toDTO(result));
        }

        private StockDTO toDTO(Stock stock) {
                return new StockDTO(
                                stock.getId(),
                                stock.getItem().getInternalCode(),
                                stock.getLocation().getCode(),
                                stock.getQuantity(),
                                stock.getStatus().name());
        }
}
