-- H5 点餐系统数据库初始化脚本
-- MySQL 8.0+
-- 说明：本脚本由应用启动时自动执行

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
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户 ID',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像 URL',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ========================
-- 商品分类表
-- ========================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分类 ID',
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
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '商品 ID',
    `category_id` BIGINT DEFAULT NULL COMMENT '分类 ID',
    `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
    `description` TEXT COMMENT '商品描述',
    `price` DECIMAL(10,2) NOT NULL COMMENT '售价',
    `original_price` DECIMAL(10,2) DEFAULT NULL COMMENT '原价',
    `image_url` VARCHAR(255) DEFAULT NULL COMMENT '主图 URL',
    `status` TINYINT DEFAULT 1 COMMENT '状态：1-上架 0-下架',
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
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '购物车项 ID',
    `user_id` BIGINT NOT NULL COMMENT '用户 ID',
    `product_id` BIGINT NOT NULL COMMENT '商品 ID',
    `quantity` INT NOT NULL DEFAULT 1 COMMENT '数量',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_product` (`user_id`, `product_id`),
    KEY `idx_user` (`user_id`),
    KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车项表';

-- ========================
-- 订单表
-- ========================
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单 ID',
    `order_no` VARCHAR(32) NOT NULL COMMENT '订单编号',
    `user_id` BIGINT NOT NULL COMMENT '用户 ID',
    `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总金额',
    `discount_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠金额',
    `pay_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    `status` TINYINT DEFAULT 0 COMMENT '订单状态：0-待支付 1-待制作 2-制作中 3-待取餐 4-已完成 5-已取消',
    `pay_type` TINYINT DEFAULT NULL COMMENT '支付方式：1-微信支付 2-支付宝',
    `pay_time` TIMESTAMP NULL DEFAULT NULL COMMENT '支付时间',
    `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
    `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT '支付时间',
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
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单明细项 ID',
    `order_id` BIGINT NOT NULL COMMENT '订单 ID',
    `product_id` BIGINT NOT NULL COMMENT '商品 ID',
    `product_name` VARCHAR(100) NOT NULL COMMENT '商品名称 (快照)',
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

-- 插入测试用户
INSERT INTO `users` (`id`, `phone`, `nickname`, `avatar`) VALUES
(1, '13800138001', '测试用户', 'https://api.dicebear.com/7.x/avataaars/svg?seed=1'),
(2, '13800138002', '张三', 'https://api.dicebear.com/7.x/avataaars/svg?seed=2');

-- 插入商品分类
INSERT INTO `categories` (`id`, `name`, `sort_order`) VALUES
(1, '热销推荐', 1),
(2, '主食套餐', 2),
(3, '小食小吃', 3),
(4, '饮料甜品', 4);

-- 插入商品
INSERT INTO `products` (`id`, `category_id`, `name`, `description`, `price`, `original_price`, `image_url`, `status`, `sort_order`) VALUES
(1, 1, '招牌牛肉汉堡套餐', '经典美式牛肉汉堡 + 薯条 + 可乐', 39.90, 45.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', 1, 1),
(2, 1, '香辣鸡腿堡套餐', '香辣鸡腿堡 + 上校鸡块 + 雪碧', 32.90, 38.00, 'https://images.unsplash.com/photo-1562967960-f0d963129f6a?w=400', 1, 2),
(3, 2, '意式肉酱面', '精选牛肉酱 + 意大利面', 28.90, NULL, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400', 1, 3),
(4, 2, '咖喱鸡排饭', '日式咖喱 + 香酥鸡排', 35.00, NULL, 'https://images.unsplash.com/photo-1562967963-ed7b68c493ca?w=400', 1, 4),
(5, 3, '黄金薯条', '现炸薯条', 12.00, NULL, 'https://images.unsplash.com/photo-1573080496220-b4e1474a5858?w=400', 1, 5),
(6, 3, '上校鸡块', '5 块装香嫩鸡块', 15.00, NULL, 'https://images.unsplash.com/photo-1562967960-f0d963129f6a?w=400', 1, 6),
(7, 4, '可口可乐', '330ml 罐装', 6.00, NULL, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', 1, 7),
(8, 4, '芒果冰沙', '新鲜芒果制作', 18.00, 22.00, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', 1, 8);

-- 插入购物车测试数据
INSERT INTO `cart_items` (`user_id`, `product_id`, `quantity`) VALUES
(1, 1, 1),
(1, 5, 2),
(1, 7, 2);

-- 插入订单测试数据
INSERT INTO `orders` (`id`, `order_no`, `user_id`, `total_amount`, `discount_amount`, `pay_amount`, `status`, `pay_type`, `remark`) VALUES
(1, 'ORD20260405000001', 1, 57.90, 0.00, 57.90, 1, 1, '不要香菜');

-- 插入订单明细测试数据
INSERT INTO `order_items` (`order_id`, `product_id`, `product_name`, `price`, `quantity`) VALUES
(1, 1, '招牌牛肉汉堡套餐', 39.90, 1),
(1, 5, '黄金薯条', 12.00, 1),
(1, 7, '可口可乐', 6.00, 1);

SET FOREIGN_KEY_CHECKS = 1;
