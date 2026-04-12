package com.ordering.controller;

import com.ordering.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 管理员控制器
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Value("${admin.username:admin}")
    private String adminUsername;

    @Value("${admin.password:admin123}")
    private String adminPassword;

    /**
     * 管理员登录
     */
    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        if (adminUsername.equals(username) && adminPassword.equals(password)) {
            Map<String, Object> result = new HashMap<>();
            result.put("token", "admin-token-" + System.currentTimeMillis());
            result.put("username", adminUsername);
            return ApiResponse.success(result);
        }

        return ApiResponse.error(401, "用户名或密码错误");
    }

    /**
     * 获取管理员信息
     */
    @GetMapping("/info")
    public ApiResponse<Map<String, Object>> getAdminInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("username", adminUsername);
        info.put("role", "admin");
        return ApiResponse.success(info);
    }
}
