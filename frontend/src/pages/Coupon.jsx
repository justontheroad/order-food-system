import React, { useState } from 'react';
import { Tabs, Card, Button, Tag, Empty } from 'antd-mobile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponApi } from '../services/api';
import './Coupon.css';

const Coupon = () => {
  const queryClient = useQueryClient();
  const [activeKey, setActiveKey] = useState('available');
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

  // 过滤我的优惠券
  const unusedCoupons = myCoupons.filter(c => c.status === 'unused');
  const usedCoupons = myCoupons.filter(c => c.status === 'used');
  const expiredCoupons = myCoupons.filter(c => c.status === 'expired');

  // 格式化金额
  const formatAmount = (amount) => {
    return typeof amount === 'number' ? amount.toFixed(2) : '0.00';
  };

  // 渲染优惠券卡片
  const renderCouponCard = (coupon, showReceiveBtn = false) => {
    const isExpired = new Date(coupon.expireTime) < new Date();
    const isUsed = coupon.status === 'used';

    return (
      <Card key={coupon.id} className="coupon-card">
        <div className="coupon-content">
          <div className="coupon-left">
            <div className="coupon-amount">
              <span className="amount-symbol">¥</span>
              <span className="amount-value">{formatAmount(coupon.amount)}</span>
            </div>
            <div className="coupon-condition">满{coupon.minAmount}可用</div>
          </div>
          <div className="coupon-right">
            <div className="coupon-name">{coupon.name}</div>
            <div className="coupon-time">
              {coupon.expireTime ? `有效期至 ${coupon.expireTime.split('T')[0]}` : '长期有效'}
            </div>
            {showReceiveBtn && !isExpired && (
              <Button
                size="small"
                color="primary"
                onClick={() => receiveMutation.mutate(coupon.id)}
                loading={receiveMutation.isPending}
              >
                立即领取
              </Button>
            )}
            {isUsed && <Tag color="gray">已使用</Tag>}
            {isExpired && !isUsed && <Tag color="danger">已过期</Tag>}
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
          <Tabs activeKey={activeKey === 'my' ? 'unused' : activeKey}>
            <Tabs.Tab title={`未使用 (${unusedCoupons.length})`} key="unused">
              <div className="coupon-list">
                {unusedCoupons.length > 0 ? (
                  unusedCoupons.map(coupon => renderCouponCard(coupon))
                ) : (
                  <Empty description="暂无未使用的优惠券" />
                )}
              </div>
            </Tabs.Tab>
            <Tabs.Tab title={`已使用 (${usedCoupons.length})`} key="used">
              <div className="coupon-list">
                {usedCoupons.length > 0 ? (
                  usedCoupons.map(coupon => renderCouponCard(coupon))
                ) : (
                  <Empty description="暂无已使用的优惠券" />
                )}
              </div>
            </Tabs.Tab>
            <Tabs.Tab title={`已过期 (${expiredCoupons.length})`} key="expired">
              <div className="coupon-list">
                {expiredCoupons.length > 0 ? (
                  expiredCoupons.map(coupon => renderCouponCard(coupon))
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