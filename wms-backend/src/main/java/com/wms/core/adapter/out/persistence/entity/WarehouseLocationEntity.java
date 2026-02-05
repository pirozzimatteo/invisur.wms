package com.wms.core.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "warehouse_location")
@Getter
@Setter
public class WarehouseLocationEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private WarehouseLocationEntity parent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LocationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LocationStatus status;

    @Column(name = "capacity_volume")
    private BigDecimal capacityVolume;

    @Column(name = "current_volume")
    private BigDecimal currentVolume;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum LocationType {
        SITE, AREA, AISLE, RACK, LEVEL, BIN
    }

    public enum LocationStatus {
        FREE, OCCUPIED, FULL, BLOCKED
    }
}
