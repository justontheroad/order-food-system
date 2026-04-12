---
name: H5 点餐系统 - 完整版
description: 完整商业系统版本开发计划（多店铺、促销、会员、支付集成）
type: project
---

# H5 点餐系统开发计划 - 完整商业版

## 需求摘要

构建一个功能完整的 H5 点餐商业系统，支持多店铺管理、商品分类、促销活动、会员系统、支付集成等完整功能。前端使用 React 开发，后端使用 SpringBoot + MySQL，部署采用 Docker 容器化。

### 核心功能

#### 用户端（H5）
- 门店选择/切换
- 菜单展示（多级分类、搜索、筛选）
- 购物车管理
- 下单功能（堂食/外带选择）
- 订单跟踪
- 会员中心
- 优惠券/促销活动
- 支付集成（微信支付、支付宝）

#### 管理后台（Web）
- 门店管理
- 商品管理（上下架、库存）
- 订单管理
- 促销活动管理
- 会员管理
- 数据统计报表

### 认证方式
- JWT Token 认证
- 预留手机号登录接口
- 预留微信授权登录接口

---

## 验收标准

| 序号 | 功能模块 | 验收标准 |
|------|----------|----------|
| 1 | 多门店支持 | 支持动态切换门店，商品数据隔离 |
| 2 | 商品管理 | 支持多级分类，商品 SKU，库存管理 |
| 3 | 促销活动 | 支持满减、折扣、优惠券等多种促销类型 |
| 4 | 会员系统 | 会员等级、积分累积和兑换 |
| 5 | 支付集成 | 微信支付、支付宝支付全流程打通 |
| 6 | 订单管理 | 订单状态机完整（待支付→待制作→制作中→已完成） |
| 7 | 数据统计 | 营业额、订单量、热销商品等报表 |
| 8 | 性能指标 | 首页加载 < 2s，API 响应 p99 < 500ms |

---

## 技术架构

### 前端技术栈
- React 18
- TypeScript
- React Router 6
- Zustand（状态管理）
- Ant Design Mobile（H5）
- Ant Design Pro（管理后台）
- Vite
- **Axios + React Query**（HTTP 请求和数据缓存）

### 后端技术栈
- SpringBoot 3.2+
- Spring Security + JWT
- **Redis**（数据缓存、Session 存储、分布式锁）
- **MyBatis-Plus**（ORM 框架，通过 Wrapper 条件构造器操作数据库，不编写显式 SQL）
- MySQL 8.0
- **Druid**（数据库连接池，支持 SQL 监控和防火墙）
- RabbitMQ（消息队列）
- Docker + Docker Compose

### 项目结构

```
h5-ordering-system/
├── frontend-h5/              # H5 前端（用户端）
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── Dockerfile
├── frontend-admin/           # 管理后台前端
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── Dockerfile
├── backend/                  # SpringBoot 后端
│   ├── src/main/java/
│   │   └── com/ordering/
│   │       ├── controller/
│   │       │   ├── AuthController.java
│   │       │   ├── ShopController.java
│   │       │   ├── ProductController.java
│   │       │   ├── CartController.java
│   │       │   ├── OrderController.java
│   │       │   ├── PromotionController.java
│   │       │   ├── MemberController.java
│   │       │   └── AdminController.java
│   │       ├── service/
│   │       │   ├── AuthService.java
│   │       │   ├── ShopService.java
│   │       │   ├── ProductService.java
│   │       │   ├── OrderService.java
│   │       │   ├── CartService.java
│   │       │   ├── PromotionService.java
│   │       │   ├── MemberService.java
│   │       │   └── PaymentService.java
│   │       ├── mapper/
│   │       ├── entity/
│   │       ├── dto/
│   │       ├── config/
│   │       ├── security/
│   │       └── mq/          # 消息队列
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── application-prod.yml
│   ├── pom.xml
│   └── Dockerfile
├── docker-compose.yml
└── docs/
```

---

## 实施步骤

### 阶段 1：项目初始化和基础架构（第 1-2 天）

#### Day 1 - 后端基础
1. SpringBoot 项目初始化
2. 数据库设计和建表
3. 基础实体类和 Mapper
4. Docker Compose 配置（MySQL, Redis, RabbitMQ）

#### Day 2 - 前端基础
1. H5 前端项目初始化（Vite + React + Antd Mobile）
2. 管理后台项目初始化（Ant Design Pro）
3. 基础路由和布局组件

### 阶段 2：核心业务开发（第 3-10 天）

#### Day 3-4 - 认证和门店模块
1. JWT 认证实现
2. 门店管理 CRUD
3. 门店切换逻辑

#### Day 5-6 - 商品模块
1. 商品分类（多级）
2. 商品管理（SPU/SKU）
3. 库存管理
4. 商品搜索和筛选

#### Day 7-8 - 购物车和订单模块
1. 购物车 CRUD
2. 订单创建（含优惠计算）
3. 订单状态机
4. 订单查询

#### Day 9-10 - 支付模块
1. 支付接口抽象
2. 微信支付集成
3. 支付宝集成
4. 支付回调处理

### 阶段 3：高级功能开发（第 11-18 天）

#### Day 11-12 - 促销模块
1. 优惠券系统
2. 满减活动
3. 折扣活动
4. 促销规则引擎

#### Day 13-14 - 会员模块
1. 会员等级
2. 积分系统
3. 会员权益

#### Day 15-16 - 管理后台
1. 商品管理页面
2. 订单管理页面
3. 数据报表

#### Day 17-18 - 消息通知
1. 订单状态变更通知
2. 短信通知集成
3. 模板消息

### 阶段 4：测试和部署（第 19-21 天）

#### Day 19 - 集成测试
1. 全链路测试
2. 性能压测
3. Bug 修复

#### Day 20 - 优化
1. 前端打包优化
2. 后端缓存优化
3. 数据库索引优化

#### Day 21 - 部署
1. 生产环境配置
2. Docker 部署
3. 监控配置

---

## 数据库设计

### 门店表 (shops)
```sql
CREATE TABLE shops (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    image_url VARCHAR(255),
    status TINYINT DEFAULT 1,
    business_hours VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 商品分类表 (categories)
```sql
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    parent_id BIGINT,
    name VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (parent_id) REFERENCES categories(id)
);
```

### 商品表 (products)
```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT NOT NULL,
    category_id BIGINT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    stock INT DEFAULT 0,
    sales INT DEFAULT 0,
    image_url VARCHAR(255),
    images JSON,
    status TINYINT DEFAULT 1,
    is_hot TINYINT DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### 订单表 (orders)
```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(32) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    shop_id BIGINT NOT NULL,
    order_type TINYINT DEFAULT 1 COMMENT '1-堂食 2-外带',
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    pay_amount DECIMAL(10,2) NOT NULL,
    status TINYINT DEFAULT 0 COMMENT '0-待支付 1-待制作 2-制作中 3-已完成 4-已取消',
    pay_type TINYINT COMMENT '1-微信 2-支付宝',
    pay_time TIMESTAMP,
    remark VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES shops(id)
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

### 优惠券表 (coupons)
```sql
CREATE TABLE coupons (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    shop_id BIGINT,
    name VARCHAR(100) NOT NULL,
    type TINYINT NOT NULL COMMENT '1-满减 2-折扣',
    condition_amount DECIMAL(10,2),
    discount_amount DECIMAL(10,2),
    discount_rate DECIMAL(5,2),
    max_discount_amount DECIMAL(10,2),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    total_count INT,
    received_count INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id)
);
```

### 用户优惠券表 (user_coupons)
```sql
CREATE TABLE user_coupons (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    coupon_id BIGINT NOT NULL,
    status TINYINT DEFAULT 0 COMMENT '0-未使用 1-已使用 2-已过期',
    order_id BIGINT,
    used_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### 会员表 (members)
```sql
CREATE TABLE members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    level TINYINT DEFAULT 1,
    points INT DEFAULT 0,
    total_consumption DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 会员等级表 (member_levels)
```sql
CREATE TABLE member_levels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    min_points INT NOT NULL,
    discount_rate DECIMAL(5,2) DEFAULT 1.0,
    points_rate DECIMAL(5,2) DEFAULT 1.0
);
```

---

## API 接口设计

### 认证模块
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 登录 |
| POST | /api/auth/register | 注册 |
| POST | /api/auth/refresh | 刷新 Token |
| POST | /api/auth/sms-code | 获取短信验证码 |
| POST | /api/auth/wechat-login | 微信登录 |

### 门店模块
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/shops | 门店列表 |
| GET | /api/shops/{id} | 门店详情 |

### 商品模块
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/shops/{shopId}/categories | 分类列表 |
| GET | /api/shops/{shopId}/products | 商品列表 |
| GET | /api/products/{id} | 商品详情 |
| GET | /api/products/search | 搜索商品 |

### 购物车模块
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/cart | 获取购物车 |
| POST | /api/cart/items | 添加到购物车 |
| PUT | /api/cart/items/{id} | 更新数量 |
| DELETE | /api/cart/items/{id} | 删除商品 |
| POST | /api/cart/clear | 清空购物车 |

### 订单模块
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/orders | 创建订单 |
| GET | /api/orders | 订单列表 |
| GET | /api/orders/{id} | 订单详情 |
| PUT | /api/orders/{id}/cancel | 取消订单 |

### 支付模块
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/payments/wechat | 发起微信支付 |
| POST | /api/payments/alipay | 发起支付宝支付 |
| POST | /api/payments/callback/wechat | 微信回调 |
| POST | /api/payments/callback/alipay | 支付宝回调 |

### 促销模块
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/promotions/coupons | 可领取优惠券列表 |
| POST | /api/promotions/coupons/{id}/receive | 领取优惠券 |
| GET | /api/user/coupons | 我的优惠券 |

### 会员模块
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/member/info | 会员信息 |
| GET | /api/member/points | 积分明细 |
| POST | /api/member/points/exchange | 积分兑换 |

---

## 管理后台 API

| 模块 | 接口 |
|------|------|
| 商品管理 | CRUD /api/admin/products |
| 分类管理 | CRUD /api/admin/categories |
| 订单管理 | GET/PUT /api/admin/orders |
| 促销管理 | CRUD /api/admin/promotions |
| 会员管理 | GET /api/admin/members |
| 数据统计 | GET /api/admin/statistics/* |

---

## 支付集成设计

### 支付流程
```
1. 用户选择支付方式 → 
2. 后端调用支付 API 获取预支付订单 → 
3. 返回支付参数给前端 → 
4. 前端调起支付 SDK → 
5. 用户完成支付 → 
6. 支付平台回调后端 → 
7. 后端验证并更新订单状态
```

### 微信支付
- 使用微信 JSAPI 支付
- 需要微信商户号、AppID、AppSecret
- 回调地址需公网可访问

### 支付宝
- 使用支付宝手机网站支付
- 需要支付宝商户 PID、AppID、私钥
- 支持沙箱环境测试

---

## 风险和缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 支付牌照合规 | 法律风险 | 使用官方 SDK，遵循平台规范 |
| 高并发下单 | 超卖风险 | 数据库乐观锁 + Redis 预减库存 |
| 优惠券薅羊毛 | 资金损失 | 限流、风控规则、人工审核 |
| 数据一致性 | 订单错误 | 分布式事务或最终一致性方案 |
| 短信费用 | 成本增加 | 图形验证码防刷、每日限额 |

---

## 验证步骤

1. **单元测试**：Service 层 JUnit 测试覆盖率 > 80%
2. **接口测试**：Postman 集合测试所有 API
3. **集成测试**：关键业务流程 E2E 测试
4. **性能测试**：JMeter 压测，目标 QPS > 100
5. **安全测试**：SQL 注入、XSS、CSRF 扫描

---

## 扩展点设计

### 预留接口
```java
// 登录方式扩展
public interface LoginProvider {
    LoginResult login(LoginRequest request);
    boolean supports(String type);
}

// 支付渠道扩展
public interface PaymentChannel {
    PaymentResult pay(PaymentRequest request);
    boolean verifyCallback(Map<String, String> params);
    String getChannelName();
}
```

### 插件化设计
- 登录 Provider：支持 JWT、短信、微信等
- 支付 Channel：支持微信、支付宝、银联等
- 通知 Sender：支持短信、模板消息、邮件等

---

## 文件清单

### 后端核心文件（约 50+ 文件）
- `backend/src/main/java/com/ordering/OrderingApplication.java`
- `backend/src/main/java/com/ordering/config/*` (安全、JWT、Redis、Swagger)
- `backend/src/main/java/com/ordering/controller/*` (8 个 Controller)
- `backend/src/main/java/com/ordering/service/*` (8 个 Service + Impl)
- `backend/src/main/java/com/ordering/mapper/*` (10+ Mapper)
- `backend/src/main/java/com/ordering/entity/*` (12+ Entity)
- `backend/src/main/java/com/ordering/dto/*` (20+ DTO)

### 前端 H5 文件（约 30+ 文件）
- `frontend-h5/src/pages/*` (Home, Menu, Cart, OrderList, OrderDetail, Member, Coupon)
- `frontend-h5/src/components/*` (ProductCard, CartBar, OrderItem, etc.)
- `frontend-h5/src/services/api.js`
- `frontend-h5/src/store/*` (cart, user, order)

### 管理后台文件（约 20+ 文件）
- `frontend-admin/src/pages/*` (Dashboard, Product, Order, Member, Promotion)

### 部署文件
- `docker-compose.yml`
- `backend/Dockerfile`
- `frontend-h5/Dockerfile`
- `frontend-admin/Dockerfile`

---

## 下一步

1. 确认计划内容
2. 执行开发（推荐使用 `/team` 技能进行并行开发）
