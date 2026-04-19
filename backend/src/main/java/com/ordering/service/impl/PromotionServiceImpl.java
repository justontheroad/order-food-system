package com.ordering.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ordering.dto.AdminUserCouponDTO;
import com.ordering.dto.DiscountPreviewDTO;
import com.ordering.dto.UserCouponDTO;
import com.ordering.entity.Coupon;
import com.ordering.entity.UserCoupon;
import com.ordering.entity.User;
import com.ordering.mapper.CouponMapper;
import com.ordering.mapper.UserCouponMapper;
import com.ordering.mapper.UserMapper;
import com.ordering.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 促销服务实现类
 */
@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final CouponMapper couponMapper;
    private final UserCouponMapper userCouponMapper;
    private final UserMapper userMapper;

    @Override
    public List<Coupon> getAvailableCoupons() {
        LocalDateTime now = LocalDateTime.now();
        return couponMapper.selectList(new LambdaQueryWrapper<Coupon>()
                .eq(Coupon::getStatus, 1)
                .le(Coupon::getStartTime, now)
                .ge(Coupon::getEndTime, now)
                .orderByAsc(Coupon::getId));
    }

    @Override
    @Transactional
    public boolean receiveCoupon(Long userId, Long couponId) {
        if (userId == null) {
            throw new RuntimeException("用户ID不能为空");
        }
        // 加锁防止并发领取
        synchronized (getLockKey(userId, couponId)) {
            Coupon coupon = couponMapper.selectById(couponId);
            if (coupon == null || coupon.getStatus() != 1) {
                return false;
            }

            LocalDate now = LocalDate.now();
            if (now.isBefore(coupon.getStartTime()) || now.isAfter(coupon.getEndTime())) {
                return false;
            }

            // 再次检查是否已领取（并发情况下可能其他线程已领取）
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
            userCoupon.setReceivedAt(LocalDateTime.now());
            userCouponMapper.insert(userCoupon);

            return true;
        }
    }

    private String getLockKey(Long userId, Long couponId) {
        return "coupon:receive:" + userId + ":" + couponId;
    }

    @Override
    public List<UserCoupon> getUserCoupons(Long userId) {
        return userCouponMapper.selectList(new LambdaQueryWrapper<UserCoupon>()
                .eq(UserCoupon::getUserId, userId)
                .orderByDesc(UserCoupon::getReceivedAt));
    }

    /**
     * 获取用户优惠券（含优惠券详情）
     */
    public List<UserCouponDTO> getUserCouponsWithDetails(Long userId) {
        List<UserCoupon> userCoupons = getUserCoupons(userId);

        // 获取所有涉及的couponIds
        List<Long> couponIds = userCoupons.stream()
                .map(UserCoupon::getCouponId)
                .distinct()
                .collect(Collectors.toList());

        // 批量查询优惠券信息
        Map<Long, Coupon> couponMap = couponIds.isEmpty()
                ? Map.of()
                : couponMapper.selectBatchIds(couponIds).stream()
                        .collect(Collectors.toMap(Coupon::getId, c -> c));

        // 转换为DTO
        return userCoupons.stream().map(uc -> {
            UserCouponDTO dto = new UserCouponDTO();
            dto.setId(uc.getId());
            dto.setUserId(uc.getUserId());
            dto.setCouponId(uc.getCouponId());
            dto.setStatus(uc.getStatus());
            dto.setStatusText(getStatusText(uc.getStatus()));
            dto.setReceivedAt(uc.getReceivedAt());
            dto.setUsedAt(uc.getUsedAt());
            dto.setOrderId(uc.getOrderId());

            Coupon coupon = couponMap.get(uc.getCouponId());
            if (coupon != null) {
                dto.setName(coupon.getName());
                dto.setType(coupon.getType());
                dto.setTypeText(coupon.getType() == 1 ? "满减券" : "折扣券");
                dto.setMinAmount(coupon.getMinAmount());
                dto.setDiscountAmount(coupon.getDiscountAmount());
                dto.setDiscountRate(coupon.getDiscountRate());
                dto.setMaxDiscountAmount(coupon.getMaxDiscountAmount());
                dto.setExpireTime(coupon.getEndTime().atStartOfDay());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    private String getStatusText(Integer status) {
        if (status == null) return "未知";
        switch (status) {
            case 0: return "未使用";
            case 1: return "已使用";
            case 2: return "已过期";
            default: return "未知";
        }
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
                    // 折扣券: 金额 × (折扣率/100)
                    discount = orderAmount.multiply(BigDecimal.valueOf(coupon.getDiscountRate().longValue()))
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
    public void useCoupon(Long userId, Long couponId, Long orderId) {
        // 加锁防止并发使用
        synchronized (getLockKey(userId, couponId)) {
            // 通过 userId + couponId 查找用户优惠券
            UserCoupon userCoupon = userCouponMapper.selectOne(
                new LambdaQueryWrapper<UserCoupon>()
                    .eq(UserCoupon::getUserId, userId)
                    .eq(UserCoupon::getCouponId, couponId)
            );
            if (userCoupon != null && userCoupon.getStatus() == 0) {
                userCoupon.setStatus(1);
                userCoupon.setUsedAt(LocalDateTime.now());
                userCoupon.setOrderId(orderId);
                userCouponMapper.updateById(userCoupon);
            }
        }
    }

    @Override
    public DiscountPreviewDTO previewDiscount(Long userId, BigDecimal orderAmount, Long couponId) {
        DiscountPreviewDTO preview = new DiscountPreviewDTO();
        preview.setTotalAmount(orderAmount);

        if (couponId == null) {
            preview.setDiscountAmount(BigDecimal.ZERO);
            preview.setPayAmount(orderAmount);
            preview.setCouponId(null);
            preview.setCouponName(null);
            return preview;
        }

        // 获取优惠券信息
        Coupon coupon = couponMapper.selectById(couponId);
        if (coupon == null) {
            preview.setDiscountAmount(BigDecimal.ZERO);
            preview.setPayAmount(orderAmount);
            preview.setCouponId(couponId);
            preview.setCouponName("优惠券不存在");
            return preview;
        }

        // 获取用户优惠券（通过 userId + couponId 查找）
        UserCoupon userCoupon = userCouponMapper.selectOne(
            new LambdaQueryWrapper<UserCoupon>()
                .eq(UserCoupon::getUserId, userId)
                .eq(UserCoupon::getCouponId, couponId)
        );
        if (userCoupon == null || userCoupon.getStatus() != 0) {
            preview.setDiscountAmount(BigDecimal.ZERO);
            preview.setPayAmount(orderAmount);
            preview.setCouponId(couponId);
            preview.setCouponName(coupon.getName() + "(未领取或已使用)");
            return preview;
        }

        // 检查是否满足门槛
        if (coupon.getMinAmount() != null && orderAmount.compareTo(coupon.getMinAmount()) < 0) {
            preview.setDiscountAmount(BigDecimal.ZERO);
            preview.setPayAmount(orderAmount);
            preview.setCouponId(couponId);
            preview.setCouponName(coupon.getName() + "(未满足门槛)");
            return preview;
        }

        // 计算优惠金额
        BigDecimal discountAmount = calculateCouponDiscount(orderAmount, coupon);
        BigDecimal payAmount = orderAmount.subtract(discountAmount).max(BigDecimal.ZERO);

        preview.setDiscountAmount(discountAmount);
        preview.setPayAmount(payAmount);
        preview.setCouponId(couponId);
        preview.setCouponName(coupon.getName());
        return preview;
    }

    /**
     * 计算单张优惠券的优惠金额
     */
    private BigDecimal calculateCouponDiscount(BigDecimal orderAmount, Coupon coupon) {
        if (coupon.getType() == 1) {
            // 满减券
            return coupon.getDiscountAmount() != null ? coupon.getDiscountAmount() : BigDecimal.ZERO;
        } else if (coupon.getType() == 2) {
            // 折扣券: 金额 × (折扣率/100)
            if (coupon.getDiscountRate() == null) {
                return BigDecimal.ZERO;
            }
            BigDecimal discount = orderAmount.multiply(BigDecimal.valueOf(coupon.getDiscountRate().longValue()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            // 限制最大优惠
            if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
            return discount;
        }
        return BigDecimal.ZERO;
    }

    @Override
    public Page<AdminUserCouponDTO> getAdminUserCoupons(Integer page, Integer pageSize, String username, Integer status) {
        Page<UserCoupon> p = new Page<>(page, pageSize);
        LambdaQueryWrapper<UserCoupon> wrapper = new LambdaQueryWrapper<>();

        // 按用户名模糊搜索
        if (username != null && !username.isEmpty()) {
            // 先找出匹配的用户ID
            List<User> users = userMapper.selectList(
                new LambdaQueryWrapper<User>().like(User::getUsername, username)
            );
            List<Long> userIds = users.stream().map(User::getId).collect(Collectors.toList());
            if (userIds.isEmpty()) {
                return new Page<>(page, pageSize, 0);
            }
            wrapper.in(UserCoupon::getUserId, userIds);
        }

        // 按状态筛选
        if (status != null) {
            wrapper.eq(UserCoupon::getStatus, status);
        }

        wrapper.orderByDesc(UserCoupon::getReceivedAt);
        Page<UserCoupon> result = userCouponMapper.selectPage(p, wrapper);

        // 获取所有涉及的用户和优惠券信息
        List<Long> userIds = result.getRecords().stream().map(UserCoupon::getUserId).distinct().collect(Collectors.toList());
        List<Long> couponIds = result.getRecords().stream().map(UserCoupon::getCouponId).distinct().collect(Collectors.toList());

        Map<Long, User> userMap = userIds.isEmpty()
                ? Map.of()
                : userMapper.selectBatchIds(userIds).stream()
                        .collect(Collectors.toMap(User::getId, u -> u));
        Map<Long, Coupon> couponMap = couponIds.isEmpty()
                ? Map.of()
                : couponMapper.selectBatchIds(couponIds).stream()
                        .collect(Collectors.toMap(Coupon::getId, c -> c));

        // 转换为DTO
        List<AdminUserCouponDTO> dtoList = result.getRecords().stream().map(uc -> {
            AdminUserCouponDTO dto = new AdminUserCouponDTO();
            dto.setId(uc.getId());
            dto.setUserId(uc.getUserId());
            dto.setCouponId(uc.getCouponId());
            dto.setStatus(uc.getStatus());
            dto.setStatusText(getStatusText(uc.getStatus()));
            dto.setReceivedAt(uc.getReceivedAt());
            dto.setUsedAt(uc.getUsedAt());
            dto.setOrderId(uc.getOrderId());

            User user = userMap.get(uc.getUserId());
            if (user != null) {
                dto.setUsername(user.getUsername());
                dto.setPhone(user.getPhone());
            }

            Coupon coupon = couponMap.get(uc.getCouponId());
            if (coupon != null) {
                dto.setCouponName(coupon.getName());
                dto.setCouponType(coupon.getType());
                dto.setCouponTypeText(coupon.getType() == 1 ? "满减券" : "折扣券");
            }
            return dto;
        }).collect(Collectors.toList());

        Page<AdminUserCouponDTO> dtoPage = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        dtoPage.setRecords(dtoList);
        return dtoPage;
    }
}