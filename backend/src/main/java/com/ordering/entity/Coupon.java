package com.ordering.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 优惠券实体类
 */
@Data
@TableName("coupons")
public class Coupon {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 优惠券名称
     */
    private String name;

    /**
     * 优惠券类型：1-满减券 2-折扣券
     */
    private Integer type;

    /**
     * 优惠门槛金额
     */
    private BigDecimal minAmount;

    /**
     * 优惠金额（满减券）
     */
    private BigDecimal discountAmount;

    /**
     * 折扣比例（折扣券，80表示8折）
     */
    private Integer discountRate;

    /**
     * 最高优惠金额（折扣券）
     */
    private BigDecimal maxDiscountAmount;

    /**
     * 发放总量
     */
    private Integer totalCount;

    /**
     * 已领取数量
     */
    private Integer receivedCount;

    /**
     * 每人限领数量
     */
    private Integer limitPerUser;

    /**
     * 有效期开始时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startTime;

    /**
     * 有效期结束时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endTime;

    /**
     * 状态：0-禁用 1-启用
     */
    private Integer status;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}