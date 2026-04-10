package com.ordering.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.ordering.dto.CartItemDTO;
import com.ordering.entity.CartItem;
import com.ordering.entity.Product;
import com.ordering.mapper.CartItemMapper;
import com.ordering.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 购物车服务类
 */
@Service
public class CartService {

    private final CartItemMapper cartItemMapper;
    private final ProductMapper productMapper;
    private final CartLongPollingService cartLongPollingService;

    public CartService(CartItemMapper cartItemMapper,
                       ProductMapper productMapper,
                       @Lazy CartLongPollingService cartLongPollingService) {
        this.cartItemMapper = cartItemMapper;
        this.productMapper = productMapper;
        this.cartLongPollingService = cartLongPollingService;
    }

    /**
     * 获取用户购物车
     */
    public List<CartItemDTO> getCart(Long userId) {
        if (userId == null) {
            return List.of();
        }

        List<CartItem> items = cartItemMapper.selectList(
            new QueryWrapper<CartItem>().eq("user_id", userId)
        );

        // 转换为DTO并填充商品信息
        return items.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    /**
     * 添加商品到购物车
     */
    @Transactional
    public CartItemDTO addToCart(Long userId, Long productId, Integer quantity) {
        // 检查是否已存在
        CartItem existingItem = cartItemMapper.selectOne(
            new QueryWrapper<CartItem>()
                .eq("user_id", userId)
                .eq("product_id", productId)
        );

        CartItem item;
        if (existingItem != null) {
            // 已存在则增加数量
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemMapper.updateById(existingItem);
            item = existingItem;
        } else {
            // 不存在则新增
            CartItem newItem = new CartItem();
            newItem.setUserId(userId);
            newItem.setProductId(productId);
            newItem.setQuantity(quantity);
            cartItemMapper.insert(newItem);
            item = newItem;
        }

        // 通知购物车变更
        cartLongPollingService.notifyCartChanged(userId);

        // 返回DTO
        return convertToDTO(item);
    }

    /**
     * 转换为DTO
     */
    private CartItemDTO convertToDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setUserId(item.getUserId());
        dto.setProductId(item.getProductId());
        dto.setQuantity(item.getQuantity());

        Product product = productMapper.selectById(item.getProductId());
        if (product != null) {
            dto.setProductName(product.getName());
            dto.setPrice(product.getPrice());
            dto.setProductImage(product.getImageUrl());
        }

        return dto;
    }

    /**
     * 更新购物车商品数量
     */
    @Transactional
    public CartItemDTO updateQuantity(Long cartItemId, Integer quantity) {
        CartItem item = cartItemMapper.selectById(cartItemId);
        if (item == null) {
            throw new RuntimeException("购物车项不存在");
        }
        item.setQuantity(quantity);
        cartItemMapper.updateById(item);

        // 通知购物车变更
        cartLongPollingService.notifyCartChanged(item.getUserId());

        return convertToDTO(item);
    }

    /**
     * 从购物车删除商品
     */
    @Transactional
    public void removeFromCart(Long cartItemId) {
        CartItem item = cartItemMapper.selectById(cartItemId);
        if (item != null) {
            cartItemMapper.deleteById(cartItemId);
            // 通知购物车变更
            cartLongPollingService.notifyCartChanged(item.getUserId());
        }
    }

    /**
     * 清空购物车
     */
    @Transactional
    public void clearCart(Long userId) {
        cartItemMapper.delete(
            new QueryWrapper<CartItem>().eq("user_id", userId)
        );
        // 通知购物车变更
        cartLongPollingService.notifyCartChanged(userId);
    }
}
