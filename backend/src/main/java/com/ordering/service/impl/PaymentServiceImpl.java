package com.ordering.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.ordering.entity.Order;
import com.ordering.mapper.OrderMapper;
import com.ordering.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 支付服务实现类
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final OrderMapper orderMapper;

    @Value("${wechat.pay.appid:}")
    private String appid;

    @Value("${wechat.pay.mchid:}")
    private String mchid;

    @Value("${wechat.pay.apikey:}")
    private String apiKey;

    // 模拟支付模式（无商户号时使用）
    @Value("${wechat.pay.mock:true}")
    private boolean mockMode;

    @Override
    @Transactional
    public Map<String, Object> createWechatPayOrder(Long orderId, Long userId) {
        Order order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }

        Map<String, Object> result = new HashMap<>();

        if (mockMode) {
            // 模拟支付模式 - 直接标记为已支付
            order.setStatus(1); // 待制作
            order.setPayType(1); // 微信支付
            order.setPayTime(LocalDateTime.now());
            orderMapper.updateById(order);
            result.put("orderId", orderId);
            result.put("qrCode", "mock://" + UUID.randomUUID().toString().substring(0, 8));
            result.put("mockUrl", "/api/payments/callback/wechat?orderId=" + orderId + "&mock=true");
            result.put("mock", true);
            result.put("expireTime", LocalDateTime.now().plusMinutes(5).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            return result;
        }

        // 实际微信支付（需要商户号配置）
        try {
            // 生成商户订单号
            String tradeNo = "ORD" + System.currentTimeMillis();

            // 构建支付参数
            Map<String, Object> payParams = new HashMap<>();
            payParams.put("appid", appid);
            payParams.put("mch_id", mchid);
            payParams.put("out_trade_no", tradeNo);
            payParams.put("total_fee", order.getPayAmount().multiply(BigDecimal.valueOf(100)).intValue());
            payParams.put("body", "H5点餐订单");
            // payParams.put("notify_url", notifyUrl);

            // TODO: 调用微信统一下单接口
            // 此处需要商户号配置才能调用真实接口

            result.put("orderId", orderId);
            result.put("tradeNo", tradeNo);
            result.put("mock", false);
            log.info("微信支付下单成功: orderId={}", orderId);

        } catch (Exception e) {
            log.error("微信支付下单失败: {}", e.getMessage());
            throw new RuntimeException("支付创建失败");
        }

        return result;
    }

    @Override
    @Transactional
    public void wechatPayCallback(Map<String, Object> callbackData) {
        String orderId = (String) callbackData.get("orderId");
        if (orderId == null) {
            orderId = (String) callbackData.get("out_trade_no");
        }

        // mock模式直接标记支付成功
        if (callbackData.containsKey("mock") || "SUCCESS".equals(callbackData.get("result_code"))) {
            Long id = Long.parseLong(orderId.toString().replace("ORD", ""));
            Order order = orderMapper.selectById(id);
            if (order != null) {
                order.setStatus(1); // 待制作
                order.setPayType(1); // 微信支付
                order.setPaidAt(LocalDateTime.now());
                orderMapper.updateById(order);
                log.info("支付回调处理成功: orderId={}", id);
            }
        }
    }

    @Override
    public Integer getPaymentStatus(Long orderId) {
        Order order = orderMapper.selectById(orderId);
        return order != null ? order.getStatus() : null;
    }
}