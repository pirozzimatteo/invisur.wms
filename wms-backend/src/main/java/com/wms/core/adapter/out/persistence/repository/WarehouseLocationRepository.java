package com.wms.core.adapter.out.persistence.repository;

import com.wms.core.adapter.out.persistence.entity.WarehouseLocationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarehouseLocationRepository extends JpaRepository<WarehouseLocationEntity, UUID> {
    boolean existsByCode(String code);

    Optional<WarehouseLocationEntity> findByCode(String code);

    List<WarehouseLocationEntity> findByType(WarehouseLocationEntity.LocationType type);

    List<WarehouseLocationEntity> findByParentId(UUID parentId);
}
