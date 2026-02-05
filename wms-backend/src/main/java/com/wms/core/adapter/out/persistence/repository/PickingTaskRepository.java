package com.wms.core.adapter.out.persistence.repository;

import com.wms.core.adapter.out.persistence.entity.PickingTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PickingTaskRepository extends JpaRepository<PickingTaskEntity, UUID> {
    List<PickingTaskEntity> findByStatus(PickingTaskEntity.TaskStatus status);

    List<PickingTaskEntity> findByOrderId(UUID orderId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.targetQuantity), 0) FROM PickingTaskEntity t WHERE t.item.id = :itemId AND t.status = 'PENDING'")
    Integer getReservedQuantityByItem(@org.springframework.data.repository.query.Param("itemId") UUID itemId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(t.targetQuantity), 0) FROM PickingTaskEntity t WHERE t.item.id = :itemId AND t.sourceLocation.id = :locationId AND t.status = 'PENDING'")
    Integer getReservedQuantityByItemAndLocation(@org.springframework.data.repository.query.Param("itemId") UUID itemId,
            @org.springframework.data.repository.query.Param("locationId") UUID locationId);
}
