import React, { useState } from 'react';
import { Card, Button, List } from 'antd-mobile';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { memberApi } from '../services/api';
import './Member.css';

const Member = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  // 获取会员信息
  const { data: memberInfo, isLoading } = useQuery({
    queryKey: ['memberInfo'],
    queryFn: () => memberApi.getInfo(),
  });

  // 获取积分信息
  const { data: pointsData } = useQuery({
    queryKey: ['memberPoints'],
    queryFn: () => memberApi.getPoints(),
  });

  const member = memberInfo?.data;
  const points = pointsData?.data;

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  // 会员权益列表
  const benefits = [
    { icon: '🎁', title: '积分优惠', desc: '积分可兑换优惠券' },
    { icon: '🎂', title: '生日礼遇', desc: '生日月专属折扣' },
    { icon: '📦', title: '专属优惠券', desc: '会员专享优惠' },
    { icon: '⚡', title: '优先配送', desc: '优先接单和配送' },
    { icon: '💰', title: '满减优惠', desc: '满额立减福利' },
  ];

  // 等级进度计算
  const currentLevelName = member?.level?.name || '普通会员';
  const currentLevelId = member?.levelId || 1;
  const currentProgress = member?.totalAmount || 0;
  const nextLevel = currentLevelId === 1 ? '铜牌会员' : currentLevelId === 2 ? '银牌会员' : currentLevelId === 3 ? '金牌会员' : currentLevelId === 4 ? '钻石会员' : '普通会员';
  const nextThreshold = currentLevelId === 1 ? 500 : currentLevelId === 2 ? 2000 : currentLevelId === 3 ? 5000 : currentLevelId === 4 ? 10000 : 500;
  const progressPercent = Math.min((currentProgress / nextThreshold) * 100, 100);

  return (
    <div className="member-page">
      {message && <div style={{padding:'10px',background:'#fff3e0',textAlign:'center',fontSize:'14px'}}>{message}</div>}
      <div className="member-header">
        <div className="member-avatar">
          {member?.avatar ? (
            <img src={member.avatar} alt="头像" />
          ) : (
            <span>👤</span>
          )}
        </div>
        <div className="member-info">
          <div className="member-name">{member?.nickname || '会员'}</div>
          <div className="member-level">{currentLevelName}</div>
        </div>
        <Button
          size="small"
          onClick={() => navigate('/coupon')}
        >
          领券
        </Button>
      </div>

      <Card className="member-card">
        <div className="points-display">
          <div className="points-value">{points?.points || 0}</div>
          <div className="points-label">当前积分</div>
        </div>
        <Button
          block
          color="primary"
          size="small"
          onClick={() => showMessage('积分兑换功能即将上线')}
        >
          积分兑换
        </Button>
      </Card>

      <Card className="growth-card">
        <div className="growth-title">成长值进度</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="growth-info">
          <span>{currentProgress} / {nextThreshold}</span>
          <span>升级到 {nextLevel}</span>
        </div>
      </Card>

      <Card className="benefits-card">
        <div className="benefits-title">会员权益</div>
        <List>
          {benefits.map((item, index) => (
            <List.Item
              key={index}
              prefix={<span style={{ fontSize: '20px' }}>{item.icon}</span>}
              description={item.desc}
            >
              {item.title}
            </List.Item>
          ))}
        </List>
      </Card>

      <div className="points-detail-btn">
        <Button
          block
          onClick={() => showMessage('积分明细功能即将上线')}
        >
          查看积分明细 >
        </Button>
      </div>
    </div>
  );
};

export default Member;