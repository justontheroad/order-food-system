package com.ordering.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 购物车项 DTO（包含商品详情）
 */
@Data
public class CartItemDTO {

    /**
     * 购物车项 ID
     */
    private Long id;

    /**
     * 用户 ID
     */
    private Long userId;

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
    private BigDecimal price;

    /**
     * 商品图片
     */
    private String productImage;

    /**
     * 数量
     */
    private Integer quantity;
}