package com.wms.core.adapter.in.web.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class ItemDTO {

    @Data
    @Builder
    public static class CreateRequest {
        private String internalCode;
        private String description;
        private String category;
        private String unitOfMeasure;
        private java.math.BigDecimal reorderPoint;
    }

    @Data
    @Builder
    public static class UpdateRequest {
        private String description;
        private String category;
        private String unitOfMeasure;
        private java.math.BigDecimal reorderPoint;
    }

    @Data
    @Builder
    public static class Response {
        private UUID id;
        private String internalCode;
        private String description;
        private String category;
        private String unitOfMeasure;
        private java.math.BigDecimal reorderPoint;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
