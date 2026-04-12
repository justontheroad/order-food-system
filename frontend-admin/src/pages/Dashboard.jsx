import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table } from 'antd'
import { getStatistics, getHotProducts } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalMembers: 0
  })
  const [hotProducts, setHotProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsData, productsData] = await Promise.all([
        getStatistics(),
        getHotProducts()
      ])
      setStats(statsData.data || statsData)
      setHotProducts(productsData.data || productsData)
    } catch (error) {
      console.error('Failed to load statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const productColumns = [
    { title: '排名', key: 'rank', width: 60, render: (_, __, index) => index + 1 },
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '价格', dataIndex: 'price', key: 'price', render: v => `¥${v}` },
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder' }
  ]

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="今日订单数" value={stats.todayOrders} loading={loading} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日营收" value={stats.todayRevenue} prefix="¥" loading={loading} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待处理订单" value={stats.pendingOrders} loading={loading} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="会员总数" value={stats.totalMembers} loading={loading} />
          </Card>
        </Col>
      </Row>
      <Card title="热销商品 TOP 5" style={{ marginTop: 16 }}>
        <Table
          columns={productColumns}
          dataSource={hotProducts}
          rowKey="id"
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  )
}
