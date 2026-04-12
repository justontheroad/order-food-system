import axios from 'axios'

const adminApi = axios.create({
  baseURL: '/api/admin',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加token
adminApi.interceptors.request.use(
  config => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
adminApi.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      window.location.href = '/admin/login'
    }
    return Promise.reject(error)
  }
)

// 统计接口
export const getStatistics = () => adminApi.get('/statistics')
export const getHotProducts = () => adminApi.get('/statistics/hot-products')

// 商品接口
export const getProducts = (params) => adminApi.get('/products', { params })
export const getProduct = (id) => adminApi.get(`/products/${id}`)
export const createProduct = (data) => adminApi.post('/products', data)
export const updateProduct = (id, data) => adminApi.put(`/products/${id}`, data)
export const deleteProduct = (id) => adminApi.delete(`/products/${id}`)

// 订单接口
export const getOrders = (params) => adminApi.get('/orders', { params })
export const getOrder = (id) => adminApi.get(`/orders/${id}`)
export const updateOrderStatus = (id, status) => adminApi.put(`/orders/${id}/status`, { status })

// 会员接口
export const getMembers = (params) => adminApi.get('/members', { params })
export const getMember = (id) => adminApi.get(`/members/${id}`)
export const updateMemberPoints = (id, points) => adminApi.put(`/members/${id}/points`, { points })

// 促销接口
export const getPromotions = (params) => adminApi.get('/promotions', { params })
export const getPromotion = (id) => adminApi.get(`/promotions/${id}`)
export const createPromotion = (data) => adminApi.post('/promotions', data)
export const updatePromotion = (id, data) => adminApi.put(`/promotions/${id}`, data)
export const deletePromotion = (id) => adminApi.delete(`/promotions/${id}`)

// 文件上传
export const uploadImage = (formData) => adminApi.post('/upload/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})

export default adminApi