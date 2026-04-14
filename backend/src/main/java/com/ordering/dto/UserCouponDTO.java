package com.ordering.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户优惠券 DTO（包含优惠券详情）
 */
@Data
public class UserCouponDTO {
    private Long id;
    private Long userId;
    private Long couponId;
    private Integer status;
    private String statusText;
    private LocalDateTime receivedAt;
    private LocalDateTime usedAt;
    private Long orderId;

    // 优惠券详情
    private String name;
    private Integer type;
    private String typeText;
    private java.math.BigDecimal minAmount;
    private java.math.BigDecimal discountAmount;
    private Integer discountRate;
    private java.math.BigDecimal maxDiscountAmount;
    private LocalDateTime expireTime;
}
