package com.wms.core.adapter.out.persistence.mapper;

import com.wms.core.adapter.out.persistence.entity.OutboundOrderEntity;
import com.wms.core.adapter.out.persistence.entity.OutboundLineEntity;
import com.wms.core.adapter.out.persistence.entity.PickingTaskEntity;
import com.wms.core.domain.model.OutboundOrder;
import com.wms.core.domain.model.PickingTask;
import com.wms.core.adapter.out.persistence.mapper.LocationMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { ItemMapper.class, LocationMapper.class })
public interface OutboundMapper {

    @Mapping(target = "lines", source = "lines")
    OutboundOrder toDomain(OutboundOrderEntity entity);

    @Mapping(target = "order", ignore = true)
    OutboundLineEntity toEntity(OutboundOrder.OutboundLine domain);

    @Mapping(target = "item", source = "item")
    OutboundOrder.OutboundLine toDomainLine(OutboundLineEntity entity);

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "location", source = "sourceLocation")
    PickingTask toDomain(PickingTaskEntity entity);
}
