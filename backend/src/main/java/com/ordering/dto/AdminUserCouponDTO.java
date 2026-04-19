package com.ordering.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 管理端用户优惠券 DTO
 */
@Data
public class AdminUserCouponDTO {
    private Long id;
    private Long userId;
    private String username;
    private String phone;
    private Long couponId;
    private String couponName;
    private Integer couponType;
    private String couponTypeText;
    private Integer status;
    private String statusText;
    private LocalDateTime receivedAt;
    private LocalDateTime usedAt;
    private Long orderId;
}
