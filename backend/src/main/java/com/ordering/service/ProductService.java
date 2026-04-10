package com.ordering.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ordering.entity.Product;
import com.ordering.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 商品服务类
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductMapper productMapper;

    /**
     * 获取商品列表 (支持分类筛选和分页)
     */
    public Page<Product> getProducts(Long categoryId, Integer pageNum, Integer pageSize) {
        QueryWrapper<Product> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1); // 只查询上架商品

        if (categoryId != null) {
            wrapper.eq("category_id", categoryId);
        }

        wrapper.orderByAsc("sort_order");

        return productMapper.selectPage(
            new Page<>(pageNum, pageSize),
            wrapper
        );
    }

    /**
     * 根据 ID 获取商品详情
     */
    public Product getProductById(Long id) {
        return productMapper.selectById(id);
    }

    /**
     * 获取推荐商品
     */
    public List<Product> getHotProducts(Integer limit) {
        QueryWrapper<Product> wrapper = new QueryWrapper<>();
        wrapper.eq("status", 1)
               .orderByDesc("sales")
               .last("LIMIT " + limit);
        return productMapper.selectList(wrapper);
    }
}
