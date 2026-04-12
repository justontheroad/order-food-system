import React, { useState } from 'react';
import { Card, Button } from 'antd-mobile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../services/api';

const ProductCard = ({ product, onAddToCart }) => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [imageError, setImageError] = useState(false);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 1500);
  };

  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addItem(product.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      showMessage('已加入购物车');
      onAddToCart?.();
    },
    onError: (error) => {
      showMessage(error.message || '添加失败');
    },
  });

  const handleAdd = () => {
    addToCartMutation.mutate();
  };

  // 构建完整的图片URL
  const imageUrl = product.imageUrl?.startsWith('http')
    ? product.imageUrl
    : `http://localhost:8080${product.imageUrl}`;

  return (
    <>
      {message && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 9999,
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      <Card style={{ marginBottom: '12px', padding: 0, overflow: 'hidden' }}>
        <div style={{
          height: '160px',
          overflow: 'hidden',
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {product.imageUrl && !imageError ? (
            <img
              alt={product.name}
              src={imageUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <span style={{ fontSize: '48px', color: '#ccc' }}>🍽️</span>
          )}
        </div>
        <div style={{ padding: '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{product.name}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#ff4300', fontSize: '18px', fontWeight: 'bold' }}>
                ¥{product.price}
              </span>
              {product.originalPrice && (
                <span style={{ color: '#999', textDecoration: 'line-through', marginLeft: '8px', fontSize: '14px' }}>
                  ¥{product.originalPrice}
                </span>
              )}
            </div>
            <Button
              size="small"
              color="primary"
              onClick={handleAdd}
              loading={addToCartMutation.isPending}
            >
              加入购物车
            </Button>
          </div>
          {product.description && (
            <p style={{ color: '#666', fontSize: '14px', margin: '8px 0 0' }}>
              {product.description}
            </p>
          )}
        </div>
      </Card>
    </>
  );
};

export default ProductCard;
