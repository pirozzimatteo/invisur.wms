package com.wms.core.domain.service;

import com.wms.core.adapter.in.web.dto.AuthDTO;
import com.wms.core.adapter.out.persistence.entity.AppUser;
import com.wms.core.adapter.out.persistence.repository.UserRepository;
import com.wms.core.config.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthDTO.AuthenticationResponse register(AuthDTO.RegisterRequest request) {
        var user = AppUser.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(AppUser.Role.OPERATOR) // Default role
                .enabled(true)
                .build();
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        return AuthDTO.AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthDTO.AuthenticationResponse authenticate(AuthDTO.AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        return AuthDTO.AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }
}
