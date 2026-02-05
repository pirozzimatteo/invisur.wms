package com.wms.core.adapter.in.web;

import com.wms.core.adapter.in.web.dto.LocationDTO;
import com.wms.core.domain.model.Location;
import com.wms.core.domain.port.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LocationDTO.Response createLocation(@RequestBody LocationDTO.CreateRequest request) {
        Location domain = Location.builder()
                .code(request.getCode())
                .description(request.getDescription())
                .parentId(request.getParentId())
                .type(Location.LocationType.valueOf(request.getType()))
                .capacityVolume(request.getCapacityVolume())
                .build();

        Location created = locationService.createLocation(domain);
        return mapToResponse(created);
    }

    @PutMapping("/{id}")
    public LocationDTO.Response updateLocation(@PathVariable UUID id, @RequestBody LocationDTO.CreateRequest request) {
        Location domain = Location.builder()
                .id(id)
                .code(request.getCode())
                .description(request.getDescription())
                .parentId(request.getParentId())
                .type(Location.LocationType.valueOf(request.getType()))
                .capacityVolume(request.getCapacityVolume())
                .build();

        Location updated = locationService.updateLocation(id, domain);
        return mapToResponse(updated);
    }

    @GetMapping
    public List<LocationDTO.Response> getAllLocations(@RequestParam(required = false) String type) {
        // If type is present, filter. Ideally Service should handle this.
        // For MVP, filtering in memory or adding service method.
        // Let's add service method findByType if type is present.
        if (type != null) {
            return locationService.findByType(Location.LocationType.valueOf(type)).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        return locationService.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ...

    private LocationDTO.Response mapToResponse(Location domain) {
        return LocationDTO.Response.builder()
                .id(domain.getId())
                .code(domain.getCode())
                .description(domain.getDescription())
                .parentId(domain.getParentId())
                .type(domain.getType().name())
                .status(domain.getStatus().name())
                .capacityVolume(domain.getCapacityVolume())
                .currentVolume(domain.getCurrentVolume())
                .build();
    }
}
