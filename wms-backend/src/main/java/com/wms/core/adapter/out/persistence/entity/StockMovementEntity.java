package com.wms.core.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_movement")
@Getter
@Setter
public class StockMovementEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "item_id", nullable = false)
    private UUID itemId;

    @Column(name = "source_location_id")
    private UUID sourceLocationId;

    @Column(name = "dest_location_id")
    private UUID destLocationId;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(nullable = false)
    private String reason; // INBOUND, OUTBOUND, MOVE

    @Column(name = "operator_name")
    private String operatorName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
