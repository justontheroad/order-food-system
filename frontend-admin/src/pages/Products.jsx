import { useState, useEffect, useRef } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Upload, message, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImage } from '../services/api'

export default function Products() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)
  const [filter, setFilter] = useState({})
  const [imageUrl, setImageUrl] = useState('')
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [pagination.current, filter])

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await getProducts({ page: pagination.current, pageSize: pagination.pageSize, ...filter })
      // 后端返回 { records: [], total: n } 在 result.data 中
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
    setImageUrl('')
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingRecord(record)
    setImageUrl(record.imageUrl || '')
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        await updateProduct(editingRecord.id, values)
        message.success('更新成功')
      } else {
        await createProduct(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleImageUpload = async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'products')
    try {
      const response = await uploadImage(formData)
      const url = response.data
      form.setFieldsValue({ imageUrl: url })
      setImageUrl(url)
      message.success('上传成功')
    } catch (error) {
      message.error('上传失败')
    }
    return false
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v) => `¥${v}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v) => v === 1 ? '在售' : '下架' },
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
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加商品</Button>
        <Input.Search placeholder="搜索商品" onSearch={v => setFilter({ search: v })} style={{ width: 200 }} />
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
        title={editingRecord ? '编辑商品' : '添加商品'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="categoryId" label="分类" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={1}>热销推荐</Select.Option>
              <Select.Option value={2}>主食</Select.Option>
              <Select.Option value={3}>饮品</Select.Option>
              <Select.Option value={4}>小吃</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="imageUrl" label="商品图片">
            <div>
              <Upload beforeUpload={handleImageUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />}>上传图片</Button>
              </Upload>
              {imageUrl && (
                <div style={{ marginTop: 8 }}>
                  <img src={imageUrl} alt="商品图片" style={{ maxWidth: 200, maxHeight: 150 }} />
                </div>
              )}
            </div>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>上架</Select.Option>
              <Select.Option value={0}>下架</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}