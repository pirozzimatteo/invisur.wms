package com.wms.core.domain.port;

import com.wms.core.domain.model.OutboundOrder;
import com.wms.core.domain.model.PickingTask;

import java.util.List;
import java.util.UUID;

public interface OutboundService {
    List<OutboundOrder> getAllOrders();

    void createOrder(com.wms.core.adapter.in.web.dto.OutboundDTO.CreateOrderRequest request);

    List<PickingTask> getPendingTasks();

    void confirmTask(UUID taskId);

    void shipOrder(UUID orderId);
}
