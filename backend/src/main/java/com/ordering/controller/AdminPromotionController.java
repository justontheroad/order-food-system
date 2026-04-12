package com.ordering.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ordering.dto.ApiResponse;
import com.ordering.entity.Coupon;
import com.ordering.mapper.CouponMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 管理后台促销控制器
 */
@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final CouponMapper couponMapper;

    @GetMapping
    public ApiResponse<Page<Coupon>> getPromotions(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<Coupon> p = new Page<>(page, pageSize);
        QueryWrapper<Coupon> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("created_at");
        Page<Coupon> result = couponMapper.selectPage(p, wrapper);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<Coupon> getPromotion(@PathVariable Long id) {
        Coupon coupon = couponMapper.selectById(id);
        return ApiResponse.success(coupon);
    }

    @PostMapping
    public ApiResponse<Void> createPromotion(@RequestBody Coupon coupon) {
        couponMapper.insert(coupon);
        return ApiResponse.success("创建成功", null);
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updatePromotion(@PathVariable Long id, @RequestBody Coupon coupon) {
        coupon.setId(id);
        couponMapper.updateById(coupon);
        return ApiResponse.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePromotion(@PathVariable Long id) {
        couponMapper.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }
}
