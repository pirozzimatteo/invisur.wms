package com.wms.core.adapter.in.web;

import com.wms.core.adapter.in.web.dto.AuthDTO;
import com.wms.core.domain.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthDTO.AuthenticationResponse> register(
            @RequestBody AuthDTO.RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDTO.AuthenticationResponse> authenticate(
            @RequestBody AuthDTO.AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }
}
