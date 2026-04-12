package com.ordering.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ordering.dto.ApiResponse;
import com.ordering.entity.Product;
import com.ordering.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 管理后台商品控制器
 */
@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductMapper productMapper;

    @GetMapping
    public ApiResponse<Page<Product>> getProducts(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<Product> p = new Page<>(page, pageSize);
        Page<Product> result = productMapper.selectPage(p, null);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<Product> getProduct(@PathVariable Long id) {
        Product product = productMapper.selectById(id);
        return ApiResponse.success(product);
    }

    @PostMapping
    public ApiResponse<Void> createProduct(@RequestBody Product product) {
        productMapper.insert(product);
        return ApiResponse.success("创建成功", null);
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        productMapper.updateById(product);
        return ApiResponse.success("更新成功", null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        productMapper.deleteById(id);
        return ApiResponse.success("删除成功", null);
    }
}
