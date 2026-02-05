package com.wms.core.adapter.in.web.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMoveDTO {
    private String itemCode;
    private String sourceLocationCode;
    private String targetLocationCode;
    private BigDecimal quantity;
}
