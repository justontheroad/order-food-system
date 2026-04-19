import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import {
  DashboardOutlined,
  ShopOutlined,
  FileTextOutlined,
  TeamOutlined,
  GiftOutlined,
  LogoutOutlined,
  IdcardOutlined
} from '@ant-design/icons'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Members from './pages/Members'
import Promotions from './pages/Promotions'
import UserCoupons from './pages/UserCoupons'
import Login from './pages/Login'

const { Sider, Content, Header } = Layout

const menuItems = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/admin/products', icon: <ShopOutlined />, label: '商品管理' },
  { key: '/admin/orders', icon: <FileTextOutlined />, label: '订单管理' },
  { key: '/admin/members', icon: <TeamOutlined />, label: '会员管理' },
  { key: '/admin/promotions', icon: <GiftOutlined />, label: '促销管理' },
  { key: '/admin/user-coupons', icon: <IdcardOutlined />, label: '用户优惠券' }
]

function AdminLayout() {
  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    window.location.href = '/admin/login'
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light">
        <div style={{ padding: '16px', textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>餐饮管理系统</div>
        <Menu
          mode="inline"
          selectedKeys={[window.location.pathname]}
          items={menuItems}
          onClick={({ key }) => window.location.href = key}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
        </Header>
        <Content style={{ padding: '24px', background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default function App() {
  const isLogin = localStorage.getItem('adminToken')

  return (
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      {isLogin ? (
        <>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/members" element={<Members />} />
            <Route path="/admin/promotions" element={<Promotions />} />
            <Route path="/admin/user-coupons" element={<UserCoupons />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </>
      ) : (
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      )}
    </Routes>
  )
}
