package com.wms.core.adapter.in.web.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PickingTaskDTO {
    private UUID id;
    private String orderId; // or UUID
    private String itemCode;
    private String locationCode;
    private int targetQuantity;
    private String status;
}
