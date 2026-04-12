import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Empty, Tag, Button, Modal } from 'antd-mobile';
import { orderApi } from '../services/api';

const OrderList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: orderApi.getList,
  });

  const orders = ordersData?.data || [];

  const cancelMutation = useMutation({
    mutationFn: (id) => orderApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      showMessage('订单已取消');
    },
    onError: (error) => {
      showMessage(error.message || '取消失败');
    },
  });

  const handleCancelClick = (order, e) => {
    e.stopPropagation();
    setOrderToCancel(order);
    setCancelModalVisible(true);
  };

  const confirmCancel = () => {
    if (orderToCancel) {
      cancelMutation.mutate(orderToCancel.id);
    }
    setCancelModalVisible(false);
    setOrderToCancel(null);
  };

  const statusMap = {
    0: { text: '待支付', color: 'warning' },
    1: { text: '待制作', color: 'primary' },
    2: { text: '制作中', color: 'success' },
    3: { text: '待取餐', color: 'success' },
    4: { text: '已完成', color: 'default' },
    5: { text: '已取消', color: 'danger' },
  };

  const canCancel = (status) => status === 0 || status === 1;

  if (isLoading) {
    return <div className="order-list-page" style={{ padding: '24px' }}><Empty description="加载中..." /></div>;
  }

  if (orders.length === 0) {
    return (
      <div className="order-list-page" style={{ padding: '24px' }}>
        <Empty description="暂无订单" />
        <Button color="primary" style={{ marginTop: '24px' }} onClick={() => navigate('/menu')}>去点餐</Button>
      </div>
    );
  }

  return (
    <div className="order-list-page" style={{ padding: '12px' }}>
      {message && (
        <div style={{ padding: '10px', background: '#fff3e0', textAlign: 'center', fontSize: '14px', marginBottom: '12px', borderRadius: '4px' }}>{message}</div>
      )}
      {orders.map((order) => (
        <Card key={order.id} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => navigate(`/orders/${order.id}`)}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>订单号：{order.orderNo}</div>
              <div style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>¥{order.payAmount} | {new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <Tag color={statusMap[order.status]?.color}>{statusMap[order.status]?.text}</Tag>
          </div>
          {canCancel(order.status) && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
              <Button block color="danger" fill="outline" size="small" onClick={(e) => handleCancelClick(order, e)} loading={cancelMutation.isPending}>取消订单</Button>
            </div>
          )}
        </Card>
      ))}

      <Modal visible={cancelModalVisible} content="确定要取消该订单吗？" closeOnAction onClose={() => setCancelModalVisible(false)} actions={[
        { key: 'cancel', text: '取消' },
        { key: 'confirm', text: '确定', bold: true, danger: true, onClick: confirmCancel },
      ]} />
    </div>
  );
};

export default OrderList;
