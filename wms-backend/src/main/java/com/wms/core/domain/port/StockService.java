package com.wms.core.domain.port;

import com.wms.core.domain.model.Stock;
import java.math.BigDecimal;
import java.util.UUID;

public interface StockService {
    Stock createStock(UUID itemId, UUID locationId, BigDecimal quantity, String batchNumber);

    Stock moveStock(UUID stockId, UUID targetLocationId, java.math.BigDecimal quantity);

    // New method for easier API usage
    Stock moveStockByCode(String itemCode, String sourceLocationCode, String targetLocationCode,
            java.math.BigDecimal quantity);

    // Visibility
    java.util.List<com.wms.core.domain.model.Stock> getStockByLocation(UUID locationId);

    java.util.List<com.wms.core.domain.model.Stock> getStockByItem(String itemCode);

    // For summary we might need a DTO or a specific Domain object, using generic
    // Object for now or List<Stock>
    java.util.List<com.wms.core.domain.model.Stock> findAll();
}
