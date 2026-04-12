package com.ordering.controller;

import com.ordering.dto.ApiResponse;
import com.ordering.entity.Coupon;
import com.ordering.entity.UserCoupon;
import com.ordering.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 促销控制器
 */
@RestController
@RequestMapping("/api/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    /**
     * 获取可领取的优惠券
     */
    @GetMapping("/coupons")
    public ApiResponse<List<Coupon>> getAvailableCoupons() {
        List<Coupon> coupons = promotionService.getAvailableCoupons();
        return ApiResponse.success(coupons);
    }

    /**
     * 领取优惠券
     */
    @PostMapping("/coupons/{id}/receive")
    public ApiResponse<Void> receiveCoupon(
            @PathVariable("id") Long couponId,
            @AuthenticationPrincipal Long userId) {
        boolean success = promotionService.receiveCoupon(userId, couponId);
        if (success) {
            return ApiResponse.success("优惠券领取成功", null);
        }
        return ApiResponse.error(400, "优惠券领取失败");
    }

    /**
     * 获取用户的优惠券
     * 路径: /api/user/coupons
     */
    @GetMapping("/user/coupons")
    public ApiResponse<List<UserCoupon>> getUserCoupons(@AuthenticationPrincipal Long userId) {
        List<UserCoupon> userCoupons = promotionService.getUserCoupons(userId);
        return ApiResponse.success(userCoupons);
    }

    /**
     * 计算订单优惠
     */
    @PostMapping("/calculate")
    public ApiResponse<BigDecimal> calculateDiscount(
            @RequestParam BigDecimal orderAmount,
            @AuthenticationPrincipal Long userId) {
        BigDecimal discount = promotionService.calculateDiscount(userId, orderAmount);
        return ApiResponse.success(discount);
    }
}