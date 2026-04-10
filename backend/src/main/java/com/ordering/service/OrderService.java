package com.ordering.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.ordering.entity.Order;
import com.ordering.entity.OrderItem;
import com.ordering.mapper.OrderItemMapper;
import com.ordering.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * 订单服务类
 */
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;

    /**
     * 创建订单
     */
    @Transactional
    public Order createOrder(Long userId, Order order, List<OrderItem> items) {
        // 生成订单号 (时间戳 + 随机数)
        String orderNo = generateOrderNo();
        order.setOrderNo(orderNo);
        order.setUserId(userId);
        order.setStatus(0); // 待支付
        order.setCreatedAt(LocalDateTime.now());

        // 插入订单
        orderMapper.insert(order);

        // 插入订单项
        for (OrderItem item : items) {
            item.setOrderId(order.getId());
            item.setCreatedAt(LocalDateTime.now());
            orderItemMapper.insert(item);
        }

        return order;
    }

    /**
     * 获取用户订单列表
     */
    public List<Order> getUserOrders(Long userId) {
        return orderMapper.selectList(
            new QueryWrapper<Order>()
                .eq("user_id", userId)
                .orderByDesc("created_at")
        );
    }

    /**
     * 根据 ID 获取订单详情
     */
    public Order getOrderById(Long id) {
        return orderMapper.selectById(id);
    }

    /**
     * 根据订单号获取订单详情
     */
    public Order getOrderByOrderNo(String orderNo) {
        return orderMapper.selectOne(
            new QueryWrapper<Order>().eq("order_no", orderNo)
        );
    }

    /**
     * 获取订单明细
     */
    public List<OrderItem> getOrderItems(Long orderId) {
        return orderItemMapper.selectList(
            new QueryWrapper<OrderItem>().eq("order_id", orderId)
        );
    }

    /**
     * 取消订单
     * 允许取消的状态：待支付 (0)、待制作 (1)
     * 制作中 (2)、待取餐 (3)、已完成 (4) 不可取消
     */
    @Transactional
    public void cancelOrder(Long orderId, Long userId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new RuntimeException("订单不存在");
        }
        if (order.getStatus() != 0 && order.getStatus() != 1) {
            throw new RuntimeException("当前订单状态不可取消");
        }
        order.setStatus(5); // 已取消
        orderMapper.updateById(order);
    }

    /**
     * 生成订单号
     */
    private String generateOrderNo() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String timestamp = LocalDateTime.now().format(formatter);
        int random = (int) ((Math.random() * 9000) + 1000);
        return "ORD" + timestamp + random;
    }
}
