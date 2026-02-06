package com.wms.core.domain.port;

import com.wms.core.domain.model.Item;
import java.util.List;
import java.util.UUID;

public interface ItemService {
    Item createItem(Item item);

    Item updateItem(UUID id, Item item);

    List<Item> findAll();

    List<Item> getLowStockItems();

    Item findById(UUID id);

    Item findByInternalCode(String internalCode);
}
