package com.sunrise.inventory_management_system.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:8080", allowCredentials = "true") // Crucial for cookie handling
public class AuthController {

    /**
     * Fakes the "Unlock" action.
     * When the user clicks "Unlock" on the frontend, we just say "Success".
     */
    @PostMapping("/unlock")
    public Map<String, Object> unlock() {
        // In a real app, you would check the password here.
        // For now, we just let everyone in.
        return Map.of(
                "success", true,
                "message", "Bypassed for Development"
        );
    }

    /**
     * Fakes the "Check Auth" action.
     * The Frontend calls this every time you refresh the page to see if it should show the dashboard.
     */
    @GetMapping("/check-auth")
    public Map<String, Boolean> checkAuth() {
        // Always return true so the frontend thinks we are logged in.
        return Map.of("authenticated", true);
    }

    /**
     * Fakes the "Logout" action.
     */
    @PostMapping("/logout")
    public Map<String, Boolean> logout() {
        return Map.of("success", true);
    }
}