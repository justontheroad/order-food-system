import { useState, useEffect, useCallback } from 'react'
import { Table, Button, Select, Drawer, Descriptions, Tag, message, Space } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { getOrders, getOrder, updateOrderStatus } from '../services/api'

const statusMap = {
  0: { text: '待支付', color: 'orange' },
  1: { text: '待制作', color: 'blue' },
  2: { text: '制作中', color: 'cyan' },
  3: { text: '待取餐', color: 'green' },
  4: { text: '已完成', color: 'default' },
  5: { text: '已取消', color: 'red' }
}

export default function Orders() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [statusFilter, setStatusFilter] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: pagination.current, pageSize: pagination.pageSize }
      if (statusFilter) params.status = statusFilter
      const result = await getOrders(params)
      setData(result.data?.records || [])
      setPagination(prev => ({ ...prev, total: result.data?.total || 0 }))
    } catch (error) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }, [pagination.current, statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleViewDetail = async (id) => {
    setDetailLoading(true)
    setDetailVisible(true)
    try {
      const result = await getOrder(id)
      setDetailData(result.data || result)
    } catch (error) {
      message.error('加载详情失败')
      setDetailVisible(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status)
      message.success('状态更新成功')
      loadData()
      if (detailVisible) handleViewDetail(id)
    } catch (error) {
      message.error('更新失败')
    }
  }

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '会员', dataIndex: 'memberName', key: 'memberName' },
    { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v) => `¥${v}` },
    {
      title: '状态',
      dataIndex: 'statusText',
      key: 'statusText',
      render: (v, record) => <Tag color={statusMap[record.status]?.color}>{v}</Tag>
    },
    { title: '下单时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record.id)}>详情</Button>
          {record.status === 0 && (
            <Button type="link" onClick={() => handleUpdateStatus(record.id, 5)}>取消</Button>
          )}
          {record.status === 1 && (
            <Button type="link" onClick={() => handleUpdateStatus(record.id, 2)}>开始制作</Button>
          )}
          {record.status === 2 && (
            <Button type="link" onClick={() => handleUpdateStatus(record.id, 3)}>完成制作</Button>
          )}
          {record.status === 3 && (
            <Button type="link" onClick={() => handleUpdateStatus(record.id, 4)}>确认取餐</Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="筛选状态"
          allowClear
          style={{ width: 120 }}
          onChange={setStatusFilter}
        >
          {Object.entries(statusMap).map(([k, v]) => (
            <Select.Option key={k} value={parseInt(k)}>{v.text}</Select.Option>
          ))}
        </Select>
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
      <Drawer
        title="订单详情"
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        width={400}
      >
        {detailData && (
          <Descriptions column={1}>
            <Descriptions.Item label="订单号">{detailData.orderNo}</Descriptions.Item>
            <Descriptions.Item label="会员">{detailData.member?.name}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{detailData.member?.phone}</Descriptions.Item>
            <Descriptions.Item label="订单金额">¥{detailData.totalAmount}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[detailData.status]?.color}>{statusMap[detailData.status]?.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="下单时间">{detailData.createdAt}</Descriptions.Item>
            <Descriptions.Item label="商品">
              {detailData.items?.map(item => (
                <div key={item.id}>
                  {item.name} x {item.quantity} - ¥{item.price}
                </div>
              ))}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  )
}