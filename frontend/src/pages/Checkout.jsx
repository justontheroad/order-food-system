import React, { useState } from 'react';
import { Form, Input, Card, Button, Radio, Empty } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi, cartApi } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // 支付方式
  const [paymentMethod, setPaymentMethod] = useState('wechat');

  // 获取购物车数据
  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getList(),
  });

  const items = cartData?.data || [];
  const originalTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const discountAmount = 0;
  const totalPrice = Math.max(0, originalTotal - discountAmount);

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
      const orderData = {
        totalAmount: originalTotal,
        discountAmount: discountAmount,
        payAmount: totalPrice,
        remark: values.remark || '',
      };

      createOrderMutation.mutate(orderData, {
        onSuccess: () => {
          cartApi.clear();
          queryClient.invalidateQueries(['cart']);
          queryClient.invalidateQueries(['orders']);
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

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>优惠券</span>
          <span style={{ color: '#999' }}>暂无可用 &gt;</span>
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
        <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>实付金额</span>
          <span style={{ color: '#ff4300', fontSize: '20px' }}>¥{totalPrice.toFixed(2)}</span>
        </div>
      </Card>

      <Button block color="primary" size="large" onClick={handleSubmit} loading={createOrderMutation.isPending}>
        提交订单 ¥{totalPrice.toFixed(2)}
      </Button>
    </div>
  );
};

export default Checkout;
