package com.ordering.service;

import com.ordering.entity.Order;

import java.util.Map;

/**
 * 支付服务接口
 */
public interface PaymentService {

    /**
     * 创建微信支付订单
     */
    Map<String, Object> createWechatPayOrder(Long orderId, Long userId);

    /**
     * 微信支付回调
     */
    void wechatPayCallback(Map<String, Object> callbackData);

    /**
     * 查询支付状态
     */
    Integer getPaymentStatus(Long orderId);
}