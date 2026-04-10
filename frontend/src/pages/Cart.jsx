import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Empty, Stepper, Modal, Toast } from 'antd-mobile';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 删除确认弹窗状态
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // 获取购物车数据
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getList(),
  });

  const items = cartData?.data || [];

  // 计算总数量和总价
  const totalCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

  // 更新数量
  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }) => cartApi.updateQuantity(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
    },
  });

  // 删除
  const removeMutation = useMutation({
    mutationFn: (id) => cartApi.removeItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      Toast.show({ content: '已删除', icon: 'success' });
    },
  });

  const handleQuantityChange = (item, value) => {
    if (value <= 0) {
      // 数量为 0 时显示删除确认
      setItemToDelete(item);
      setDeleteModalVisible(true);
    } else {
      updateMutation.mutate({ id: item.id, quantity: value });
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeMutation.mutate(itemToDelete.id);
    }
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="cart-page" style={{ padding: '24px' }}>
        <Empty description="加载中..." />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page" style={{ padding: '24px' }}>
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
    <div className="cart-page">
      <div style={{ padding: '12px' }}>
        {items.map((item) => (
          <Card key={item.id} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold' }}>{item.productName}</div>
                <div style={{ color: '#ff4300' }}>¥{item.price}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Stepper
                  value={item.quantity}
                  min={0}
                  max={99}
                  onChange={(value) => handleQuantityChange(item, value)}
                />
                <Button
                  size="mini"
                  fill="outline"
                  color="danger"
                  onClick={() => handleDeleteClick(item)}
                >
                  删除
                </Button>
              </div>
            </div>
          </Card>
        ))}

        <Card style={{ marginTop: '24px', backgroundColor: '#f5f5f5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div>共 {totalCount} 件商品</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4300' }}>
                合计：¥{totalPrice.toFixed(2)}
              </div>
            </div>
            <Button
              color="primary"
              size="large"
              onClick={() => navigate('/checkout')}
            >
              去结算
            </Button>
          </div>
        </Card>
      </div>

      {/* 删除确认弹窗 */}
      <Modal
        visible={deleteModalVisible}
        content={`确定要删除 ${itemToDelete?.productName || '该商品'} 吗？`}
        closeOnAction
        onClose={() => setDeleteModalVisible(false)}
        actions={[
          {
            key: 'cancel',
            text: '取消',
          },
          {
            key: 'confirm',
            text: '删除',
            bold: true,
            danger: true,
            onClick: confirmDelete,
          },
        ]}
      />
    </div>
  );
};

export default Cart;