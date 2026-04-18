import React, { useState, useEffect } from 'react';
import { Form, Input, Card, Button, Radio, Empty } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, cartApi, couponApi } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [couponModalVisible, setCouponModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  // 支付方式
  const [paymentMethod, setPaymentMethod] = useState('wechat');

  // 获取购物车数据
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getList(),
  });

  // 获取用户优惠券
  const { data: myCouponsData } = useQuery({
    queryKey: ['myCoupons'],
    queryFn: () => couponApi.getMyCoupons(),
  });

  const items = cartData?.data || [];
  const myCoupons = myCouponsData?.data || [];
  const originalTotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

  // 可用优惠券（未使用、未过期、满足门槛）
  const availableCoupons = myCoupons.filter(c => {
    if (c.status != 0) return false;
    if (c.expireTime && new Date(c.expireTime) < new Date()) return false;
    if (c.minAmount && originalTotal < Number(c.minAmount)) return false;
    return true;
  });

  // 调用后端预览接口获取优惠金额
  useEffect(() => {
    const fetchPreview = async () => {
      if (originalTotal > 0) {
        try {
          // selectedCoupon.id 是 UserCoupon id, selectedCoupon.couponId 才是 Coupon id
          const res = await couponApi.preview(originalTotal, selectedCoupon?.couponId || null);
          if (res.code === 200) {
            setPreviewData(res.data);
          }
        } catch (error) {
          console.error('预览失败:', error);
        }
      }
    };
    fetchPreview();
  }, [originalTotal, selectedCoupon]);

  const discountAmount = previewData?.discountAmount || 0;
  const totalPrice = previewData?.payAmount || originalTotal;

  const showMessage = (msg, success = false) => {
    setIsSuccess(success);
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  // 创建订单
  const createOrderMutation = useMutation({
    mutationFn: (data) => orderApi.create(data),
  });

  // 提交订单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // 使用后端计算的实际金额
      const orderData = {
        totalAmount: originalTotal,
        discountAmount: discountAmount,
        payAmount: totalPrice,
        remark: values.remark || '',
        couponId: selectedCoupon?.couponId || null,  // 使用 couponId 而非 id
      };

      createOrderMutation.mutate(orderData, {
        onSuccess: () => {
          cartApi.clear();
          queryClient.invalidateQueries(['cart']);
          queryClient.invalidateQueries(['orders']);
          queryClient.invalidateQueries(['myCoupons']);
          if (paymentMethod === 'wechat') {
            showMessage('支付成功', true);
          } else {
            showMessage('订单创建成功，请到店支付', true);
          }
          setTimeout(() => navigate('/orders'), 1500);
        },
        onError: (error) => {
          showMessage(error.message || '订单创建失败');
        },
      });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const selectCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setCouponModalVisible(false);
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page" style={{ padding: '24px' }}>
        <Empty description="购物车是空的" />
        <Button color="primary" style={{ marginTop: '24px' }} onClick={() => navigate('/menu')}>
          去逛逛
        </Button>
      </div>
    );
  }

  return (
    <div className="checkout-page" style={{ padding: '12px' }}>
      {message && (
        <div style={{
          padding: '10px',
          background: isSuccess ? '#e8f5e9' : '#ffebee',
          textAlign: 'center',
          fontSize: '14px',
          marginBottom: '12px',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      <h2>结算</h2>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>订单明细</div>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>{item.productName} x {item.quantity}</span>
            <span>¥{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: '16px' }} onClick={() => setCouponModalVisible(true)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>优惠券</span>
          {selectedCoupon ? (
            <span style={{ color: '#ff4300' }}>-¥{Number(discountAmount).toFixed(2)}</span>
          ) : availableCoupons.length > 0 ? (
            <span style={{ color: '#999' }}>有{availableCoupons.length}张可用 &gt;</span>
          ) : (
            <span style={{ color: '#999' }}>暂无可用 &gt;</span>
          )}
        </div>
      </Card>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>支付方式</div>
        <Radio.Group value={paymentMethod} onChange={(val) => setPaymentMethod(val)}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            <Radio value="wechat" style={{ '--icon-size': '18px' }}>
              <span>💰 微信支付</span>
            </Radio>
            <Radio value="offline" style={{ '--icon-size': '18px' }}>
              <span>💵 线下支付</span>
            </Radio>
          </div>
        </Radio.Group>
      </Card>

      <Form form={form}>
        <Form.Item name="remark" label="备注">
          <Input placeholder="如有特殊要求请填写" />
        </Form.Item>
      </Form>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>订单金额</span>
          <span>¥{originalTotal.toFixed(2)}</span>
        </div>
        {discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#ff4300' }}>
            <span>优惠券</span>
            <span>-¥{Number(discountAmount).toFixed(2)}</span>
          </div>
        )}
        <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>实付金额</span>
          <span style={{ color: '#ff4300', fontSize: '20px' }}>¥{Number(totalPrice).toFixed(2)}</span>
        </div>
      </Card>

      <Button block color="primary" size="large" onClick={handleSubmit} loading={createOrderMutation.isPending}>
        提交订单 ¥{Number(totalPrice).toFixed(2)}
      </Button>

      {/* 优惠券选择弹窗 - 自定义实现 */}
      {couponModalVisible && (
        <div className="coupon-modal-overlay" onClick={() => setCouponModalVisible(false)}>
          <div className="coupon-modal-content" onClick={e => e.stopPropagation()}>
            <div className="coupon-modal-header">
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>选择优惠券</span>
              <span onClick={() => setCouponModalVisible(false)} style={{ cursor: 'pointer', fontSize: '20px' }}>×</span>
            </div>
            <div className="coupon-modal-body">
              {availableCoupons.length > 0 ? (
                availableCoupons.map((coupon) => {
                  const isSelected = selectedCoupon?.id === coupon.id;
                  const discountValue = coupon.type == 1
                    ? `满${Number(coupon.minAmount)}减${Number(coupon.discountAmount)}`
                    : `${Number(coupon.discountRate) / 10}折`;
                  return (
                    <div
                      key={coupon.id}
                      onClick={() => selectCoupon(coupon)}
                      style={{
                        display: 'flex',
                        marginBottom: '12px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: isSelected ? '2px solid #ff4300' : '1px solid #e0e0e0',
                        background: isSelected ? '#fff5f0' : '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: '80px',
                        background: 'linear-gradient(135deg, #ff6b35 0%, #ff4300 100%)',
                        color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px 8px',
                      }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                          {coupon.type == 1 ? `¥${Number(coupon.discountAmount)}` : `${Number(coupon.discountRate) / 10}折`}
                        </div>
                      </div>
                      <div style={{ flex: 1, padding: '12px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{coupon.name}</div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{discountValue}</div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          {coupon.expireTime ? `有效期至 ${coupon.expireTime.split('T')[0]}` : '长期有效'}
                        </div>
                      </div>
                      {isSelected && (
                        <div style={{ display: 'flex', alignItems: 'center', paddingRight: '12px', color: '#ff4300', fontSize: '18px' }}>✓</div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '40px 0', textAlign: 'center', color: '#999' }}>暂无可用优惠券</div>
              )}
            </div>
            <div className="coupon-modal-footer">
              <div
                onClick={() => { setSelectedCoupon(null); setCouponModalVisible(false); }}
                style={{
                  textAlign: 'center',
                  padding: '14px',
                  color: '#666',
                  cursor: 'pointer',
                  borderTop: '1px solid #eee',
                }}
              >
                不使用优惠券
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .coupon-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          align-items: flex-end;
        }
        .coupon-modal-content {
          width: 100%;
          background: #fff;
          border-radius: 16px 16px 0 0;
          max-height: 70vh;
          display: flex;
          flex-direction: column;
        }
        .coupon-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #eee;
        }
        .coupon-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }
        .coupon-modal-footer {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
};

export default Checkout;
