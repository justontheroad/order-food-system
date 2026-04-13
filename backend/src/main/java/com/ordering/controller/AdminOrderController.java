package com.ordering.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ordering.dto.ApiResponse;
import com.ordering.dto.OrderListDTO;
import com.ordering.entity.Order;
import com.ordering.mapper.OrderMapper;
import com.ordering.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 管理后台订单控制器
 */
@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderMapper orderMapper;
    private final UserMapper userMapper;

    @GetMapping
    public ApiResponse<Page<OrderListDTO>> getOrders(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<Order> p = new Page<>(page, pageSize);
        QueryWrapper<Order> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("id");
        Page<Order> result = orderMapper.selectPage(p, wrapper);

        // 获取所有涉及的userIds
        List<Long> userIds = result.getRecords().stream()
                .map(Order::getUserId)
                .distinct()
                .collect(Collectors.toList());

        // 批量查询用户信息
        Map<Long, Map<String, Object>> userMap = userMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(
                        u -> u.getId(),
                        u -> Map.of("name", u.getUsername() != null ? u.getUsername() : "", "phone", u.getPhone() != null ? u.getPhone() : "")
                ));

        // 转换为DTO
        List<OrderListDTO> dtoList = result.getRecords().stream().map(order -> {
            OrderListDTO dto = new OrderListDTO();
            dto.setId(order.getId());
            dto.setOrderNo(order.getOrderNo());
            dto.setUserId(order.getUserId());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setDiscountAmount(order.getDiscountAmount());
            dto.setPayAmount(order.getPayAmount());
            dto.setStatus(order.getStatus());
            dto.setStatusText(getStatusText(order.getStatus()));
            dto.setPayType(order.getPayType());
            dto.setPayTime(order.getPayTime());
            dto.setCreatedAt(order.getCreatedAt());

            Map<String, Object> userInfo = userMap.get(order.getUserId());
            if (userInfo != null) {
                dto.setMemberName((String) userInfo.get("name"));
                dto.setMemberPhone((String) userInfo.get("phone"));
            }
            return dto;
        }).collect(Collectors.toList());

        Page<OrderListDTO> dtoPage = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        dtoPage.setRecords(dtoList);
        return ApiResponse.success(dtoPage);
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

    private String getStatusText(Integer status) {
        if (status == null) return "未知";
        switch (status) {
            case 0: return "待支付";
            case 1: return "待制作";
            case 2: return "制作中";
            case 3: return "待取餐";
            case 4: return "已完成";
            case 5: return "已取消";
            default: return "未知";
        }
    }
}
