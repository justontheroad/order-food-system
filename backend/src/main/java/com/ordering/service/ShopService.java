package com.ordering.service;

import com.ordering.entity.Shop;
import java.util.List;

/**
 * 店铺服务接口
 */
public interface ShopService {

    /**
     * 获取所有店铺列表
     */
    List<Shop> list();

    /**
     * 根据 ID 获取店铺详情
     */
    Shop getById(Long id);

    /**
     * 获取营业中的店铺
     */
    List<Shop> listOpenShops();
}
