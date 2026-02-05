package com.wms.core.adapter.in.web.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

public class OutboundDTO {

    @Data
    public static class CreateOrderRequest {
        private String customerId; // ID or Name for MVP
        private List<OrderLineItem> items;
    }

    @Data
    public static class OrderLineItem {
        private String itemCode;
        private BigDecimal quantity;
        private String sourceLocationCode;
    }
}
