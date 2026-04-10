import React from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { Form, Input, Button, Card, Toast, Empty } from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { orderApi, cartApi } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  // 获取购物车数据
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getList(),
  });

  const items = cartData?.data || [];
  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

  // 创建订单
  const createOrderMutation = useMutation({
    mutationFn: (data) => orderApi.create(data),
    onSuccess: () => {
      // 清空购物车
      cartApi.clear();
      queryClient.invalidateQueries(['cart']);
      queryClient.invalidateQueries(['orders']);
      Toast.show({ content: '订单创建成功', icon: 'success' });
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    },
    onError: (error) => {
      Toast.show({ content: error.message || '订单创建失败', icon: 'fail' });
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createOrderMutation.mutate({
        totalAmount: totalPrice,
        discountAmount: 0,
        payAmount: totalPrice,
        remark: values.remark,
      });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-page" style={{ padding: '24px' }}>
        <Empty description="购物车是空的" />
        <Button
          color="primary"
          style={{ marginTop: '24px' }}
          onClick={() => navigate('/menu')}
        >
          去逛逛
        </Button>
      </div>
    );
  }

  return (
    <div className="checkout-page" style={{ padding: '12px' }}>
      <h2>结算</h2>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>订单明细</div>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>{item.productName} x {item.quantity}</span>
            <span>¥{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px', fontWeight: 'bold' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>合计</span>
            <span style={{ color: '#ff4300' }}>¥{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Form form={form}>
        <Form.Item name="remark" label="备注">
          <Input placeholder="如有特殊要求请填写" />
        </Form.Item>
      </Form>

      <Button
        block
        color="primary"
        size="large"
        onClick={handleSubmit}
        loading={createOrderMutation.isPending}
      >
        提交订单 ¥{totalPrice.toFixed(2)}
      </Button>
    </div>
  );
};

export default Checkout;