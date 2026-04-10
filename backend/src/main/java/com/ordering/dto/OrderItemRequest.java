package com.ordering.dto;

import lombok.Data;

/**
 * 订单项请求 DTO
 */
@Data
public class OrderItemRequest {

    /**
     * 商品 ID
     */
    private Long productId;

    /**
     * 商品名称
     */
    private String productName;

    /**
     * 商品单价
     */
    private java.math.BigDecimal price;

    /**
     * 商品数量
     */
    private Integer quantity;
}
