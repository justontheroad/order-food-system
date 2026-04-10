import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * 受保护的路由组件
 * 检查用户是否已登录，未登录则跳转到登录页
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    // 保存当前路径，登录后可以跳回
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;