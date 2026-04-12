package com.ordering.controller;

import com.ordering.dto.ApiResponse;
import com.ordering.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 支付控制器
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * 微信支付下单
     */
    @PostMapping("/wechat")
    public ApiResponse<Map<String, Object>> createWechatPayOrder(
            @RequestParam Long orderId,
            @AuthenticationPrincipal Long userId) {
        Map<String, Object> result = paymentService.createWechatPayOrder(orderId, userId);
        return ApiResponse.success(result);
    }

    /**
     * 微信支付回调
     */
    @PostMapping("/callback/wechat")
    public ApiResponse<Void> wechatPayCallback(@RequestBody Map<String, Object> callbackData) {
        paymentService.wechatPayCallback(callbackData);
        return ApiResponse.success("success", null);
    }

    /**
     * 查询支付状态
     */
    @GetMapping("/status/{orderId}")
    public ApiResponse<Integer> getPaymentStatus(@PathVariable Long orderId) {
        Integer status = paymentService.getPaymentStatus(orderId);
        return ApiResponse.success(status);
    }
}