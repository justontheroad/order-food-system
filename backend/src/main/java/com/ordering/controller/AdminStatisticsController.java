package com.ordering.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ordering.dto.ApiResponse;
import com.ordering.entity.Order;
import com.ordering.entity.Product;
import com.ordering.entity.Member;
import com.ordering.mapper.OrderMapper;
import com.ordering.mapper.ProductMapper;
import com.ordering.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 管理后台统计控制器
 */
@RestController
@RequestMapping("/api/admin/statistics")
@RequiredArgsConstructor
public class AdminStatisticsController {

    private final OrderMapper orderMapper;
    private final ProductMapper productMapper;
    private final MemberMapper memberMapper;

    /**
     * 获取统计数据
     */
    @GetMapping
    public ApiResponse<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // 总订单数
        Long totalOrders = orderMapper.selectCount(null);
        stats.put("totalOrders", totalOrders);

        // 总会员数
        Long totalMembers = memberMapper.selectCount(null);
        stats.put("totalMembers", totalMembers);

        // 总商品数
        Long totalProducts = productMapper.selectCount(null);
        stats.put("totalProducts", totalProducts);

        // 待处理订单数 (status=1)
        QueryWrapper<Order> pendingWrapper = new QueryWrapper<>();
        pendingWrapper.eq("status", 1);
        Long pendingOrders = orderMapper.selectCount(pendingWrapper);
        stats.put("pendingOrders", pendingOrders);

        // 今日订单数 (简化版，实际需要SQL统计)
        stats.put("todayOrders", 0);
        stats.put("todaySales", 0L);

        return ApiResponse.success(stats);
    }

    /**
     * 获取热销商品 (简化版，按排序字段返回)
     */
    @GetMapping("/hot-products")
    public ApiResponse<List<Product>> getHotProducts() {
        Page<Product> p = new Page<>(1, 5);
        QueryWrapper<Product> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("sort_order");
        List<Product> products = productMapper.selectPage(p, wrapper).getRecords();
        return ApiResponse.success(products);
    }
}
