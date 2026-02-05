package com.wms.core.adapter.out.persistence.repository;

import com.wms.core.adapter.out.persistence.entity.StockMovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovementEntity, UUID> {
    List<StockMovementEntity> findTop5ByOrderByCreatedAtDesc();
}
