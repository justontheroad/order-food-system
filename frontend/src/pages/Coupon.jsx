import React, { useState } from 'react';
import { Tabs, Card, Button, Tag, Empty } from 'antd-mobile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponApi } from '../services/api';
import './Coupon.css';

const Coupon = () => {
  const queryClient = useQueryClient();
  const [activeKey, setActiveKey] = useState('available');
  const [myCouponTab, setMyCouponTab] = useState('0');
  const [message, setMessage] = useState('');

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  // 可领取优惠券列表
  const { data: availableData, isLoading: loadingAvailable } = useQuery({
    queryKey: ['availableCoupons'],
    queryFn: () => couponApi.getAvailable(),
  });

  // 我的优惠券列表
  const { data: myCouponsData, isLoading: loadingMyCoupons } = useQuery({
    queryKey: ['myCoupons'],
    queryFn: () => couponApi.getMyCoupons(),
  });

  // 领取优惠券
  const receiveMutation = useMutation({
    mutationFn: (couponId) => couponApi.receive(couponId),
    onSuccess: () => {
      showMessage('领取成功');
      queryClient.invalidateQueries(['availableCoupons']);
      queryClient.invalidateQueries(['myCoupons']);
    },
    onError: (error) => {
      showMessage(error.message || '领取失败');
    },
  });

  const availableCoupons = availableData?.data || [];
  const myCoupons = myCouponsData?.data || [];

  // 用户已领取的优惠券ID集合
  const receivedCouponIds = new Set(myCoupons.map(c => c.couponId));

  // 过滤我的优惠券 (status: 0-未使用 1-已使用 2-已过期)
  const unusedCoupons = myCoupons.filter(c => c.status === 0);
  const usedCoupons = myCoupons.filter(c => c.status === 1);
  const expiredCoupons = myCoupons.filter(c => c.status === 2);

  // 渲染优惠券卡片
  const renderCouponCard = (coupon, showReceiveBtn = false) => {
    // 兼容 endTime (可领取) 和 expireTime (我的优惠券)
    const effectiveExpireTime = coupon.expireTime || coupon.endTime;
    const isExpired = effectiveExpireTime && new Date(effectiveExpireTime) < new Date();
    const isUsed = coupon.status === 1;

    return (
      <Card key={coupon.id} className="coupon-card">
        <div className="coupon-content">
          <div className="coupon-left">
            <div className="coupon-amount">
              <span className="amount-symbol">¥</span>
              <span className="amount-value">{coupon.type === 1 ? coupon.discountAmount : coupon.discountRate / 10 + '折'}</span>
            </div>
            <div className="coupon-condition">满{coupon.minAmount}可用</div>
          </div>
          <div className="coupon-right">
            <div className="coupon-name">{coupon.name}</div>
            <div className="coupon-time">
              {effectiveExpireTime ? `有效期至 ${effectiveExpireTime.split('T')[0]}` : '长期有效'}
            </div>
            {showReceiveBtn && receivedCouponIds.has(coupon.id) && coupon.limitPerUser === 1 && (
              <Tag color="success">已领取</Tag>
            )}
            {showReceiveBtn && !isExpired && (coupon.limitPerUser !== 1 || !receivedCouponIds.has(coupon.id)) && (
              <Button
                size="small"
                color="primary"
                onClick={() => receiveMutation.mutate(coupon.id)}
                loading={receiveMutation.isPending}
              >
                立即领取
              </Button>
            )}
            {!showReceiveBtn && isUsed && <Tag color="gray">已使用</Tag>}
            {!showReceiveBtn && isExpired && !isUsed && <Tag color="danger">已过期</Tag>}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="coupon-page">
      {message && <div style={{padding:'10px',background:'#fff3e0',textAlign:'center',fontSize:'14px'}}>{message}</div>}
      <Tabs
        activeKey={activeKey}
        onChange={setActiveKey}
      >
        <Tabs.Tab title="可领取" key="available">
          <div className="coupon-list">
            {loadingAvailable ? (
              <div className="loading">加载中...</div>
            ) : availableCoupons.length > 0 ? (
              availableCoupons.map(coupon => renderCouponCard(coupon, true))
            ) : (
              <Empty description="暂无可领取的优惠券" />
            )}
          </div>
        </Tabs.Tab>

        <Tabs.Tab title="我的优惠券" key="my">
          <Tabs
            activeKey={myCouponTab}
            onChange={(key) => setMyCouponTab(key)}
          >
            <Tabs.Tab title={`未使用 (${unusedCoupons.length})`} key="0">
              <div className="coupon-list">
                {unusedCoupons.length > 0 ? (
                  unusedCoupons.map(c => renderCouponCard(c))
                ) : (
                  <Empty description="暂无未使用的优惠券" />
                )}
              </div>
            </Tabs.Tab>
            <Tabs.Tab title={`已使用 (${usedCoupons.length})`} key="1">
              <div className="coupon-list">
                {usedCoupons.length > 0 ? (
                  usedCoupons.map(c => renderCouponCard(c))
                ) : (
                  <Empty description="暂无已使用的优惠券" />
                )}
              </div>
            </Tabs.Tab>
            <Tabs.Tab title={`已过期 (${expiredCoupons.length})`} key="2">
              <div className="coupon-list">
                {expiredCoupons.length > 0 ? (
                  expiredCoupons.map(c => renderCouponCard(c))
                ) : (
                  <Empty description="暂无已过期的优惠券" />
                )}
              </div>
            </Tabs.Tab>
          </Tabs>
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

export default Coupon;