package com.wms.core.adapter.out.persistence.mapper;

import com.wms.core.adapter.out.persistence.entity.StockEntity;
import com.wms.core.domain.model.Stock;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = { ItemMapper.class, LocationMapper.class })
public interface StockMapper {

    @Mapping(target = "item", source = "item")
    @Mapping(target = "location", source = "location")
    StockEntity toEntity(Stock domain);

    @Mapping(target = "item", source = "item")
    @Mapping(target = "location", source = "location")
    Stock toDomain(StockEntity entity);
}
