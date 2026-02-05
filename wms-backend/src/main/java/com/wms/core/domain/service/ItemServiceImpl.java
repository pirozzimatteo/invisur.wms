package com.wms.core.domain.service;

import com.wms.core.adapter.out.persistence.entity.ItemEntity;
import com.wms.core.adapter.out.persistence.mapper.ItemMapper;
import com.wms.core.adapter.out.persistence.repository.ItemRepository;
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
    private final ItemMapper itemMapper;

    @Override
    @Transactional
    public Item createItem(Item item) {
        if (itemRepository.findByInternalCode(item.getInternalCode()).isPresent()) {
            throw new IllegalArgumentException("Item with code already exists: " + item.getInternalCode());
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
                .orElseThrow(() -> new RuntimeException("Item not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Item findByInternalCode(String internalCode) {
        return itemRepository.findByInternalCode(internalCode)
                .map(itemMapper::toDomain)
                .orElseThrow(() -> new RuntimeException("Item not found with Code: " + internalCode));
    }
}
