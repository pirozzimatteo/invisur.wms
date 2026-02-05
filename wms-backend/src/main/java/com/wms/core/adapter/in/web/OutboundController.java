package com.wms.core.adapter.in.web;

import com.wms.core.domain.model.OutboundOrder;
import com.wms.core.domain.model.PickingTask;
import com.wms.core.domain.port.OutboundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/outbound")
@RequiredArgsConstructor
public class OutboundController {

    private final OutboundService outboundService;

    @PostMapping("/orders")
    public ResponseEntity<Void> createOrder(
            @RequestBody com.wms.core.adapter.in.web.dto.OutboundDTO.CreateOrderRequest request) {

        // Delegate DTO to Service
        outboundService.createOrder(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OutboundOrder>> getAllOrders() {
        return ResponseEntity.ok(outboundService.getAllOrders());
    }

    @GetMapping("/picking-tasks")
    public ResponseEntity<List<com.wms.core.adapter.in.web.dto.PickingTaskDTO>> getPendingTasks() {
        var tasks = outboundService.getPendingTasks();
        var dtos = tasks.stream()
                .map(this::toDTO)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private com.wms.core.adapter.in.web.dto.PickingTaskDTO toDTO(PickingTask task) {
        return com.wms.core.adapter.in.web.dto.PickingTaskDTO.builder()
                .id(task.getId())
                .orderId(task.getOrderId() != null ? task.getOrderId().toString() : "")
                .itemCode(task.getItem() != null ? task.getItem().getInternalCode() : "")
                .locationCode(task.getLocation() != null ? task.getLocation().getCode() : "")
                .targetQuantity(task.getTargetQuantity())
                .status(task.getStatus().name())
                .build();
    }

    @PostMapping("/tasks/{taskId}/confirm")
    public ResponseEntity<Void> confirmTask(@PathVariable UUID taskId) {
        outboundService.confirmTask(taskId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/orders/{orderId}/ship")
    public ResponseEntity<Void> shipOrder(@PathVariable UUID orderId) {
        outboundService.shipOrder(orderId);
        return ResponseEntity.ok().build();
    }
}
