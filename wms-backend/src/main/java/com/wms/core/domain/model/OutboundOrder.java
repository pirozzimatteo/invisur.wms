package com.wms.core.domain.model;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class OutboundOrder {
    private UUID id;
    private String orderNumber;
    private String customerId;
    private OrderStatus status;
    private List<OutboundLine> lines;
    private LocalDateTime createdAt;

    public enum OrderStatus {
        NEW, PLANNED, PICKING, PICKED, SHIPPED, COMPLETED
    }

    @Data
    @Builder
    public static class OutboundLine {
        private UUID id;
        private Item item;
        private int orderedQuantity;
        private int pickedQuantity;
    }
}
