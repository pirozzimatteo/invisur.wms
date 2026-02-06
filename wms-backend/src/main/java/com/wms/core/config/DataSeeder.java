package com.wms.core.config;

import com.wms.core.adapter.out.persistence.entity.AppUser;
import com.wms.core.adapter.out.persistence.entity.ItemEntity;
import com.wms.core.adapter.out.persistence.entity.WarehouseLocationEntity;
import com.wms.core.adapter.out.persistence.repository.ItemRepository;
import com.wms.core.adapter.out.persistence.repository.UserRepository;
import com.wms.core.adapter.out.persistence.repository.WarehouseLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final WarehouseLocationRepository locationRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // Seed Admin User
        if (userRepository.findByUsername("admin").isEmpty()) {
            var admin = AppUser.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("password"))
                    .role(AppUser.Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            System.out.println("ADMIN USER CREATED (admin/password)");
        }

        // if (locationRepository.count() > 0) {
        // return; // Already seeded
        // }

        // System.out.println("SEEDING DATA...");

        // // Root
        // var site = createLocation("SITE-1", "MAIN HUB", "SITE", null);

        // // Area A
        // var areaA = createLocation("AREA-A", "Electronics", "AREA", site);
        // var aisleA1 = createLocation("AISLE-A-01", "Aisle 1", "AISLE", areaA);

        // // Bins
        // createLocation("A-01-01-A", "Bin A1", "BIN", aisleA1);
        // createLocation("A-01-01-B", "Bin A2", "BIN", aisleA1);

        // // Area B
        // var areaB = createLocation("AREA-B", "Heavy Goods", "AREA", site);
        // createLocation("B-01-01-A", "Bin B1", "BIN", createLocation("AISLE-B-01",
        // "Aisle 1", "AISLE", areaB));

        // // Items
        // createItem("ITEM-001", "Wireless Mouse", "Electronics", "PCS");
        // createItem("ITEM-002", "Mechanical Keyboard", "Electronics", "PCS");
        // createItem("ITEM-003", "USB-C Cable", "Accessories", "PCS");
        // createItem("ITEM-004", "Monitor 27 Inch", "Electronics", "PCS");
        // createItem("ITEM-999", "Industrial Pallet", "Heavy", "PALLET");

        // System.out.println("DATA SEEDED COMPLETED.");
    }

    private WarehouseLocationEntity createLocation(String code, String desc, String type,
            WarehouseLocationEntity parent) {
        WarehouseLocationEntity loc = new WarehouseLocationEntity();
        loc.setId(UUID.randomUUID());
        loc.setCode(code);
        loc.setType(WarehouseLocationEntity.LocationType.valueOf(type));
        loc.setStatus(WarehouseLocationEntity.LocationStatus.FREE);
        loc.setCurrentVolume(BigDecimal.ZERO);
        loc.setParent(parent);
        return locationRepository.save(loc);
    }

    private void createItem(String code, String desc, String cat, String uom) {
        ItemEntity item = new ItemEntity();
        item.setId(UUID.randomUUID());
        item.setInternalCode(code);
        item.setDescription(desc);
        item.setCategory(cat);
        item.setUnitOfMeasure(uom);
        itemRepository.save(item);
    }
}
