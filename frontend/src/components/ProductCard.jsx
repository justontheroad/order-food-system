import React from 'react';
import { Card, Button, Toast } from 'antd-mobile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../services/api';

const ProductCard = ({ product, onAddToCart }) => {
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addItem(product.id, 1),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      Toast.show({ content: '已加入购物车', icon: 'success' });
    },
    onError: (error) => {
      Toast.show({ content: error.message || '添加失败', icon: 'fail' });
    },
  });

  const handleAdd = () => {
    addToCartMutation.mutate();
  };

  // 处理图片加载失败
  const [imageError, setImageError] = React.useState(false);

  return (
    <Card style={{ marginBottom: '12px', padding: 0, overflow: 'hidden' }}>
      {product.imageUrl && !imageError ? (
        <div style={{ height: '150px', overflow: 'hidden' }}>
          <img
            alt={product.name}
            src={product.imageUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div style={{ height: '150px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '40px', color: '#ccc' }}>🍽️</span>
        </div>
      )}
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
  );
};

export default ProductCard;