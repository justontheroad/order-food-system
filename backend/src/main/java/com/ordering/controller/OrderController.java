package com.ordering.controller;

import com.ordering.dto.ApiResponse;
import com.ordering.dto.CreateOrderRequest;
import com.ordering.dto.OrderDetailDTO;
import com.ordering.dto.OrderItemRequest;
import com.ordering.entity.Order;
import com.ordering.entity.OrderItem;
import com.ordering.service.CartService;
import com.ordering.service.OrderService;
import com.ordering.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 订单控制器
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final CartService cartService;
    private final PromotionService promotionService;

    /**
     * 创建订单
     */
    @PostMapping
    public ApiResponse<Order> createOrder(
            @AuthenticationPrincipal Long userId,
            @RequestBody CreateOrderRequest request) {

        // 获取购物车商品
        var cartItems = cartService.getCart(userId);
        if (cartItems == null || cartItems.isEmpty()) {
            return ApiResponse.error(400, "购物车为空");
        }

        // 由后端计算优惠金额，不信任前端数据
        BigDecimal totalAmount = request.getTotalAmount();
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal payAmount = totalAmount;

        if (request.getCouponId() != null) {
            // 调用后端预览接口获取实际优惠金额
            var preview = promotionService.previewDiscount(userId, totalAmount, request.getCouponId());
            discountAmount = preview.getDiscountAmount();
            payAmount = preview.getPayAmount();
        }

        Order order = new Order();
        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(discountAmount);
        order.setPayAmount(payAmount);
        order.setRemark(request.getRemark());

        // 将购物车商品转换为订单项
        List<OrderItem> orderItems = cartItems.stream().map(item -> {
            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(item.getProductId());
            orderItem.setProductName(item.getProductName());
            orderItem.setPrice(item.getPrice());
            orderItem.setQuantity(item.getQuantity());
            return orderItem;
        }).collect(Collectors.toList());

        Order created = orderService.createOrder(userId, order, orderItems);

        // 使用优惠券
        if (request.getCouponId() != null) {
            promotionService.useCoupon(request.getCouponId(), created.getId());
        }

        // 清空购物车
        cartService.clearCart(userId);

        return ApiResponse.success("订单创建成功", created);
    }

    /**
     * 获取订单列表
     */
    @GetMapping
    public ApiResponse<List<Order>> getOrders(@AuthenticationPrincipal Long userId) {
        List<Order> orders = orderService.getUserOrders(userId);
        return ApiResponse.success(orders);
    }

    /**
     * 获取订单详情（包含商品明细）
     */
    @GetMapping("/{id}")
    public ApiResponse<OrderDetailDTO> getOrder(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        if (order == null) {
            return ApiResponse.error(404, "订单不存在");
        }
        List<OrderItem> items = orderService.getOrderItems(id);
        OrderDetailDTO dto = new OrderDetailDTO();
        dto.setOrder(order);
        dto.setItems(items);
        return ApiResponse.success(dto);
    }

    /**
     * 取消订单
     */
    @PutMapping("/{id}/cancel")
    public ApiResponse<Void> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal Long userId) {
        orderService.cancelOrder(id, userId);
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("订单已取消");
        return response;
    }
}
