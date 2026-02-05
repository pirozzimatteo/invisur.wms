package com.wms.core.adapter.out.persistence.repository;

import com.wms.core.adapter.out.persistence.entity.OutboundOrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OutboundOrderRepository extends JpaRepository<OutboundOrderEntity, UUID> {

    long countByStatusIn(java.util.Collection<OutboundOrderEntity.OrderStatus> statuses);
}
