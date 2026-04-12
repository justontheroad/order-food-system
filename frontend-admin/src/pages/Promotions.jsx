import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, DatePicker, message, Space, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from '../services/api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

export default function Promotions() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [pagination.current])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getPromotions({ page: pagination.current, pageSize: pagination.pageSize })
      setData(result.data?.records || [])
      setPagination(prev => ({ ...prev, total: result.data?.total || 0 }))
    } catch (error) {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    form.setFieldsValue({
      ...record,
      dateRange: record.startDate && record.endDate
        ? [dayjs(record.startDate), dayjs(record.endDate)]
        : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deletePromotion(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const data = {
        ...values,
        startDate: values.dateRange?.[0].format('YYYY-MM-DD'),
        endDate: values.dateRange?.[1].format('YYYY-MM-DD')
      }
      delete data.dateRange

      if (editingRecord) {
        await updatePromotion(editingRecord.id, data)
        message.success('更新成功')
      } else {
        await createPromotion(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '优惠券名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (v) => v === 'discount' ? <Tag color="blue">折扣</Tag> : <Tag color="green">满减</Tag>
    },
    { title: '门槛', dataIndex: 'minAmount', key: 'minAmount', render: (v) => v ? `¥${v}` : '无门槛' },
    { title: '优惠金额/折扣', dataIndex: 'value', key: 'value', render: (v, r) => r.type === 'discount' ? `${v}折` : `¥${v}` },
    { title: '发放数量', dataIndex: 'totalCount', key: 'totalCount' },
    { title: '已领取', dataIndex: 'usedCount', key: 'usedCount' },
    { title: '有效期', dataIndex: 'endDate', key: 'dateRange', render: (_, r) => `${r.startDate} ~ ${r.endDate}` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={v === 'active' ? 'green' : 'red'}>{v === 'active' ? '生效中' : '已过期'}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>创建优惠券</Button>
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
      <Modal
        title={editingRecord ? '编辑优惠券' : '创建优惠券'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="优惠券名称" rules={[{ required: true }]}>
            <Input placeholder="请输入优惠券名称" />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="discount">折扣</Select.Option>
              <Select.Option value="reduce">满减</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="minAmount" label="使用门槛">
            <InputNumber min={0} placeholder="0 表示无门槛" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="value" label="优惠值" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="totalCount" label="发放数量" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="dateRange" label="有效期" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}