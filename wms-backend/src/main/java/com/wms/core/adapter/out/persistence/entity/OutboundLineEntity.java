package com.wms.core.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "outbound_line")
@Getter
@Setter
public class OutboundLineEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OutboundOrderEntity order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private ItemEntity item;

    @Column(name = "ordered_qty", nullable = false)
    private BigDecimal orderedQuantity;

    @Column(name = "picked_qty", nullable = false)
    private BigDecimal pickedQuantity;
}
