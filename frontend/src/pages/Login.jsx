import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from 'antd-mobile';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setIsSuccess(false);
      setMessage('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login(username, password);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      setIsSuccess(true);
      setMessage('登录成功');
      setTimeout(() => navigate('/home'), 500);
    } catch (error) {
      setIsSuccess(false);
      setMessage(error.message || '登录失败');
      setTimeout(() => setMessage(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setUsername('testuser');
    setPassword('123456');
  };

  return (
    <div className="login-page" style={{ padding: '24px' }}>
      {message && (
        <div style={{
          padding: '10px',
          background: isSuccess ? '#e8f5e9' : '#ffebee',
          textAlign: 'center',
          fontSize: '14px',
          marginBottom: '16px',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}

      <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>欢迎登录</h1>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px', color: '#666' }}>账号</div>
        <Input
          placeholder="请输入用户名或手机号"
          value={username}
          onChange={setUsername}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '8px', color: '#666' }}>密码</div>
        <Input
          placeholder="请输入密码"
          type="password"
          value={password}
          onChange={setPassword}
        />
      </div>

      <Button block color="primary" size="large" onClick={handleLogin} loading={loading}>
        登录
      </Button>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Button fill="none" onClick={handleQuickLogin}>
          一键登录（开发模式）
        </Button>
      </div>
    </div>
  );
};

export default Login;
