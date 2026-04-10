import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Empty, Tag, Skeleton, Modal, Toast } from 'antd-mobile';
import { orderApi } from '../services/api';

const statusMap = {
  0: { text: '待支付', color: 'warning' },
  1: { text: '待制作', color: 'primary' },
  2: { text: '制作中', color: 'success' },
  3: { text: '待取餐', color: 'success' },
  4: { text: '已完成', color: 'default' },
  5: { text: '已取消', color: 'danger' },
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 删除确认弹窗状态
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getDetail(id),
  });

  // 取消订单
  const cancelMutation = useMutation({
    mutationFn: () => orderApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order', id]);
      Toast.show({ content: '订单已取消', icon: 'success' });
      setCancelModalVisible(false);
    },
    onError: (error) => {
      Toast.show({ content: error.message, icon: 'fail' });
      setCancelModalVisible(false);
    },
  });

  const handleCancel = () => {
    setCancelModalVisible(true);
  };

  const confirmCancel = () => {
    cancelMutation.mutate();
  };

  const order = orderData?.data?.order;
  const orderItems = orderData?.data?.items || [];

  const canCancel = (status) => status === 0 || status === 1;

  if (isLoading) {
    return (
      <div className="order-detail-page" style={{ padding: '12px' }}>
        <Skeleton animated rows={10} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail-page" style={{ padding: '24px' }}>
        <Empty description="订单不存在" />
        <Button
          color="primary"
          style={{ marginTop: '24px' }}
          onClick={() => navigate('/orders')}
        >
          返回订单列表
        </Button>
      </div>
    );
  }

  return (
    <div className="order-detail-page" style={{ padding: '12px' }}>
      <h2 style={{ marginBottom: '16px' }}>订单详情</h2>

      <Card style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold' }}>订单号：{order.orderNo}</div>
          <Tag color={statusMap[order.status]?.color}>
            {statusMap[order.status]?.text}
          </Tag>
        </div>
        <div style={{ color: '#666', fontSize: '14px' }}>
          <div>下单时间：{new Date(order.createdAt).toLocaleString()}</div>
        </div>
      </Card>

      <Card style={{ marginBottom: '12px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>商品明细</div>
        {orderItems.length === 0 ? (
          <Empty description="暂无商品" />
        ) : (
          orderItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                paddingBottom: '8px',
                borderBottom: '1px solid #eee',
              }}
            >
              <div>
                <div style={{ fontWeight: '500' }}>{item.productName}</div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  ¥{item.price} x {item.quantity}
                </div>
              </div>
              <div style={{ fontWeight: 'bold', color: '#ff4300' }}>
                ¥{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))
        )}
      </Card>

      <Card style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#666' }}>商品总额</span>
          <span>¥{order.totalAmount?.toFixed(2)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#666' }}>优惠金额</span>
            <span style={{ color: '#ff4300' }}>-¥{order.discountAmount?.toFixed(2)}</span>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            fontSize: '16px',
            borderTop: '1px solid #eee',
            paddingTop: '8px',
          }}
        >
          <span>实付金额</span>
          <span style={{ color: '#ff4300' }}>¥{order.payAmount?.toFixed(2)}</span>
        </div>
        {order.remark && (
          <div style={{ marginTop: '12px', color: '#666', fontSize: '14px' }}>
            备注：{order.remark}
          </div>
        )}
      </Card>

      <div style={{ marginTop: '24px' }}>
        {canCancel(order?.status) && (
          <Button
            block
            color="danger"
            size="large"
            onClick={handleCancel}
            loading={cancelMutation.isPending}
            style={{ marginBottom: '12px' }}
          >
            取消订单
          </Button>
        )}
        <Button
          block
          color="primary"
          size="large"
          onClick={() => navigate('/orders')}
        >
          返回订单列表
        </Button>
      </div>

      {/* 取消订单确认弹窗 */}
      <Modal
        visible={cancelModalVisible}
        content="确定要取消该订单吗？"
        closeOnAction
        onClose={() => setCancelModalVisible(false)}
        actions={[
          {
            key: 'cancel',
            text: '取消',
          },
          {
            key: 'confirm',
            text: '确定',
            bold: true,
            danger: true,
            onClick: confirmCancel,
          },
        ]}
      />
    </div>
  );
};

export default OrderDetail;
