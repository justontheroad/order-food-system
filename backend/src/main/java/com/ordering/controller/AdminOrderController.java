package com.ordering.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ordering.dto.ApiResponse;
import com.ordering.entity.Order;
import com.ordering.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 管理后台订单控制器
 */
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderMapper orderMapper;

    @GetMapping
    public ApiResponse<Page<Order>> getOrders(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<Order> p = new Page<>(page, pageSize);
        QueryWrapper<Order> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("created_at");
        Page<Order> result = orderMapper.selectPage(p, wrapper);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<Order> getOrder(@PathVariable Long id) {
        Order order = orderMapper.selectById(id);
        return ApiResponse.success(order);
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam Integer status) {
        Order order = new Order();
        order.setId(id);
        order.setStatus(status);
        orderMapper.updateById(order);
        return ApiResponse.success("更新成功", null);
    }
}
