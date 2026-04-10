package com.ordering.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 创建订单请求 DTO
 */
@Data
public class CreateOrderRequest {

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
     * 备注
     */
    private String remark;
}
