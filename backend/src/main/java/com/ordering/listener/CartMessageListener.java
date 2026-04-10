package com.ordering.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ordering.service.CartLongPollingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * 购物车变更消息监听器
 * 监听 Redis Pub/Sub 频道，收到消息后通知长轮询服务
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CartMessageListener implements MessageListener {

    private final CartLongPollingService cartLongPollingService;
    private final ObjectMapper objectMapper;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            // 解析消息体获取用户ID
            String body = new String(message.getBody(), StandardCharsets.UTF_8);
            Long userId = objectMapper.readValue(body, Long.class);

            log.debug("Received cart change notification for user: {}", userId);

            // 通知长轮询服务
            cartLongPollingService.onCartChanged(userId);

        } catch (Exception e) {
            log.error("Failed to process cart change message: {}", new String(message.getBody(), StandardCharsets.UTF_8), e);
        }
    }
}