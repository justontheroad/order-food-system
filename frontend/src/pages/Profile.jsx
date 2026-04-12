import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { List, Button, ImageUploader, Card } from 'antd-mobile';
import { userApi, uploadApi } from '../services/api';
import { CameraOutline } from 'antd-mobile-icons';

const Profile = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const showMessage = (msg, success = false) => {
    setIsSuccess(success);
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const { data: userData, refetch } = useQuery({
    queryKey: ['userInfo'],
    queryFn: () => userApi.getInfo(),
  });

  const user = userData?.data;
  const nickname = user?.nickname || localStorage.getItem('nickname') || '用户';
  const userId = user?.id || localStorage.getItem('userId');
  const avatar = user?.avatar;

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');
    navigate('/login');
  };

  return (
    <div className="profile-page" style={{ padding: '16px' }}>
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

      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '24px',
            width: '280px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '16px', fontSize: '16px' }}>确定要退出登录吗？</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button style={{ flex: 1 }} onClick={() => setShowLogoutConfirm(false)}>取消</Button>
              <Button color="danger" style={{ flex: 1 }} onClick={confirmLogout}>确定</Button>
            </div>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: '24px' }}>我的</h2>

      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {avatar ? <img src={avatar} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '32px', color: '#ccc' }}>👤</span>}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{nickname}</div>
            <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>用户 ID: {userId}</div>
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <ImageUploader
            upload={async (file) => {
              try {
                const formData = new FormData();
                formData.append('file', file);
                const result = await uploadApi.avatar(formData);
                showMessage('头像上传成功', true);
                refetch();
                return { url: result.data.url };
              } catch (error) {
                showMessage('上传失败');
                throw error;
              }
            }}
            maxCount={1}
          >
            <button style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#f5f5f5', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', cursor: 'pointer' }}>
              <CameraOutline />
            </button>
          </ImageUploader>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>点击上传头像</div>
        </div>
      </Card>

      <List header="账户信息">
        <List.Item extra={nickname}>昵称</List.Item>
        <List.Item extra={userId}>用户 ID</List.Item>
      </List>

      <div style={{ marginTop: '24px' }}>
        <Button block color="danger" size="large" onClick={handleLogout}>退出登录</Button>
      </div>
    </div>
  );
};

export default Profile;
