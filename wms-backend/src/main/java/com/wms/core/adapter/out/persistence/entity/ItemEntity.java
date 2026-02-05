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
@Table(name = "item")
@Getter
@Setter
public class ItemEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "internal_code", nullable = false, unique = true)
    private String internalCode;

    @Column(nullable = false)
    private String description;

    private String category;

    @Column(name = "unit_of_measure", nullable = false)
    private String unitOfMeasure; // e.g., "PCS", "KG"

    @Column(name = "unit_volume")
    private BigDecimal unitVolume; // e.g., 0.1 m3 per unit

    @Column(name = "reorder_point")
    private BigDecimal reorderPoint; // Low stock threshold

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
