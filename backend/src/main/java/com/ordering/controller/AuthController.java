package com.ordering.controller;

import com.ordering.dto.ApiResponse;
import com.ordering.dto.LoginRequest;
import com.ordering.dto.LoginResponse;
import com.ordering.dto.RegisterRequest;
import com.ordering.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证控制器
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 获取 RSA 公钥
     */
    @GetMapping("/public-key")
    public ApiResponse<Map<String, String>> getPublicKey() {
        String publicKey = authService.getPublicKey();
        Map<String, String> result = new HashMap<>();
        result.put("publicKey", publicKey);
        return ApiResponse.success(result);
    }

    /**
     * 用户登录 (账号/手机号 + 密码)
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ApiResponse.success(response);
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ApiResponse<LoginResponse> register(@RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ApiResponse.success("注册成功", response);
    }

    /**
     * 刷新 Token (预留)
     */
    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(@RequestParam String refreshToken) {
        // TODO: 实现 Token 刷新逻辑
        return ApiResponse.error("暂未实现");
    }

    /**
     * 获取短信验证码 (预留)
     */
    @PostMapping("/sms-code")
    public ApiResponse<Void> getSmsCode(@RequestParam String phone) {
        // TODO: 实现短信验证码发送
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("验证码已发送");
        return response;
    }

    /**
     * 微信登录 (预留)
     */
    @PostMapping("/wechat-login")
    public ApiResponse<LoginResponse> wechatLogin(@RequestParam String code) {
        // TODO: 实现微信登录
        return ApiResponse.error("暂未实现");
    }
}
