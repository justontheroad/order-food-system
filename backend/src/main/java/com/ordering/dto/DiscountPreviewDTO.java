package com.ordering.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 优惠预览 DTO
 */
@Data
public class DiscountPreviewDTO {
    /**
     * 订单总金额
     */
    private BigDecimal totalAmount;

    /**
     * 优惠金额
     */
    private BigDecimal discountAmount;

    /**
     * 实付金额
     */
    private BigDecimal payAmount;

    /**
     * 使用的优惠券ID
     */
    private Long couponId;

    /**
     * 优惠券名称
     */
    private String couponName;
}
