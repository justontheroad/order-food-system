# H5 点餐系统

基于 React + SpringBoot 的 H5 点餐系统

## 技术栈

### 前端
- React 18
- Axios + React Query
- Zustand (状态管理)
- Ant Design Mobile
- Vite

### 后端
- Java 21
- SpringBoot 3.2+
- MyBatis-Plus
- Redis
- Druid 连接池
- MySQL 8.0
- JWT 认证

## 快速开始

### 1. 启动所有服务

```bash
docker-compose up -d
```

### 2. 查看服务状态

```bash
docker-compose ps
```

### 3. 查看日志

```bash
docker-compose logs -f backend
```

### 4. 停止服务

```bash
docker-compose down
```

## 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 80 | H5 页面 |
| 后端 API | 8080 | REST API |
| MySQL | 3306 | 数据库 |
| Redis | 6379 | 缓存 |
| Druid 监控 | 8080/druid | SQL 监控 (admin/admin123) |

## API 接口

### 认证接口
- POST /api/auth/login - 用户登录
- POST /api/auth/register - 用户注册

### 商品接口
- GET /api/categories - 获取分类列表
- GET /api/products - 获取商品列表
- GET /api/products/{id} - 获取商品详情

### 购物车接口
- GET /api/cart - 获取购物车
- POST /api/cart/items - 添加商品
- PUT /api/cart/items/{id} - 更新数量
- DELETE /api/cart/items/{id} - 删除商品

### 订单接口
- POST /api/orders - 创建订单
- GET /api/orders - 获取订单列表
- GET /api/orders/{id} - 获取订单详情
- PUT /api/orders/{id}/cancel - 取消订单

## 开发说明

### 后端开发

```bash
cd backend
mvn spring-boot:run
```

### 前端开发

```bash
cd frontend
npm install
npm run dev
```

## 许可证

MIT License
