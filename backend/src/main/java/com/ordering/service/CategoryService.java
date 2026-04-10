package com.ordering.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.ordering.entity.Category;
import com.ordering.mapper.CategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 分类服务类
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryMapper categoryMapper;

    /**
     * 获取所有分类
     */
    public List<Category> getAllCategories() {
        return categoryMapper.selectList(
            new QueryWrapper<Category>().orderByAsc("sort_order")
        );
    }
}
