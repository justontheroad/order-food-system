-- H5 点餐系统数据库初始化脚本
-- MySQL 8.0+
-- 版本: 1.1.0
-- 更新时间: 2026-04-07

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建数据库 (如果不存在)
CREATE DATABASE IF NOT EXISTS `h5_ordering`
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE `h5_ordering`;

-- ========================
-- 用户表
-- ========================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) DEFAULT NULL COMMENT '用户名',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `password` VARCHAR(255) DEFAULT NULL COMMENT '密码(BCrypt加密)',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ========================
-- 商品分类表
-- ========================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类ID',
    `name` VARCHAR(50) NOT NULL COMMENT '分类名称',
    `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- ========================
-- 商品表
-- ========================
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '商品ID',
    `category_id` BIGINT DEFAULT NULL COMMENT '分类ID',
    `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
    `description` TEXT COMMENT '商品描述',
    `price` DECIMAL(10,2) NOT NULL COMMENT '售价',
    `original_price` DECIMAL(10,2) DEFAULT NULL COMMENT '原价',
    `image_url` VARCHAR(255) DEFAULT NULL COMMENT '主图URL',
    `status` TINYINT DEFAULT 1 COMMENT '状态: 1-上架 0-下架',
    `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_category` (`category_id`),
    KEY `idx_status` (`status`),
    KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- ========================
-- 购物车表
-- ========================
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '购物车项ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `product_id` BIGINT NOT NULL COMMENT '商品ID',
    `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_product` (`user_id`, `product_id`),
    KEY `idx_user` (`user_id`),
    KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- ========================
-- 订单表
-- ========================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单ID',
    `order_no` VARCHAR(32) NOT NULL COMMENT '订单编号',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    `discount_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠金额',
    `pay_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    `status` TINYINT DEFAULT 0 COMMENT '订单状态: 0-待支付 1-待制作 2-制作中 3-待取餐 4-已完成 5-已取消',
    `pay_type` TINYINT DEFAULT NULL COMMENT '支付方式: 1-微信支付 2-支付宝',
    `pay_time` TIMESTAMP NULL DEFAULT NULL COMMENT '支付时间',
    `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT '支付完成时间',
    `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_order_no` (`order_no`),
    KEY `idx_user` (`user_id`),
    KEY `idx_status` (`status`),
    KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- ========================
-- 订单明细表
-- ========================
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单明细ID',
    `order_id` BIGINT NOT NULL COMMENT '订单ID',
    `product_id` BIGINT NOT NULL COMMENT '商品ID',
    `product_name` VARCHAR(100) NOT NULL COMMENT '商品名称(快照)',
    `price` DECIMAL(10,2) NOT NULL COMMENT '商品单价',
    `quantity` INT NOT NULL COMMENT '商品数量',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_order` (`order_id`),
    KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细表';

-- ========================
-- 初始化测试数据
-- ========================

-- 测试用户 (密码均为: 123456, BCrypt加密)
-- BCrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO `users` (`id`, `username`, `phone`, `password`, `nickname`, `avatar`) VALUES
(1, 'admin', '13800000001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '管理员', '/images/avatars/admin.svg'),
(2, 'testuser', '13800138001', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '测试用户', '/images/avatars/user1.svg'),
(3, 'zhangsan', '13800138002', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '张三', '/images/avatars/user2.svg'),
(4, 'lisi', '13800138003', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '李四', '/images/avatars/user3.svg');

-- 商品分类
INSERT INTO `categories` (`id`, `name`, `sort_order`) VALUES
(1, '热销推荐', 1),
(2, '主食套餐', 2),
(3, '小食小吃', 3),
(4, '饮料甜品', 4),
(5, '新品上市', 5);

-- 商品数据 (image_url 使用本地静态图片)
INSERT INTO `products` (`id`, `category_id`, `name`, `description`, `price`, `original_price`, `image_url`, `status`, `sort_order`) VALUES
-- 热销推荐
(1, 1, '招牌牛肉汉堡套餐', '经典美式牛肉汉堡配薯条可乐', 39.90, 45.00, '/images/products/burger.svg', 1, 1),
(2, 1, '香辣鸡腿堡套餐', '香辣鸡腿堡配鸡块雪碧', 32.90, 38.00, '/images/products/chicken-burger.svg', 1, 2),
(3, 1, '双层芝士汉堡', '双层芝士配牛肉饼', 28.90, 35.00, '/images/products/burger.svg', 1, 3),
-- 主食套餐
(4, 2, '意式肉酱面', '精选牛肉酱配意大利面', 28.90, NULL, '/images/products/pasta.svg', 1, 1),
(5, 2, '咖喱鸡排饭', '日式咖喱配香酥鸡排', 35.00, NULL, '/images/products/curry-rice.svg', 1, 2),
(6, 2, '照烧鸡腿饭', '照烧酱汁配嫩滑鸡腿', 32.00, NULL, '/images/products/curry-rice.svg', 1, 3),
(7, 2, '鳗鱼饭套餐', '蒲烧鳗鱼配米饭味增汤', 45.00, 52.00, '/images/products/pasta.svg', 1, 4),
-- 小食小吃
(8, 3, '黄金薯条', '现炸酥脆薯条', 12.00, NULL, '/images/products/fries.svg', 1, 1),
(9, 3, '上校鸡块', '6块装香嫩鸡块', 15.00, NULL, '/images/products/nuggets.svg', 1, 2),
(10, 3, '奥尔良烤翅', '4块装奥尔良风味鸡翅', 18.00, NULL, '/images/products/nuggets.svg', 1, 3),
(11, 3, '洋葱圈', '酥脆洋葱圈', 10.00, NULL, '/images/products/fries.svg', 1, 4),
-- 饮料甜品
(12, 4, '可口可乐', '330ml罐装', 6.00, NULL, '/images/products/coke.svg', 1, 1),
(13, 4, '雪碧', '330ml罐装', 6.00, NULL, '/images/products/coke.svg', 1, 2),
(14, 4, '芒果冰沙', '新鲜芒果制作', 18.00, 22.00, '/images/products/mango-smoothie.svg', 1, 3),
(15, 4, '草莓奶昔', '新鲜草莓配冰淇淋', 20.00, 25.00, '/images/products/mango-smoothie.svg', 1, 4),
(16, 4, '柠檬茶', '现泡柠檬茶', 8.00, NULL, '/images/products/coke.svg', 1, 5),
-- 新品上市
(17, 5, '黑椒牛排套餐', '精选牛排配时蔬沙拉', 58.00, 68.00, '/images/products/burger.svg', 1, 1),
(18, 5, '龙虾意面', '波士顿龙虾配意面', 68.00, 80.00, '/images/products/pasta.svg', 1, 2);

-- 购物车测试数据 (用户ID=2的购物车)
INSERT INTO `cart_items` (`id`, `user_id`, `product_id`, `quantity`) VALUES
(1, 2, 1, 2),
(2, 2, 8, 1),
(3, 2, 12, 2);

-- 订单测试数据
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `discount_amount`, `pay_amount`, `status`, `pay_type`, `remark`, `created_at`) VALUES
(1, 'ORD20260407000001', 2, 93.80, 0.00, 93.80, 3, 1, '少放辣', '2026-04-07 10:30:00'),
(2, 'ORD20260407000002', 2, 57.90, 5.00, 52.90, 4, 2, '不要香菜', '2026-04-07 12:15:00'),
(3, 'ORD20260407000003', 3, 35.00, 0.00, 35.00, 1, 1, '', '2026-04-07 14:00:00'),
(4, 'ORD20260407000004', 4, 68.00, 0.00, 68.00, 5, NULL, '用户取消', '2026-04-07 15:30:00');

-- 订单明细测试数据
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`) VALUES
-- 订单1: 招牌牛肉汉堡套餐 + 黄金薯条 + 可口可乐
(1, 1, 1, '招牌牛肉汉堡套餐', 39.90, 2),
(2, 1, 8, '黄金薯条', 12.00, 1),
(3, 1, 12, '可口可乐', 6.00, 2),
-- 订单2: 香辣鸡腿堡套餐 + 上校鸡块
(4, 2, 2, '香辣鸡腿堡套餐', 32.90, 1),
(5, 2, 9, '上校鸡块', 15.00, 1),
(6, 2, 12, '可口可乐', 6.00, 2),
-- 订单3: 咖喱鸡排饭
(7, 3, 5, '咖喱鸡排饭', 35.00, 1),
-- 订单4: 黑椒牛排套餐 (已取消)
(8, 4, 17, '黑椒牛排套餐', 58.00, 1),
(9, 4, 14, '草莓奶昔', 20.00, 1);

SET FOREIGN_KEY_CHECKS = 1;

-- ========================
-- 数据统计
-- ========================
-- 用户: 4条记录
-- 分类: 5条记录
-- 商品: 18条记录
-- 购物车: 3条记录
-- 订单: 4条记录 (含已取消订单)
-- 订单明细: 9条记录