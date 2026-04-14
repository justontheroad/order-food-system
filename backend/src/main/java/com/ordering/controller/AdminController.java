package com.ordering.controller;

import com.ordering.dto.ApiResponse;
import com.ordering.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 管理员控制器
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * 管理员登录 (RSA 加密密码)
     */
    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        try {
            Map<String, Object> result = adminService.login(username, password);
            return ApiResponse.success(result);
        } catch (RuntimeException e) {
            return ApiResponse.error(401, e.getMessage());
        }
    }

    /**
     * 获取 RSA 公钥
     */
    @GetMapping("/publicKey")
    public ApiResponse<String> getPublicKey() {
        return ApiResponse.success(adminService.getPublicKey());
    }

    /**
     * 获取管理员信息
     */
    @GetMapping("/info")
    public ApiResponse<Map<String, Object>> getAdminInfo() {
        Map<String, Object> info = Map.of(
            "username", "admin",
            "role", "admin"
        );
        return ApiResponse.success(info);
    }
}
