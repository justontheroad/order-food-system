import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Toast } from 'antd-mobile';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const loginMutation = useMutation({
    mutationFn: (data) => authApi.login(data.username, data.password),
    onSuccess: (res) => {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.userId);
      Toast.show({ content: '登录成功', icon: 'success' });
      navigate('/home');
    },
    onError: (error) => {
      Toast.show({ content: error.message || '登录失败', icon: 'fail' });
    },
  });

  const handleSubmit = (values) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="login-page" style={{ padding: '24px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>欢迎登录</h1>

      <Form
        form={form}
        onFinish={handleSubmit}
        footer={
          <Button
            block
            color="primary"
            size="large"
            htmlType="submit"
            loading={loginMutation.isPending}
          >
            登录
          </Button>
        }
      >
        <Form.Item
          name="username"
          label="账号"
          rules={[{ required: true, message: '请输入用户名或手机号' }]}
        >
          <Input placeholder="请输入用户名或手机号" />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input placeholder="请输入密码" type="password" />
        </Form.Item>
      </Form>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Button
          fill="none"
          onClick={() => {
            // 快速登录（开发用）
            form.setFieldsValue({ username: 'testuser', password: '123456' });
            loginMutation.mutate({ username: 'testuser', password: '123456' });
          }}
        >
          一键登录（开发模式）
        </Button>
      </div>
    </div>
  );
};

export default Login;
