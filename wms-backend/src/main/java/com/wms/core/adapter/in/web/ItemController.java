package com.wms.core.adapter.in.web;

import com.wms.core.adapter.in.web.dto.ItemDTO;
import com.wms.core.domain.model.Item;
import com.wms.core.domain.port.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ItemDTO.Response createItem(@RequestBody ItemDTO.CreateRequest request) {
        Item domain = Item.builder()
                .internalCode(request.getInternalCode())
                .description(request.getDescription())
                .category(request.getCategory())
                .unitOfMeasure(request.getUnitOfMeasure())
                .reorderPoint(request.getReorderPoint())
                .build();

        Item created = itemService.createItem(domain);
        return mapToResponse(created);
    }

    @GetMapping
    public List<ItemDTO.Response> getAllItems() {
        return itemService.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/low-stock")
    public List<ItemDTO.Response> getLowStockItems() {
        return itemService.getLowStockItems().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id:[a-fA-F0-9-]{36}}")
    public ItemDTO.Response getItem(@PathVariable UUID id) {
        return mapToResponse(itemService.findById(id));
    }

    @GetMapping("/resolve/{code}")
    public ItemDTO.Response resolveItem(@PathVariable String code) {
        // For MVP 1 w/o Alias, we just search by internal code.
        // TODO: Integrate ItemReference lookup here later.
        return mapToResponse(itemService.findByInternalCode(code));
    }

    private ItemDTO.Response mapToResponse(Item domain) {
        return ItemDTO.Response.builder()
                .id(domain.getId())
                .internalCode(domain.getInternalCode())
                .description(domain.getDescription())
                .category(domain.getCategory())
                .unitOfMeasure(domain.getUnitOfMeasure())
                .reorderPoint(domain.getReorderPoint())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }

    @PutMapping("/{id:[a-fA-F0-9-]{36}}")
    public ItemDTO.Response updateItem(@PathVariable UUID id, @RequestBody ItemDTO.UpdateRequest request) {
        Item domain = Item.builder()
                .description(request.getDescription())
                .category(request.getCategory())
                .unitOfMeasure(request.getUnitOfMeasure())
                .reorderPoint(request.getReorderPoint())
                .build();
        return mapToResponse(itemService.updateItem(id, domain));
    }

}
