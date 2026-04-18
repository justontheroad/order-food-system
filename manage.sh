#!/bin/bash

# H5 点餐系统服务管理脚本 (Linux/Mac)
# 用法: ./manage.sh [start|stop|restart|status|logs]

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
FRONTEND_ADMIN_DIR="$PROJECT_ROOT/frontend-admin"
BACKEND_PORT=8080
FRONTEND_PORT=3000
FRONTEND_ADMIN_PORT=3001
LOG_DIR="$PROJECT_ROOT/logs"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 创建日志目录
mkdir -p "$LOG_DIR"

# 帮助信息
show_help() {
    echo "========================================"
    echo "H5 点餐系统服务管理脚本"
    echo "========================================"
    echo "用法: ./manage.sh [命令]"
    echo ""
    echo "命令:"
    echo "  start    - 启动所有服务 (后端+前端+管理端)"
    echo "  stop     - 停止所有服务"
    echo "  restart  - 重启所有服务"
    echo "  status   - 查看服务状态"
    echo "  logs     - 查看服务日志"
    echo "  help     - 显示帮助信息"
    echo "========================================"
    echo "示例:"
    echo "  ./manage.sh start     # 启动服务"
    echo "  ./manage.sh stop      # 停止服务"
    echo "  ./manage.sh status    # 查看状态"
    echo "========================================"
}

# 检查端口占用
check_port() {
    local port=$1
    if lsof -i :$port > /dev/null 2>&1; then
        return 0  # 端口被占用
    else
        return 1  # 端口空闲
    fi
}

# 获取端口占用进程
get_port_pid() {
    local port=$1
    lsof -t -i :$port 2>/dev/null
}

# 启动服务
start_service() {
    echo "========================================"
    echo "启动 H5 点餐系统服务..."
    echo "========================================"

    # 检查 MySQL
    echo "[检查] MySQL 连接..."
    if mysql -u root -proot -e "SELECT 1" > /dev/null 2>&1; then
        echo -e "${GREEN}[正常] MySQL 连接成功${NC}"
    else
        echo -e "${YELLOW}[警告] MySQL 连接失败，请确保服务已启动${NC}"
    fi

    # 检查 Redis
    echo "[检查] Redis 连接..."
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}[正常] Redis 连接成功${NC}"
    else
        echo -e "${YELLOW}[警告] Redis 连接失败，请确保服务已启动${NC}"
    fi

    # 检查后端端口
    if check_port $BACKEND_PORT; then
        echo -e "${YELLOW}[警告] 端口 $BACKEND_PORT 已被占用${NC}"
        pid=$(get_port_pid $BACKEND_PORT)
        echo "[提示] 占用进程 PID: $pid"
        read -p "是否终止占用进程并继续? [y/N]: " choice
        if [[ "$choice" =~ ^[Yy]$ ]]; then
            kill -9 $pid 2>/dev/null
            sleep 2
        else
            echo "[取消] 启动中止"
            exit 1
        fi
    fi

    # 检查前端端口
    if check_port $FRONTEND_PORT; then
        echo -e "${YELLOW}[警告] 端口 $FRONTEND_PORT 已被占用${NC}"
        pid=$(get_port_pid $FRONTEND_PORT)
        echo "[提示] 占用进程 PID: $pid"
        read -p "是否终止占用进程并继续? [y/N]: " choice
        if [[ "$choice" =~ ^[Yy]$ ]]; then
            kill -9 $pid 2>/dev/null
            sleep 2
        else
            echo "[取消] 启动中止"
            exit 1
        fi
    fi

    # 检查管理端端口
    if check_port $FRONTEND_ADMIN_PORT; then
        echo -e "${YELLOW}[警告] 端口 $FRONTEND_ADMIN_PORT 已被占用${NC}"
        pid=$(get_port_pid $FRONTEND_ADMIN_PORT)
        echo "[提示] 占用进程 PID: $pid"
        read -p "是否终止占用进程并继续? [y/N]: " choice
        if [[ "$choice" =~ ^[Yy]$ ]]; then
            kill -9 $pid 2>/dev/null
            sleep 2
        else
            echo "[取消] 启动中止"
            exit 1
        fi
    fi

    # 启动后端
    echo "[启动] 后端服务..."
    cd "$BACKEND_DIR"
    nohup mvn spring-boot:run > "$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo "后端 PID: $BACKEND_PID"

    # 等待后端启动
    echo "[等待] 后端服务启动中... (约20秒)"
    count=0
    while ! curl -s http://localhost:$BACKEND_PORT/api/categories > /dev/null 2>&1; do
        sleep 2
        count=$((count + 1))
        if [ $count -gt 30 ]; then
            echo -e "${RED}[错误] 后端启动超时${NC}"
            tail -50 "$LOG_DIR/backend.log"
            exit 1
        fi
        echo -n "."
    done
    echo ""
    echo -e "${GREEN}[成功] 后端服务已启动: http://localhost:$BACKEND_PORT${NC}"

    # 启动前端
    echo "[启动] 前端服务..."
    cd "$FRONTEND_DIR"
    nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    echo "前端 PID: $FRONTEND_PID"

    # 等待前端启动
    echo "[等待] 前端服务启动中... (约10秒)"
    sleep 10

    # 启动管理端
    echo "[启动] 管理端服务..."
    cd "$FRONTEND_ADMIN_DIR"
    nohup npm run dev > "$LOG_DIR/frontend-admin.log" 2>&1 &
    FRONTEND_ADMIN_PID=$!
    echo "管理端 PID: $FRONTEND_ADMIN_PID"

    # 等待管理端启动
    echo "[等待] 管理端服务启动中... (约10秒)"
    sleep 10

    echo "========================================"
    echo -e "${GREEN}所有服务已启动!${NC}"
    echo "========================================"
    echo "后端地址: http://localhost:$BACKEND_PORT"
    echo "前端地址: http://localhost:$FRONTEND_PORT"
    echo "管理端地址: http://localhost:$FRONTEND_ADMIN_PORT"
    echo "Druid监控: http://localhost:$BACKEND_PORT/druid (admin/admin123)"
    echo "日志位置: $LOG_DIR"
    echo "========================================"

    # 保存 PID
    echo "$BACKEND_PID" > "$LOG_DIR/backend.pid"
    echo "$FRONTEND_PID" > "$LOG_DIR/frontend.pid"
    echo "$FRONTEND_ADMIN_PID" > "$LOG_DIR/frontend-admin.pid"
}

# 停止服务
stop_service() {
    echo "========================================"
    echo "停止 H5 点餐系统服务..."
    echo "========================================"

    # 停止后端
    echo "[停止] 后端服务..."
    if [ -f "$LOG_DIR/backend.pid" ]; then
        pid=$(cat "$LOG_DIR/backend.pid")
        if kill -0 $pid 2>/dev/null; then
            kill $pid 2>/dev/null
            echo "已终止 PID: $pid"
        fi
        rm "$LOG_DIR/backend.pid"
    fi

    # 通过端口停止后端
    if check_port $BACKEND_PORT; then
        pid=$(get_port_pid $BACKEND_PORT)
        kill -9 $pid 2>/dev/null
        echo "已终止端口进程 PID: $pid"
    fi

    # 停止前端
    echo "[停止] 前端服务..."
    if [ -f "$LOG_DIR/frontend.pid" ]; then
        pid=$(cat "$LOG_DIR/frontend.pid")
        if kill -0 $pid 2>/dev/null; then
            kill $pid 2>/dev/null
            echo "已终止 PID: $pid"
        fi
        rm "$LOG_DIR/frontend.pid"
    fi

    # 通过端口停止前端
    if check_port $FRONTEND_PORT; then
        pid=$(get_port_pid $FRONTEND_PORT)
        kill -9 $pid 2>/dev/null
        echo "已终止端口进程 PID: $pid"
    fi

    # 停止管理端
    echo "[停止] 管理端服务..."
    if [ -f "$LOG_DIR/frontend-admin.pid" ]; then
        pid=$(cat "$LOG_DIR/frontend-admin.pid")
        if kill -0 $pid 2>/dev/null; then
            kill $pid 2>/dev/null
            echo "已终止 PID: $pid"
        fi
        rm "$LOG_DIR/frontend-admin.pid"
    fi

    # 通过端口停止管理端
    if check_port $FRONTEND_ADMIN_PORT; then
        pid=$(get_port_pid $FRONTEND_ADMIN_PORT)
        kill -9 $pid 2>/dev/null
        echo "已终止管理端端口进程 PID: $pid"
    fi

    echo -e "${GREEN}[完成] 服务已停止${NC}"
}

# 重启服务
restart_service() {
    echo "========================================"
    echo "重启 H5 点餐系统服务..."
    echo "========================================"
    stop_service
    sleep 3
    start_service
}

# 查看状态
show_status() {
    echo "========================================"
    echo "H5 点餐系统服务状态"
    echo "========================================"

    # 后端状态
    echo "[后端] 端口 $BACKEND_PORT:"
    if check_port $BACKEND_PORT; then
        echo -e "  状态: ${GREEN}运行中${NC}"
        pid=$(get_port_pid $BACKEND_PORT)
        echo "  PID: $pid"
        if curl -s http://localhost:$BACKEND_PORT/api/categories > /dev/null 2>&1; then
            echo -e "  API: ${GREEN}正常${NC}"
        else
            echo -e "  API: ${YELLOW}无响应${NC}"
        fi
    else
        echo -e "  状态: ${RED}未运行${NC}"
    fi

    # 前端状态
    echo "[前端] 端口 $FRONTEND_PORT:"
    if check_port $FRONTEND_PORT; then
        echo -e "  状态: ${GREEN}运行中${NC}"
        pid=$(get_port_pid $FRONTEND_PORT)
        echo "  PID: $pid"
    else
        echo -e "  状态: ${RED}未运行${NC}"
    fi

    # 管理端状态
    echo "[管理端] 端口 $FRONTEND_ADMIN_PORT:"
    if check_port $FRONTEND_ADMIN_PORT; then
        echo -e "  状态: ${GREEN}运行中${NC}"
        pid=$(get_port_pid $FRONTEND_ADMIN_PORT)
        echo "  PID: $pid"
    else
        echo -e "  状态: ${RED}未运行${NC}"
    fi

    echo "========================================"
}

# 查看日志
show_logs() {
    echo "========================================"
    echo "查看服务日志"
    echo "========================================"
    echo "选择要查看的日志:"
    echo "  1. 后端日志 (backend.log)"
    echo "  2. 前端日志 (frontend.log)"
    echo "  3. 管理端日志 (frontend-admin.log)"
    echo "  4. 实时查看后端日志"
    echo "  5. 实时查看前端日志"
    echo "  6. 实时查看管理端日志"
    echo "  7. 返回"
    read -p "请选择 [1/2/3/4/5/6/7]: " choice

    case $choice in
        1) tail -100 "$LOG_DIR/backend.log" ;;
        2) tail -100 "$LOG_DIR/frontend.log" ;;
        3) tail -100 "$LOG_DIR/frontend-admin.log" ;;
        4) tail -f "$LOG_DIR/backend.log" ;;
        5) tail -f "$LOG_DIR/frontend.log" ;;
        6) tail -f "$LOG_DIR/frontend-admin.log" ;;
        7) return ;;
        *) echo "无效选择" ;;
    esac
}

# 主程序
case "$1" in
    start)   start_service ;;
    stop)    stop_service ;;
    restart) restart_service ;;
    status)  show_status ;;
    logs)    show_logs ;;
    help|"") show_help ;;
    *)       echo "未知命令: $1"; show_help ;;
esac