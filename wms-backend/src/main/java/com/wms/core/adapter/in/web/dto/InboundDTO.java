package com.wms.core.adapter.in.web.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

public class InboundDTO {

    @Data
    @Builder
    public static class ConfirmPutawayRequest {
        private UUID itemId;
        private UUID locationId;
        private BigDecimal quantity;
        private String batchNumber;
    }
}
