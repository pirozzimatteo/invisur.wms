package com.wms.core.adapter.in.web.dto;

import com.wms.core.domain.model.Location;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

public class LocationDTO {

    @Data
    public static class CreateRequest {
        private String code;
        private String description;
        private UUID parentId;
        private String type; // String to match Enum
        private BigDecimal capacityVolume;
    }

    @Data
    @Builder
    public static class Response {
        private UUID id;
        private String code;
        private String description;
        private UUID parentId;
        private String type;
        private String status;
        private BigDecimal capacityVolume;
        private BigDecimal currentVolume;
    }
}
