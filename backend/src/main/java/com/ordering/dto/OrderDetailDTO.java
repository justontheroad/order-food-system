package com.ordering.dto;

import com.ordering.entity.Order;
import com.ordering.entity.OrderItem;
import lombok.Data;
import java.util.List;

/**
 * 订单详情 DTO（包含订单项）
 */
@Data
public class OrderDetailDTO {
    private Order order;
    private List<OrderItem> items;
}