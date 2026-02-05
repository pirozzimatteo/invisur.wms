package com.wms.core.domain.model;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class Item {
    private UUID id;
    private String internalCode;
    private String description;
    private String category;
    private String unitOfMeasure;
    private java.math.BigDecimal reorderPoint;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
