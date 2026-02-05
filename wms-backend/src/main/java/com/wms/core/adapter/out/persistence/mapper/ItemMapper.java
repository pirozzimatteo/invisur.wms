package com.wms.core.adapter.out.persistence.mapper;

import com.wms.core.adapter.out.persistence.entity.ItemEntity;
import com.wms.core.domain.model.Item;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ItemMapper {

    ItemEntity toEntity(Item domain);

    Item toDomain(ItemEntity entity);
}
