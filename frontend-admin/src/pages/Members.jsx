import { useState, useEffect } from 'react'
import { Table, Button, Modal, InputNumber, message, Space, Tag } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { getMembers, updateMemberPoints } from '../services/api'

export default function Members() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [pointsModalVisible, setPointsModalVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [pointsValue, setPointsValue] = useState(0)

  useEffect(() => {
    loadData()
  }, [pagination.current])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getMembers({ page: pagination.current, pageSize: pagination.pageSize })
      setData(result.data?.records || [])
      setPagination(prev => ({ ...prev, total: result.data?.total || 0 }))
    } catch (error) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPoints = (record) => {
    setSelectedMember(record)
    setPointsValue(record.points || 0)
    setPointsModalVisible(true)
  }

  const handleUpdatePoints = async () => {
    try {
      await updateMemberPoints(selectedMember.id, pointsValue)
      message.success('积分更新成功')
      setPointsModalVisible(false)
      loadData()
    } catch (error) {
      message.error('更新失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '姓名', dataIndex: 'username', key: 'username' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '积分', dataIndex: 'points', key: 'points' },
    {
      title: '等级',
      dataIndex: 'level_name',
      key: 'level_name',
      render: (v) => v ? <Tag color="gold">{v}</Tag> : '-'
    },
    { title: '注册时间', dataIndex: 'created_at', key: 'created_at' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" icon={<EditOutlined />} onClick={() => handleEditPoints(record)}>调整积分</Button>
      )
    }
  ]

  return (
    <div>
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
      <Modal
        title="调整积分"
        open={pointsModalVisible}
        onOk={handleUpdatePoints}
        onCancel={() => setPointsModalVisible(false)}
      >
        <p>会员：{selectedMember?.username || '未知'}</p>
        <p>当前积分：{selectedMember?.points}</p>
        <InputNumber
          min={0}
          value={pointsValue}
          onChange={setPointsValue}
          style={{ width: '100%' }}
        />
      </Modal>
    </div>
  )
}