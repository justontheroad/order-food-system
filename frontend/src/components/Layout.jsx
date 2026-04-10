import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TabBar } from 'antd-mobile';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '../services/api';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = React.useState('home');

  // 同步路由状态到 TabBar
  React.useEffect(() => {
    const path = location.pathname.replace('/', '');
    if (['home', 'menu', 'cart', 'orders', 'profile', 'checkout'].includes(path)) {
      setActive(path);
    }
  }, [location.pathname]);

  // 获取购物车数据（与其他页面共用同一个查询键）
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getList(),
    staleTime: 30000, // 30秒内不会自动重新获取
  });

  // 计算购物车商品总数量
  const cartCount = React.useMemo(() => {
    if (cartData?.data && Array.isArray(cartData.data)) {
      return cartData.data.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    return 0;
  }, [cartData]);

  return (
    <div className="app-container">
      <div className="app-content" style={{ paddingBottom: '60px' }}>
        <Outlet />
      </div>
      <TabBar
        activeKey={active}
        onChange={(key) => {
          setActive(key);
          navigate(key);
        }}
        style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
        }}
      >
        <TabBar.Item key="home" title="首页" icon={<span>🏠</span>} />
        <TabBar.Item key="menu" title="菜单" icon={<span>🍔</span>} />
        <TabBar.Item key="cart" title="购物车" icon={<span>🛒</span>} badge={cartCount > 0 ? cartCount : undefined} />
        <TabBar.Item key="orders" title="订单" icon={<span>📋</span>} />
        <TabBar.Item key="profile" title="我的" icon={<span>👤</span>} />
      </TabBar>
    </div>
  );
};

export default Layout;