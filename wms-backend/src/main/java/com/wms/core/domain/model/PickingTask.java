package com.wms.core.domain.model;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PickingTask {
    private UUID id;
    private UUID orderId;
    private UUID stockId;
    private Item item;
    private Location location; // Source implementation
    private int targetQuantity;
    private TaskStatus status;

    public enum TaskStatus {
        PENDING, ASSIGNED, COMPLETED, CANCELLED
    }
}
