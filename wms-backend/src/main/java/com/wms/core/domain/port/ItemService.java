package com.wms.core.domain.port;

import com.wms.core.domain.model.Item;
import java.util.List;
import java.util.UUID;

public interface ItemService {
    Item createItem(Item item);

    List<Item> findAll();

    Item findById(UUID id);

    Item findByInternalCode(String internalCode);
}
