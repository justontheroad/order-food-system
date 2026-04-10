import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { List, Button, Toast, ImageUploader, Dialog, Card } from 'antd-mobile';
import { userApi, uploadApi } from '../services/api';
import { CameraOutline } from 'antd-mobile-icons';

const Profile = () => {
  const navigate = useNavigate();
  const { data: userData, refetch } = useQuery({
    queryKey: ['userInfo'],
    queryFn: () => userApi.getInfo(),
  });

  const user = userData?.data;
  const nickname = user?.nickname || localStorage.getItem('nickname') || '用户';
  const userId = user?.id || localStorage.getItem('userId');
  const avatar = user?.avatar;

  const [uploading, setUploading] = useState(false);

  const handleUploadAvatar = async (fileList) => {
    if (fileList.length === 0) return;

    setUploading(true);
    try {
      const file = fileList[0];
      // antd-mobile v5 的 file 对象有 file 属性是原始 File 对象
      const rawFile = file.file || file.originFileObj;
      if (!rawFile) {
        Toast.show({ content: '请选择文件', icon: 'fail' });
        return;
      }
      const formData = new FormData();
      formData.append('file', rawFile);

      await uploadApi.avatar(formData);
      Toast.show({ content: '头像上传成功', icon: 'success' });
      refetch();
    } catch (error) {
      console.error('Upload error:', error);
      Toast.show({ content: '上传失败', icon: 'fail' });
    } finally {
      setUploading(false);
    }
  };

  const handleClearAvatar = () => {
    Dialog.confirm({
      content: '确定要清除头像吗？',
      onConfirm: async () => {
        refetch();
      },
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');
    Toast.show({ content: '已退出登录', icon: 'success' });
    navigate('/login');
  };

  return (
    <div className="profile-page" style={{ padding: '16px' }}>
      <h2 style={{ marginBottom: '24px' }}>我的</h2>

      {/* 头像上传 */}
      <Card style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt="头像"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '32px', color: '#ccc' }}>👤</span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{nickname}</div>
            <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
              用户 ID: {userId}
            </div>
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <ImageUploader
            upload={async (file) => {
              setUploading(true);
              try {
                // antd-mobile v5: file 是 File 对象，需要返回 { url } 给组件显示
                const formData = new FormData();
                formData.append('file', file);
                const result = await uploadApi.avatar(formData);
                Toast.show({ content: '头像上传成功', icon: 'success' });
                refetch();
                // 返回 url 给 ImageUploader 显示预览
                return { url: result.data.url };
              } catch (error) {
                console.error('Upload error:', error);
                Toast.show({ content: '上传失败', icon: 'fail' });
                throw error;
              } finally {
                setUploading(false);
              }
            }}
            maxCount={1}
          >
            <button style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: '#f5f5f5',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              cursor: 'pointer',
            }}>
              <CameraOutline />
            </button>
          </ImageUploader>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
            点击上传头像
          </div>
        </div>
      </Card>

      <List header="账户信息">
        <List.Item extra={nickname}>昵称</List.Item>
        <List.Item extra={userId}>用户 ID</List.Item>
      </List>

      <div style={{ marginTop: '24px' }}>
        <Button block color="danger" size="large" onClick={handleLogout}>
          退出登录
        </Button>
      </div>
    </div>
  );
};

export default Profile;
