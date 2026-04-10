import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd-mobile';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div style={{ padding: '16px' }}>
        <h1 style={{ fontSize: '24px', textAlign: 'center', marginBottom: '24px' }}>
          欢迎点餐
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div
            onClick={() => navigate('/menu')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '24px',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🍔</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>菜单</div>
          </div>

          <div
            onClick={() => navigate('/cart')}
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '12px',
              padding: '24px',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🛒</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>购物车</div>
          </div>

          <div
            onClick={() => navigate('/orders')}
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '12px',
              padding: '24px',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>📋</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>订单</div>
          </div>

          <div
            onClick={() => navigate('/profile')}
            style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              borderRadius: '12px',
              padding: '24px',
              color: 'white',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>👤</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>我的</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
