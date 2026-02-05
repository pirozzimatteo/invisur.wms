package com.wms.core.domain.port;

import com.wms.core.domain.model.Location;

import java.util.List;
import java.util.UUID;

public interface LocationService {
    Location createLocation(Location location);

    Location updateLocation(UUID id, Location location);

    List<Location> findAll();

    Location findById(UUID id);

    List<Location> findByType(Location.LocationType type);
}
