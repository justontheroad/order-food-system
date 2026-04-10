package com.ordering.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ordering.entity.Shop;
import com.ordering.mapper.ShopMapper;
import com.ordering.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 店铺服务实现类
 */
@Service
@RequiredArgsConstructor
public class ShopServiceImpl implements ShopService {

    private final ShopMapper shopMapper;

    @Override
    public List<Shop> list() {
        return shopMapper.selectList(new LambdaQueryWrapper<Shop>()
                .orderByDesc(Shop::getSortOrder));
    }

    @Override
    public Shop getById(Long id) {
        return shopMapper.selectById(id);
    }

    @Override
    public List<Shop> listOpenShops() {
        return shopMapper.selectList(new LambdaQueryWrapper<Shop>()
                .eq(Shop::getStatus, 1)
                .orderByDesc(Shop::getSortOrder));
    }
}
