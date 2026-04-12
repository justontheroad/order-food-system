package com.ordering.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ordering.entity.Coupon;
import com.ordering.entity.UserCoupon;
import com.ordering.mapper.CouponMapper;
import com.ordering.mapper.UserCouponMapper;
import com.ordering.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 促销服务实现类
 */
@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final CouponMapper couponMapper;
    private final UserCouponMapper userCouponMapper;

    @Override
    public List<Coupon> getAvailableCoupons() {
        LocalDateTime now = LocalDateTime.now();
        return couponMapper.selectList(new LambdaQueryWrapper<Coupon>()
                .eq(Coupon::getStatus, 1)
                .le(Coupon::getStartTime, now)
                .ge(Coupon::getEndTime, now)
                .apply("total_count IS NULL OR received_count < total_count")
                .orderByAsc(Coupon::getId));
    }

    @Override
    @Transactional
    public boolean receiveCoupon(Long userId, Long couponId) {
        Coupon coupon = couponMapper.selectById(couponId);
        if (coupon == null || coupon.getStatus() != 1) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(coupon.getStartTime()) || now.isAfter(coupon.getEndTime())) {
            return false;
        }

        // 检查每人限领
        if (coupon.getLimitPerUser() != null && coupon.getLimitPerUser() > 0) {
            Long count = userCouponMapper.selectCount(new LambdaQueryWrapper<UserCoupon>()
                    .eq(UserCoupon::getUserId, userId)
                    .eq(UserCoupon::getCouponId, couponId));
            if (count >= coupon.getLimitPerUser()) {
                return false;
            }
        }

        // 检查发放总量
        if (coupon.getTotalCount() != null) {
            if (coupon.getReceivedCount() == null) {
                coupon.setReceivedCount(0);
            }
            if (coupon.getReceivedCount() >= coupon.getTotalCount()) {
                return false;
            }
            coupon.setReceivedCount(coupon.getReceivedCount() + 1);
            couponMapper.updateById(coupon);
        }

        // 发放给用户
        UserCoupon userCoupon = new UserCoupon();
        userCoupon.setUserId(userId);
        userCoupon.setCouponId(couponId);
        userCoupon.setStatus(0); // 未使用
        userCoupon.setReceivedAt(now);
        userCouponMapper.insert(userCoupon);

        return true;
    }

    @Override
    public List<UserCoupon> getUserCoupons(Long userId) {
        return userCouponMapper.selectList(new LambdaQueryWrapper<UserCoupon>()
                .eq(UserCoupon::getUserId, userId)
                .orderByDesc(UserCoupon::getReceivedAt));
    }

    @Override
    public BigDecimal calculateDiscount(Long userId, BigDecimal orderAmount) {
        // 默认返回最大优惠
        List<Coupon> coupons = getAvailableCoupons();
        BigDecimal maxDiscount = BigDecimal.ZERO;

        for (Coupon coupon : coupons) {
            if (orderAmount.compareTo(coupon.getMinAmount()) >= 0) {
                BigDecimal discount = BigDecimal.ZERO;
                if (coupon.getType() == 1) {
                    // 满减券
                    discount = coupon.getDiscountAmount();
                } else if (coupon.getType() == 2) {
                    // 折扣券
                    discount = orderAmount.multiply(BigDecimal.valueOf(100 - coupon.getDiscountRate()))
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                        discount = coupon.getMaxDiscountAmount();
                    }
                }
                if (discount.compareTo(maxDiscount) > 0) {
                    maxDiscount = discount;
                }
            }
        }

        return maxDiscount;
    }

    @Override
    @Transactional
    public void useCoupon(Long userCouponId, Long orderId) {
        UserCoupon userCoupon = userCouponMapper.selectById(userCouponId);
        if (userCoupon != null && userCoupon.getStatus() == 0) {
            userCoupon.setStatus(1);
            userCoupon.setUsedAt(LocalDateTime.now());
            userCoupon.setOrderId(orderId);
            userCouponMapper.updateById(userCoupon);
        }
    }
}