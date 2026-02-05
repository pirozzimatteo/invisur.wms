package com.wms.core.domain.service;

import com.wms.core.adapter.out.persistence.entity.WarehouseLocationEntity;
import com.wms.core.adapter.out.persistence.mapper.LocationMapper;
import com.wms.core.adapter.out.persistence.repository.WarehouseLocationRepository;
import com.wms.core.domain.model.Location;
import com.wms.core.domain.port.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final WarehouseLocationRepository locationRepository;
    private final LocationMapper locationMapper;

    @Override
    @Transactional
    public Location createLocation(Location location) {
        if (locationRepository.existsByCode(location.getCode())) {
            throw new IllegalArgumentException("Location code already exists: " + location.getCode());
        }
        WarehouseLocationEntity entity = locationMapper.toEntity(location);

        // Manual parent resolution since Mapper ignores it (and might not have context)
        if (location.getParentId() != null) {
            WarehouseLocationEntity parent = locationRepository.findById(location.getParentId())
                    .orElseThrow(
                            () -> new IllegalArgumentException("Parent location not found: " + location.getParentId()));
            entity.setParent(parent);
        }

        // Simple logic: new location is FREE by default if not specified
        if (entity.getStatus() == null) {
            entity.setStatus(WarehouseLocationEntity.LocationStatus.FREE);
        }
        WarehouseLocationEntity saved = locationRepository.save(entity);
        return locationMapper.toDomain(saved);
    }

    @Override
    @Transactional
    public Location updateLocation(UUID id, Location location) {
        WarehouseLocationEntity entity = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found with ID: " + id));

        // Update fields (not code/type/parentId usually)
        // Allowing Code update if unique? No, safe to keep immutable for now or
        // strictly checked.
        // User asked to edit logic. Assuming description and capacity update.
        // Code update is risky if it breaks uniqueness. Let's allow description and
        // capacity.

        entity.setDescription(location.getDescription());
        entity.setCapacityVolume(location.getCapacityVolume());

        // If code update happens:
        if (!entity.getCode().equals(location.getCode())) {
            if (locationRepository.existsByCode(location.getCode())) {
                throw new IllegalArgumentException("Location code already exists: " + location.getCode());
            }
            entity.setCode(location.getCode());
        }

        WarehouseLocationEntity saved = locationRepository.save(entity);
        return locationMapper.toDomain(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Location> findAll() {
        return locationRepository.findAll().stream()
                .map(locationMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Location findById(UUID id) {
        return locationRepository.findById(id)
                .map(locationMapper::toDomain)
                .orElseThrow(() -> new RuntimeException("Location not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Location> findByType(Location.LocationType type) {
        // Map domain enum to entity enum
        WarehouseLocationEntity.LocationType entityType = WarehouseLocationEntity.LocationType.valueOf(type.name());
        return locationRepository.findByType(entityType).stream()
                .map(locationMapper::toDomain)
                .toList();
    }
}
