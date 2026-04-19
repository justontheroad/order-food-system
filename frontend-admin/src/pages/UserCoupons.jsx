import { useState, useEffect, useCallback } from 'react'
import { Table, Input, Select, Space, Tag, message } from 'antd'
import { getUserCoupons } from '../services/api'

const statusMap = {
  0: { text: '未使用', color: 'green' },
  1: { text: '已使用', color: 'gray' },
  2: { text: '已过期', color: 'red' }
}

export default function UserCoupons() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [username, setUsername] = useState('')
  const [statusFilter, setStatusFilter] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: pagination.current, pageSize: pagination.pageSize }
      if (username) params.username = username
      if (statusFilter !== null && statusFilter !== undefined) params.status = statusFilter
      const result = await getUserCoupons(params)
      setData(result.data?.records || [])
      setPagination(prev => ({ ...prev, total: result.data?.total || 0 }))
    } catch (error) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }, [pagination.current, username, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }))
    loadData()
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户', dataIndex: 'username', key: 'username' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '优惠券', dataIndex: 'couponName', key: 'couponName' },
    {
      title: '类型',
      dataIndex: 'couponType',
      key: 'couponType',
      render: (v) => v === 1 ? <Tag color="green">满减</Tag> : <Tag color="blue">折扣</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.text}</Tag>
    },
    { title: '领取时间', dataIndex: 'receivedAt', key: 'receivedAt' },
    {
      title: '使用时间',
      dataIndex: 'usedAt',
      key: 'usedAt',
      render: (v) => v || '-'
    }
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onPressEnter={handleSearch}
          style={{ width: 150 }}
          allowClear
        />
        <Select
          placeholder="筛选状态"
          allowClear
          style={{ width: 120 }}
          value={statusFilter}
          onChange={(v) => {
            setStatusFilter(v)
            setPagination(prev => ({ ...prev, current: 1 }))
          }}
        >
          {Object.entries(statusMap).map(([k, v]) => (
            <Select.Option key={k} value={parseInt(k)}>{v.text}</Select.Option>
          ))}
        </Select>
        <Input.Search
          placeholder="搜索"
          onSearch={handleSearch}
          style={{ width: 100 }}
        />
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page) => setPagination(prev => ({ ...prev, current: page }))
        }}
      />
    </div>
  )
}
