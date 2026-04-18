import axios from 'axios';
import JSEncrypt from 'jsencrypt';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const { data } = response;
    if (data.code === 200) {
      return data;
    }
    return Promise.reject(new Error(data.message || '请求失败'));
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// RSA 加密工具
let cachedPublicKey = null;

const getPublicKey = async () => {
  if (cachedPublicKey) {
    return cachedPublicKey;
  }
  const response = await api.get('/auth/public-key');
  cachedPublicKey = response.data.publicKey;
  return cachedPublicKey;
};

const encryptPassword = async (password) => {
  const publicKey = await getPublicKey();
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  return encrypt.encrypt(password);
};

// 认证 API
export const authApi = {
  // 账号/手机号 + 密码登录
  login: async (username, password) => {
    const encryptedPassword = await encryptPassword(password);
    return api.post('/auth/login', {
      username,
      password: encryptedPassword,
    });
  },
  // 注册
  register: async (data) => {
    if (data.password) {
      data.password = await encryptPassword(data.password);
    }
    return api.post('/auth/register', data);
  },
  // 获取公钥
  getPublicKey: () => api.get('/auth/public-key'),
};

// 分类 API
export const categoryApi = {
  getList: () =>
    api.get('/categories'),
};

// 商品 API
export const productApi = {
  getList: (params) =>
    api.get('/products', { params }),
  getDetail: (id) =>
    api.get(`/products/${id}`),
};

// 购物车 API
export const cartApi = {
  getList: () =>
    api.get('/cart'),
  // 长轮询获取购物车（阻塞最多60秒）
  getListLongPoll: () =>
    api.get('/cart/long-poll', { timeout: 70000 }),
  addItem: (productId, quantity) =>
    api.post('/cart/items', null, { params: { productId, quantity } }),
  updateQuantity: (id, quantity) =>
    api.put(`/cart/items/${id}`, null, { params: { quantity } }),
  removeItem: (id) =>
    api.delete(`/cart/items/${id}`),
  clear: () =>
    api.post('/cart/clear'),
};

// 订单 API
export const orderApi = {
  create: (data) =>
    api.post('/orders', data),
  getList: () =>
    api.get('/orders'),
  getDetail: (id) =>
    api.get(`/orders/${id}`),
  cancel: (id) =>
    api.put(`/orders/${id}/cancel`),
  pay: (id) =>
    api.post('/payments/wechat', null, { params: { orderId: id } }),
};

// 文件上传 API
export const uploadApi = {
  image: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData);
  },
  avatar: (data) => {
    // data 可以是 FormData 或 File
    let formData;
    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();
      formData.append('file', data);
    }
    // 手动创建请求，避免 axios 实例默认的 application/json 头
    const token = localStorage.getItem('token');
    return api.post('/user/avatar', formData, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// 用户 API
export const userApi = {
  getInfo: () => api.get('/user/info'),
  updateInfo: (nickname) => api.put('/user/info', null, { params: { nickname } }),
};

// 会员 API
export const memberApi = {
  getInfo: () => api.get('/member/info'),
  getPoints: () => api.get('/member/points'),
  exchangePoints: (data) => api.post('/member/points/exchange', data),
};

// 优惠券 API
export const couponApi = {
  getAvailable: () => api.get('/promotions/coupons'),
  receive: (couponId) => api.post(`/promotions/coupons/${couponId}/receive`),
  getMyCoupons: () => api.get('/promotions/user/coupons'),
  preview: (orderAmount, couponId) => api.post('/promotions/preview', null, { params: { orderAmount, couponId } }),
};

// 支付 API
export const paymentApi = {
  wechatPay: (data) => api.post('/payments/wechat', data),
  queryPayStatus: (orderId) => api.get(`/payments/${orderId}/status`),
};

export default api;
