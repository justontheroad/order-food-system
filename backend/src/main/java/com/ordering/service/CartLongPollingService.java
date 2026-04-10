package com.ordering.service;

import com.ordering.dto.CartItemDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.async.DeferredResult;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 购物车长轮询服务
 * 使用 DeferredResult 实现长轮询，Redis Pub/Sub 实现跨实例通知
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CartLongPollingService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final CartService cartService;

    /**
     * Redis Pub/Sub 频道名称
     */
    private static final String CART_CHANNEL = "cart:changed";

    /**
     * 长轮询超时时间（毫秒）
     */
    private static final long TIMEOUT_MS = 60000L;

    /**
     * 存储挂起的请求
     * key: userId, value: DeferredResult
     * 使用本地内存存储，通过 Redis Pub/Sub 实现跨实例通知
     */
    private final Map<Long, DeferredResult<List<CartItemDTO>>> pendingRequests = new ConcurrentHashMap<>();

    /**
     * 长轮询入口
     * 创建 DeferredResult 并挂起请求，等待购物车变更或超时
     *
     * @param userId 用户ID
     * @return DeferredResult，完成后返回购物车数据
     */
    public DeferredResult<List<CartItemDTO>> longPollCart(Long userId) {
        DeferredResult<List<CartItemDTO>> result = new DeferredResult<>(TIMEOUT_MS);

        // 存储挂起的请求
        pendingRequests.put(userId, result);
        log.debug("Cart long poll started for user: {}", userId);

        // 超时处理：返回当前购物车数据
        result.onTimeout(() -> {
            pendingRequests.remove(userId);
            List<CartItemDTO> cart = cartService.getCart(userId);
            result.setResult(cart);
            log.debug("Cart long poll timeout for user: {}, returning cart with {} items", userId, cart.size());
        });

        // 完成后清理
        result.onCompletion(() -> {
            pendingRequests.remove(userId);
            log.debug("Cart long poll completed for user: {}", userId);
        });

        // 错误处理
        result.onError(throwable -> {
            pendingRequests.remove(userId);
            log.error("Cart long poll error for user: {}", userId, throwable);
        });

        return result;
    }

    /**
     * 购物车变更时调用
     * 通过 Redis Pub/Sub 发布变更通知
     *
     * @param userId 用户ID
     */
    public void notifyCartChanged(Long userId) {
        if (userId == null) {
            return;
        }
        log.debug("Publishing cart change notification for user: {}", userId);
        redisTemplate.convertAndSend(CART_CHANNEL, userId);
    }

    /**
     * Redis 消息监听回调
     * 收到购物车变更通知后，立即完成挂起的请求
     *
     * @param userId 用户ID
     */
    public void onCartChanged(Long userId) {
        DeferredResult<List<CartItemDTO>> result = pendingRequests.remove(userId);
        if (result != null && !result.isSetOrExpired()) {
            List<CartItemDTO> cart = cartService.getCart(userId);
            result.setResult(cart);
            log.debug("Cart long poll notified for user: {}, returning cart with {} items", userId, cart.size());
        }
    }

    /**
     * 获取当前挂起的请求数量（用于监控）
     *
     * @return 挂起的请求数量
     */
    public int getPendingRequestCount() {
        return pendingRequests.size();
    }
}