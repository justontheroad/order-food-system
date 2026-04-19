import React, { useState } from 'react';
import { Tabs, Card, Tag, Empty } from 'antd-mobile';
import { useQuery } from '@tanstack/react-query';
import { couponApi } from '../services/api';
import './Coupon.css';

const statusMap = {
  0: { text: '未使用', color: 'success' },
  1: { text: '已使用', color: 'gray' },
  2: { text: '已过期', color: 'danger' },
};

const MyCoupons = () => {
  const [activeTab, setActiveTab] = useState('0');

  const { data: myCouponsData, isLoading } = useQuery({
    queryKey: ['myCoupons'],
    queryFn: () => couponApi.getMyCoupons(),
  });

  const myCoupons = myCouponsData?.data || [];

  const unusedCoupons = myCoupons.filter(c => c.status === 0);
  const usedCoupons = myCoupons.filter(c => c.status === 1);
  const expiredCoupons = myCoupons.filter(c => c.status === 2);

  const renderCouponCard = (coupon) => {
    const effectiveExpireTime = coupon.expireTime || coupon.endTime;
    const isExpired = effectiveExpireTime && new Date(effectiveExpireTime) < new Date();

    return (
      <Card key={coupon.id} className="coupon-card">
        <div className="coupon-content">
          <div className="coupon-left">
            <div className="coupon-amount">
              <span className="amount-symbol">¥</span>
              <span className="amount-value">
                {coupon.type === 1
                  ? coupon.discountAmount
                  : (coupon.discountRate / 10) + '折'}
              </span>
            </div>
            <div className="coupon-condition">
              满{coupon.minAmount}可用
            </div>
          </div>
          <div className="coupon-right">
            <div className="coupon-name">{coupon.name}</div>
            <div className="coupon-time">
              {effectiveExpireTime
                ? `有效期至 ${effectiveExpireTime.split('T')[0]}`
                : '长期有效'}
            </div>
            {coupon.status === 0 && !isExpired && (
              <Tag color="success">未使用</Tag>
            )}
            {coupon.status === 1 && (
              <Tag color="gray">已使用</Tag>
            )}
            {(coupon.status === 2 || isExpired) && (
              <Tag color="danger">已过期</Tag>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const currentCoupons =
    activeTab === '0' ? unusedCoupons :
    activeTab === '1' ? usedCoupons :
    expiredCoupons;

  return (
    <div className="coupon-page">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
      >
        <Tabs.Tab title={`未使用 (${unusedCoupons.length})`} key="0">
          <div className="coupon-list">
            {isLoading ? (
              <div className="loading">加载中...</div>
            ) : unusedCoupons.length > 0 ? (
              unusedCoupons.map(c => renderCouponCard(c))
            ) : (
              <Empty description="暂无未使用的优惠券" />
            )}
          </div>
        </Tabs.Tab>
        <Tabs.Tab title={`已使用 (${usedCoupons.length})`} key="1">
          <div className="coupon-list">
            {isLoading ? (
              <div className="loading">加载中...</div>
            ) : usedCoupons.length > 0 ? (
              usedCoupons.map(c => renderCouponCard(c))
            ) : (
              <Empty description="暂无已使用的优惠券" />
            )}
          </div>
        </Tabs.Tab>
        <Tabs.Tab title={`已过期 (${expiredCoupons.length})`} key="2">
          <div className="coupon-list">
            {isLoading ? (
              <div className="loading">加载中...</div>
            ) : expiredCoupons.length > 0 ? (
              expiredCoupons.map(c => renderCouponCard(c))
            ) : (
              <Empty description="暂无已过期的优惠券" />
            )}
          </div>
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

export default MyCoupons;
