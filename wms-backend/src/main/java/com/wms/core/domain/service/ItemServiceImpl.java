package com.wms.core.domain.service;

import com.wms.core.adapter.out.persistence.entity.ItemEntity;
import com.wms.core.adapter.out.persistence.mapper.ItemMapper;
import com.wms.core.adapter.out.persistence.repository.ItemRepository;
import com.wms.core.adapter.out.persistence.repository.StockRepository;
import com.wms.core.domain.model.Item;
import com.wms.core.domain.port.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final StockRepository stockRepository;
    private final ItemMapper itemMapper;

    @Override
    @Transactional
    public Item createItem(Item item) {
        if (itemRepository.findByInternalCode(item.getInternalCode()).isPresent()) {
            throw new IllegalArgumentException("Esiste già un articolo con codice: " + item.getInternalCode());
        }
        ItemEntity entity = itemMapper.toEntity(item);
        ItemEntity saved = itemRepository.save(entity);
        return itemMapper.toDomain(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Item> findAll() {
        return itemRepository.findAll().stream()
                .map(itemMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Item findById(UUID id) {
        return itemRepository.findById(id)
                .map(itemMapper::toDomain)
                .orElseThrow(() -> new RuntimeException("Articolo non trovato con ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Item findByInternalCode(String internalCode) {
        return itemRepository.findByInternalCode(internalCode)
                .map(itemMapper::toDomain)
                .orElseThrow(() -> new RuntimeException("Articolo non trovato con codice: " + internalCode));
    }

    @Override
    @Transactional
    public Item updateItem(UUID id, Item item) {
        ItemEntity entity = itemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Articolo non trovato con ID: " + id));

        // Update fields
        if (item.getDescription() != null)
            entity.setDescription(item.getDescription());
        if (item.getCategory() != null)
            entity.setCategory(item.getCategory());
        if (item.getUnitOfMeasure() != null)
            entity.setUnitOfMeasure(item.getUnitOfMeasure());
        if (item.getReorderPoint() != null)
            entity.setReorderPoint(item.getReorderPoint());

        return itemMapper.toDomain(itemRepository.save(entity));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Item> getLowStockItems() {
        List<Item> allItems = itemRepository.findAll().stream()
                .map(itemMapper::toDomain)
                .toList();

        List<com.wms.core.adapter.out.persistence.entity.StockEntity> allStocks = stockRepository.findAll();

        return allItems.stream()
                .filter(item -> {
                    java.math.BigDecimal totalStock = allStocks.stream()
                            .filter(s -> s.getItem().getId().equals(item.getId()))
                            .map(s -> s.getQuantity())
                            .reduce(java.math.BigDecimal.ZERO, (a, b) -> a.add(b));

                    java.math.BigDecimal reorderPoint = item.getReorderPoint() != null ? item.getReorderPoint()
                            : java.math.BigDecimal.ZERO;
                    return totalStock.compareTo(reorderPoint) <= 0;
                })
                .collect(java.util.stream.Collectors.toList());
    }
}
