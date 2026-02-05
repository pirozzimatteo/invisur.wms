package com.wms.core.domain.model;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class Stock {
    private UUID id;
    private Item item;
    private Location location;
    private BigDecimal quantity;
    private String batchNumber;
    private String serialNumber;
    private StockStatus status;
    private LocalDateTime expiryDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum StockStatus {
        AVAILABLE, ALLOCATED, QUARANTINE, BLOCKED
    }
}
