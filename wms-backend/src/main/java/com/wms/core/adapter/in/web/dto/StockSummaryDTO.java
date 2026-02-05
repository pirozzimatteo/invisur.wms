package com.wms.core.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockSummaryDTO {
    private String itemCode;
    private String description;
    private int totalQuantity;
    private int locationsCount;
}
