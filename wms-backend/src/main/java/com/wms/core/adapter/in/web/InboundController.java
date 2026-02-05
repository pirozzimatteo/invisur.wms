package com.wms.core.adapter.in.web;

import com.wms.core.adapter.in.web.dto.InboundDTO;
import com.wms.core.domain.port.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/inbound")
@RequiredArgsConstructor
public class InboundController {

    private final StockService stockService;

    @PostMapping("/confirm-putaway")
    @ResponseStatus(HttpStatus.CREATED)
    public void confirmPutaway(@RequestBody InboundDTO.ConfirmPutawayRequest request) {
        stockService.createStock(
                request.getItemId(),
                request.getLocationId(),
                request.getQuantity(),
                request.getBatchNumber());
    }
}
