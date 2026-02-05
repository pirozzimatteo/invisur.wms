package com.wms.core.adapter.out.persistence.mapper;

import com.wms.core.adapter.out.persistence.entity.WarehouseLocationEntity;
import com.wms.core.domain.model.Location;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LocationMapper {

    @Mapping(target = "parent", ignore = true) // Handle parent manually or via specific method if needed
    WarehouseLocationEntity toEntity(Location domain);

    @Mapping(target = "parentId", source = "parent.id")
    Location toDomain(WarehouseLocationEntity entity);
}
