package com.ordering.service;

import com.ordering.dto.DiscountPreviewDTO;
import com.ordering.dto.UserCouponDTO;
import com.ordering.entity.Coupon;
import com.ordering.entity.UserCoupon;

import java.math.BigDecimal;
import java.util.List;

/**
 * 促销服务接口
 */
public interface PromotionService {

    /**
     * 获取可领取的优惠券列表
     */
    List<Coupon> getAvailableCoupons();

    /**
     * 领取优惠券
     */
    boolean receiveCoupon(Long userId, Long couponId);

    /**
     * 获取用户已领取的优惠券
     */
    List<UserCoupon> getUserCoupons(Long userId);

    /**
     * 获取用户优惠券（含详情）
     */
    List<UserCouponDTO> getUserCouponsWithDetails(Long userId);

    /**
     * 计算订单优惠金额（自动选择最优）
     */
    BigDecimal calculateDiscount(Long userId, BigDecimal orderAmount);

    /**
     * 预览指定优惠券的优惠金额
     */
    DiscountPreviewDTO previewDiscount(Long userId, BigDecimal orderAmount, Long couponId);

    /**
     * 使用优惠券（通过 userId + couponId 查找并标记为已用）
     */
    void useCoupon(Long userId, Long couponId, Long orderId);

    /**
     * 管理端：分页查询所有用户优惠券
     * @param page 页码
     * @param pageSize 每页数量
     * @param username 用户名（模糊搜索）
     * @param status 状态筛选（0-未使用 1-已使用 2-已过期）
     */
    com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.ordering.dto.AdminUserCouponDTO> getAdminUserCoupons(Integer page, Integer pageSize, String username, Integer status);
}