package com.ordering.controller;

import com.ordering.dto.ApiResponse;
import com.ordering.dto.CartItemDTO;
import com.ordering.service.CartLongPollingService;
import com.ordering.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.async.DeferredResult;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * 购物车控制器
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final CartLongPollingService cartLongPollingService;

    /**
     * 获取购物车（普通接口）
     */
    @GetMapping
    public ApiResponse<List<CartItemDTO>> getCart(@AuthenticationPrincipal Long userId) {
        List<CartItemDTO> cartItems = cartService.getCart(userId);
        return ApiResponse.success(cartItems);
    }

    /**
     * 长轮询获取购物车
     * 阻塞请求最多60秒，购物车有变化时立即返回
     */
    @GetMapping("/long-poll")
    public DeferredResult<ApiResponse<List<CartItemDTO>>> longPollCart(
            @AuthenticationPrincipal Long userId) {

        DeferredResult<List<CartItemDTO>> deferred = cartLongPollingService.longPollCart(userId);

        // 包装为 DeferredResult<ApiResponse>
        DeferredResult<ApiResponse<List<CartItemDTO>>> result = new DeferredResult<>(65000L);

        deferred.setResultHandler(data -> {
            @SuppressWarnings("unchecked")
            List<CartItemDTO> cartItems = (List<CartItemDTO>) data;
            result.setResult(ApiResponse.success(cartItems));
        });

        deferred.onTimeout(() -> {
            // 超时后返回当前购物车数据
            List<CartItemDTO> cartItems = cartService.getCart(userId);
            result.setResult(ApiResponse.success(cartItems));
        });

        return result;
    }

    /**
     * 添加商品到购物车
     */
    @PostMapping("/items")
    public ApiResponse<CartItemDTO> addToCart(
            @AuthenticationPrincipal Long userId,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        CartItemDTO item = cartService.addToCart(userId, productId, quantity);
        return ApiResponse.success(item);
    }

    /**
     * 更新购物车商品数量
     */
    @PutMapping("/items/{id}")
    public ApiResponse<CartItemDTO> updateQuantity(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        CartItemDTO item = cartService.updateQuantity(id, quantity);
        return ApiResponse.success(item);
    }

    /**
     * 删除购物车商品
     */
    @DeleteMapping("/items/{id}")
    public ApiResponse<Void> removeFromCart(@PathVariable Long id) {
        cartService.removeFromCart(id);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("删除成功");
        return response;
    }

    /**
     * 清空购物车
     */
    @PostMapping("/clear")
    public ApiResponse<Void> clearCart(@AuthenticationPrincipal Long userId) {
        cartService.clearCart(userId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("清空成功");
        return response;
    }
}
