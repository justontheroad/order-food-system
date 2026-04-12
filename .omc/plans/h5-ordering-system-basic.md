---
name: H5 点餐系统 - 基础版
description: 基础点餐功能版本开发计划（菜单展示、购物车、下单、订单状态）
type: project
---

# H5 点餐系统开发计划 - 基础版

## 需求摘要

构建一个 H5 点餐程序，包含基础点餐功能。前端使用 React 开发，后端使用 SpringBoot + MySQL，部署采用 Docker 容器化。

### 核心功能
- 菜单展示（商品列表、商品详情）
- 购物车管理（添加、删除、修改数量）
- 下单功能（订单创建）
- 订单状态查看
- JWT Token 认证（预留手机号和微信登录扩展）
- 微信支付、支付宝支付接口预留

---

## 验收标准

| 序号 | 功能模块 | 验收标准 |
|------|----------|----------|
| 1 | 菜单展示 | 商品列表 API 响应时间 < 200ms，支持分页加载 |
| 2 | 商品详情 | 商品详情 API 返回完整信息（名称、价格、图片、描述） |
| 3 | 购物车 | 支持增删改查，数据实时同步到后端 |
| 4 | 下单功能 | 创建订单成功率 > 99%，事务保证数据一致性 |
| 5 | 订单查询 | 用户可查看自己订单列表和详情 |
| 6 | 用户认证 | JWT token 有效期 7 天，支持刷新 |
| 7 | 支付预留 | 支付接口抽象完成，支持后续接入微信/支付宝 |

---

## 技术架构

### 前端技术栈
- React 18
- React Router 6
- **Axios + React Query**（HTTP 请求和数据缓存）
- Zustand（状态管理）
- Ant Design Mobile（UI 组件库）
- Vite（构建工具）

### 后端技术栈
- **Java 21**
- SpringBoot 3.2+
- Spring Security + JWT
- **MyBatis-Plus**（ORM 框架，通过 Wrapper 条件构造器操作数据库，不编写显式 SQL）
- **Redis**（数据缓存、Session 存储）
- MySQL 8.0
- **Druid**（数据库连接池，支持 SQL 监控和防火墙）
- Lombok
- Docker + Docker Compose

### 项目结构

```
h5-ordering-system/
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   ├── pages/           # 页面组件
│   │   ├── services/        # API 服务
│   │   ├── store/           # 状态管理
│   │   ├── utils/           # 工具函数
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
├── backend/                  # SpringBoot 后端
│   ├── src/main/java/
│   │   └── com/ordering/
│   │       ├── controller/  # REST 控制器
│   │       ├── service/     # 业务逻辑
│   │       ├── mapper/      # MyBatis Mapper
│   │       ├── entity/      # 实体类
│   │       ├── dto/         # 数据传输对象
│   │       ├── config/      # 配置类
│   │       └── security/    # 安全配置
│   ├── src/main/resources/
│   │   └── application.yml
│   ├── pom.xml
│   └── Dockerfile
├── docker-compose.yml        # Docker 编排
└── README.md
```

---

## 实施步骤

### 阶段 1：项目初始化（第 1 天）

#### 后端初始化
1. 创建 SpringBoot 项目结构
2. 配置 `pom.xml` 依赖
3. 配置 `application.yml`（数据库连接、JWT 配置）
4. 创建 Dockerfile

#### 前端初始化
1. 使用 Vite 创建 React 项目
2. 安装依赖（react-router, axios, antd-mobile）
3. 配置项目结构
4. 创建 Dockerfile

#### Docker 配置
1. 创建 `docker-compose.yml`
2. 配置 MySQL 服务
3. 配置网络和卷

### 阶段 2：后端开发（第 2-4 天）

#### Day 2 - 基础架构
1. 实体类：User, Product, Category, Order, OrderItem
2. 数据库迁移脚本（SQL）
3. MyBatis-Plus 配置

#### Day 3 - 认证模块
1. JWT 工具类
2. Spring Security 配置
3. 登录/注册接口
4. Token 刷新接口

#### Day 4 - 业务接口
1. 商品分类接口（GET /api/categories）
2. 商品列表接口（GET /api/products）
3. 商品详情接口（GET /api/products/{id}）
4. 购物车接口（CRUD）
5. 订单接口（创建、查询）

### 阶段 3：前端开发（第 5-8 天）

#### Day 5 - 基础组件
1. 路由配置
2. 布局组件
3. API 服务封装
4. 认证拦截器

#### Day 6 - 菜单页面
1. 分类导航组件
2. 商品列表组件
3. 商品详情弹窗
4. 搜索功能

#### Day 7 - 购物车和下单
1. 购物车状态管理
2. 购物车页面组件
3. 结算页面
4. 订单创建接口调用

#### Day 8 - 订单页面
1. 订单列表页面
2. 订单详情页面
3. 订单状态展示

### 阶段 4：集成测试和部署（第 9-10 天）

#### Day 9 - 集成测试
1. 前后端联调
2. 修复 bug
3. 性能优化

#### Day 10 - 部署
1. Docker 镜像构建
2. docker-compose 部署
3. 生产环境配置

---

## 数据库设计

### 用户表 (users)
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    phone VARCHAR(20) UNIQUE,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 商品分类表 (categories)
```sql
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 商品表 (products)
```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id BIGINT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    status TINYINT DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### 订单表 (orders)
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    order_no VARCHAR(32) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    pay_amount DECIMAL(10,2),
    status TINYINT DEFAULT 0,
    remark VARCHAR(255),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 订单明细表 (order_items)
```sql
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 购物车表 (cart_items)
```sql
CREATE TABLE cart_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_product (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## API 接口设计

### 认证模块
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/refresh | 刷新 Token |

### 商品模块
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/categories | 获取分类列表 |
| GET | /api/products | 获取商品列表（支持分类筛选、分页） |
| GET | /api/products/{id} | 获取商品详情 |

### 购物车模块
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/cart | 获取购物车 |
| POST | /api/cart/items | 添加商品到购物车 |
| PUT | /api/cart/items/{id} | 更新购物车商品数量 |
| DELETE | /api/cart/items/{id} | 删除购物车商品 |

### 订单模块
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/orders | 创建订单 |
| GET | /api/orders | 获取订单列表 |
| GET | /api/orders/{id} | 获取订单详情 |
| PUT | /api/orders/{id}/cancel | 取消订单 |

---

## 风险和缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 支付接口复杂度高 | 延期风险 | 基础版先做接口抽象，真实支付接入留到完整版 |
| 高并发下单 | 性能问题 | 基础版先保证正确性，后续优化（限流、缓存） |
| Docker 部署配置 | 环境问题 | 提供详细的部署文档和脚本 |

---

## 验证步骤

1. **后端单元测试**：Service 层测试覆盖率 > 80%
2. **API 集成测试**：使用 Postman 或 JUnit 测试所有接口
3. **前端 E2E 测试**：关键流程手动测试
4. **Docker 部署验证**：`docker-compose up` 后服务正常运行

---

## 文件清单

### 后端关键文件
- `backend/src/main/java/com/ordering/OrderingApplication.java`
- `backend/src/main/java/com/ordering/config/SecurityConfig.java`
- `backend/src/main/java/com/ordering/config/JwtConfig.java`
- `backend/src/main/java/com/ordering/controller/AuthController.java`
- `backend/src/main/java/com/ordering/controller/ProductController.java`
- `backend/src/main/java/com/ordering/controller/CartController.java`
- `backend/src/main/java/com/ordering/controller/OrderController.java`
- `backend/src/main/resources/application.yml`
- `backend/pom.xml`
- `backend/Dockerfile`

### 前端关键文件
- `frontend/src/App.jsx`
- `frontend/src/main.jsx`
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/Menu.jsx`
- `frontend/src/pages/Cart.jsx`
- `frontend/src/pages/OrderList.jsx`
- `frontend/src/services/api.js`
- `frontend/src/store/cartStore.js`
- `frontend/package.json`
- `frontend/Dockerfile`

### 部署文件
- `docker-compose.yml`
- `backend/src/main/resources/db/migration/schema.sql`

---

## 下一步

1. 确认计划内容
2. 执行开发（使用 `/team` 或 `/ralph` 技能）
