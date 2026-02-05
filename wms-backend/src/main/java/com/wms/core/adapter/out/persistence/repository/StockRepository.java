package com.wms.core.adapter.out.persistence.repository;

import com.wms.core.adapter.out.persistence.entity.StockEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockRepository extends JpaRepository<StockEntity, UUID> {
    List<StockEntity> findByLocationId(UUID locationId);

    long countByQuantityLessThan(java.math.BigDecimal quantity);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(s.quantity), 0) FROM StockEntity s")
    java.math.BigDecimal sumTotalQuantity();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(i) FROM ItemEntity i WHERE (SELECT COALESCE(SUM(s.quantity), 0) FROM StockEntity s WHERE s.item = i) < COALESCE(i.reorderPoint, 10)")
    long countLowStockItems();
}
