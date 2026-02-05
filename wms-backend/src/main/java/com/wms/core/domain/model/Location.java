package com.wms.core.domain.model;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
@ToString
public class Location {
    private UUID id;
    private String code;
    private String description;
    private UUID parentId;
    private LocationType type;
    private LocationStatus status;
    private BigDecimal capacityVolume;
    private BigDecimal currentVolume;

    public boolean isFree() {
        return LocationStatus.FREE.equals(this.status);
    }

    public enum LocationType {
        SITE, AREA, AISLE, RACK, LEVEL, BIN
    }

    public enum LocationStatus {
        FREE, OCCUPIED, FULL, BLOCKED
    }
}
