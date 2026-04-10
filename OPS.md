# H5 点餐系统运维手册

## 项目概述

- **后端**: Spring Boot 3.2.0 + Java 21 + MyBatis-Plus + MySQL + Redis
- **前端**: React 19 + Vite 5 + antd-mobile v5
- **端口**: 后端 8080, 前端开发 3000

---

## 一、环境要求

### 1.1 后端环境

| 依赖 | 版本 | 说明 |
|------|------|------|
| Java | 21 | JDK 21 |
| Maven | 3.9.x | 构建工具 |
| MySQL | 8.x | 数据库 |
| Redis | 6.x+ | 缓存服务 |

### 1.2 前端环境

| 依赖 | 版本 | 说明 |
|------|------|------|
| Node.js | 18.x+ | 运行环境 |
| npm | 9.x+ | 包管理器 |

### 1.3 环境变量

后端支持以下环境变量（默认值在 `application.yml` 中）：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MYSQL_USERNAME` | root | MySQL 用户名 |
| `MYSQL_PASSWORD` | root | MySQL 密码 |
| `REDIS_HOST` | localhost | Redis 主机 |
| `REDIS_PORT` | 6379 | Redis 端口 |
| `REDIS_PASSWORD` | (空) | Redis 密码 |
| `JWT_SECRET` | h5-ordering-system-secret-key-2026 | JWT 密钥 |

---

## 二、开发环境启动

### 2.1 数据库初始化

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS h5_ordering CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 启动 Redis
redis-server  # 或使用 Docker: docker run -d -p 6379:6379 redis
```

### 2.2 后端启动 (开发模式)

```bash
# 进入后端目录
cd backend

# 方式一: Maven Spring Boot 插件 (推荐开发调试)
mvn spring-boot:run

# 方式二: 编译后运行
mvn clean package -DskipTests
java -jar target/h5-ordering-backend-1.0.0-SNAPSHOT.jar

# 方式三: 指定环境变量启动
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-DMYSQL_PASSWORD=your_password -DREDIS_HOST=your_redis_host"
```

### 2.3 前端启动 (开发模式)

```bash
# 进入前端目录
cd frontend

# 安装依赖 (首次或 package.json 变化后)
npm install

# 启动开发服务器
npm run dev

# 访问地址
# http://localhost:3000
```

### 2.4 服务管理脚本

项目提供自动化管理脚本，方便调试阶段启动和关闭服务：

**Windows:**
```batch
# 启动所有服务
manage.bat start

# 停止所有服务
manage.bat stop

# 重启服务
manage.bat restart

# 查看状态
manage.bat status
```

**Linux/Mac:**
```bash
# 添加执行权限
chmod +x manage.sh

# 启动所有服务
./manage.sh start

# 停止所有服务
./manage.sh stop

# 重启服务
./manage.sh restart

# 查看状态
./manage.sh status

# 查看日志
./manage.sh logs
```

脚本功能：
- 自动检查 MySQL/Redis 连接状态
- 检测端口占用并提示处理
- 后端启动后自动验证 API 可用性
- 前端启动后等待就绪
- 支持状态查询和日志查看

### 2.5 手动启动命令

如需手动启动各服务：

**后端:**
```bash
cd backend
mvn spring-boot:run
```

**前端:**
```bash
cd frontend
npm run dev
```

---

## 三、生产环境部署

### 3.1 后端生产部署

#### 3.1.1 构建 JAR 包

```bash
cd backend

# 清理并打包 (跳过测试加快构建)
mvn clean package -DskipTests

# 输出位置
# target/h5-ordering-backend-1.0.0-SNAPSHOT.jar
```

#### 3.1.2 生产配置文件

创建 `application-prod.yml`:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:3306/h5_ordering?useUnicode=true&characterEncoding=utf8&useSSL=true&serverTimezone=Asia/Shanghai
    username: ${MYSQL_USERNAME}
    password: ${MYSQL_PASSWORD}
    druid:
      initial-size: 10
      min-idle: 10
      max-active: 50
      stat-view-servlet:
        enabled: false  # 生产环境关闭 Druid 监控

  data:
    redis:
      host: ${REDIS_HOST}
      port: ${REDIS_PORT}
      password: ${REDIS_PASSWORD}

jwt:
  secret: ${JWT_SECRET}
  expiration: 604800000

logging:
  level:
    root: WARN
    com.ordering: INFO
```

#### 3.1.3 启动命令

```bash
# 基础启动
java -jar h5-ordering-backend-1.0.0-SNAPSHOT.jar --spring.profiles.active=prod

# 指定 JVM 参数 (推荐生产配置)
java -Xms512m -Xmx1024m -XX:+UseG1GC \
  -DMYSQL_USERNAME=prod_user \
  -DMYSQL_PASSWORD=secure_password \
  -DREDIS_HOST=redis.prod.internal \
  -DJWT_SECRET=production_secure_secret \
  -jar h5-ordering-backend-1.0.0-SNAPSHOT.jar \
  --spring.profiles.active=prod

# 后台运行 (Linux)
nohup java -jar h5-ordering-backend-1.0.0-SNAPSHOT.jar --spring.profiles.active=prod > app.log 2>&1 &
```

### 3.2 前端生产部署

#### 3.2.1 构建

```bash
cd frontend

# 构建生产版本
npm run build

# 输出位置: dist/
```

#### 3.2.2 预览构建结果

```bash
# 本地预览
npm run preview  # 默认 http://localhost:4173
```

#### 3.2.3 Nginx 配置示例

```nginx
server {
    listen 80;
    server_name ordering.example.com;

    # 前端静态资源
    root /var/www/h5-ordering/dist;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 图片/上传文件代理
    location /images/ {
        proxy_pass http://backend:8080/images/;
    }

    location /uploads/ {
        proxy_pass http://backend:8080/uploads/;
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
```

---

## 四、Docker 部署

### 4.1 后端 Dockerfile

```dockerfile
# backend/Dockerfile
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY target/h5-ordering-backend-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]
```

### 4.2 前端 Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4.3 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: h5_ordering
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      MYSQL_USERNAME: root
      MYSQL_PASSWORD: root123
      REDIS_HOST: redis
      JWT_SECRET: docker-secret-2026
    depends_on:
      - mysql
      - redis
    ports:
      - "8080:8080"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f backend
```

---

## 五、运维监控

### 5.1 Druid SQL 监控

- **地址**: http://localhost:8080/druid/
- **账号**: admin
- **密码**: admin123
- **功能**: SQL 执行统计、慢查询分析、连接池状态

**注意**: 生产环境建议关闭或限制访问 IP。

### 5.2 健康检查

```bash
# 检查后端是否运行
curl http://localhost:8080/api/categories

# 检查前端是否运行
curl http://localhost:3000
```

### 5.3 日志位置

| 环境 | 日志输出 |
|------|----------|
| 开发 | 控制台输出 |
| 生产 | app.log (nohup 方式) 或 systemd journal |

---

## 六、常见问题

### 6.1 后端启动失败

| 问题 | 解决方案 |
|------|----------|
| MySQL 连接失败 | 检查 MySQL 是否启动、用户名密码是否正确 |
| Redis 连接失败 | 检查 Redis 是否启动 |
| 端口占用 | 修改 application.yml 中的 port 或杀掉占用进程 |

```bash
# 检查端口占用 (Windows)
netstat -ano | findstr :8080

# 检查端口占用 (Linux)
lsof -i :8080
```

### 6.2 前端构建问题

| 问题 | 解决方案 |
|------|----------|
| npm install 失败 | 删除 node_modules 后重新安装: `rm -rf node_modules && npm install` |
| 构建内存不足 | 增加 Node 内存: `NODE_OPTIONS="--max-old-space-size=4096" npm run build` |

### 6.3 API 跨域问题

开发环境通过 Vite proxy 解决。生产环境通过 Nginx 反向代理配置。

---

## 七、快速命令参考

### 7.1 后端命令

| 命令 | 说明 |
|------|------|
| `mvn spring-boot:run` | 开发模式启动 |
| `mvn clean package -DskipTests` | 构建生产 JAR |
| `mvn test` | 运行测试 |
| `mvn compile` | 仅编译 |
| `java -jar target/h5-ordering-backend-1.0.0-SNAPSHOT.jar` | JAR 方式启动 |

### 7.2 前端命令

| 命令 | 说明 |
|------|------|
| `npm install` | 安装依赖 |
| `npm run dev` | 开发服务器 (3000 端口) |
| `npm run build` | 生产构建 (输出到 dist/) |
| `npm run preview` | 预览构建结果 (4173 端口) |

---

## 八、运维管理脚本

项目提供 `manage.bat` (Windows) 和 `manage.sh` (Linux/Mac) 脚本用于快速管理服务。

### 8.1 Windows (manage.bat)

```batch
# 启动服务
manage.bat start

# 停止服务
manage.bat stop

# 重启服务
manage.bat restart

# 查看状态
manage.bat status

# 查看日志
manage.bat logs

# 帮助
manage.bat help
```

**脚本配置说明：**

编辑 `manage.bat` 可自定义配置：
```batch
set "BACKEND_PORT=8080"       # 后端端口
set "FRONTEND_PORT=3000"      # 前端端口
set "JAVA_HOME=D:/Program Files/Java/jdk-21"  # JDK 路径
set "M2_HOME=D:/Program Files/Java/apache-maven-3.9.14"  # Maven 路径
```

### 8.2 Linux/Mac (manage.sh)

```bash
# 添加执行权限
chmod +x manage.sh

# 启动服务
./manage.sh start

# 停止服务
./manage.sh stop

# 重启服务
./manage.sh restart

# 查看状态
./manage.sh status

# 查看日志
./manage.sh logs
```

### 8.3 手动启动命令

**后端手动启动：**
```bash
# Windows (PowerShell/CMD)
cd backend
mvn spring-boot:run

# 或使用完整路径
cd backend
"D:/Program Files/Java/apache-maven-3.9.14/bin/mvn.cmd" spring-boot:run
```

**前端手动启动：**
```bash
cd frontend
npm install   # 首次运行
npm run dev
```

### 8.4 服务关闭命令

**Windows:**
```batch
# 使用管理脚本 (推荐)
manage.bat stop

# 手动关闭 - 停止后端
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /F /PID %%a

# 手动关闭 - 停止前端
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a
```

**Linux/Mac:**
```bash
# 使用管理脚本 (推荐)
./manage.sh stop

# 手动关闭 - 停止后端
lsof -ti:8080 | xargs kill -9

# 手动关闭 - 停止前端
lsof -ti:3000 | xargs kill -9
```