package com.ordering.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户优惠券实体类
 */
@Data
@TableName("user_coupons")
public class UserCoupon {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 优惠券ID
     */
    private Long couponId;

    /**
     * 状态：0-未使用 1-已使用 2-已过期
     */
    private Integer status;

    /**
     * 领取时间
     */
    private LocalDateTime receivedAt;

    /**
     * 使用时间
     */
    private LocalDateTime usedAt;

    /**
     * 关联订单ID
     */
    private Long orderId;
}