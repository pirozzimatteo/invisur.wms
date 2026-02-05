package com.wms.core.adapter.in.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockDTO {
    private UUID id;
    private String itemCode;
    private String locationCode;
    private BigDecimal quantity;
    private String status;
}
