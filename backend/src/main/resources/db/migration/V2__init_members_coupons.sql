-- 会员、优惠券、促销模块数据库脚本
-- MySQL 8.0+

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

USE `h5_ordering`;

-- ========================
-- 会员等级表
-- ========================
DROP TABLE IF EXISTS `member_levels`;
CREATE TABLE `member_levels` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '等级 ID',
    `name` VARCHAR(50) NOT NULL COMMENT '等级名称',
    `icon` VARCHAR(255) DEFAULT NULL COMMENT '等级图标',
    `required_points` INT DEFAULT 0 COMMENT '升级所需积分',
    `discount` INT DEFAULT 100 COMMENT '等级折扣(0-100)',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_required_points` (`required_points`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员等级表';

-- ========================
-- 会员表
-- ========================
DROP TABLE IF EXISTS `members`;
CREATE TABLE `members` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '会员 ID',
    `user_id` BIGINT NOT NULL COMMENT '用户 ID',
    `level_id` BIGINT DEFAULT 1 COMMENT '等级 ID',
    `points` INT DEFAULT 0 COMMENT '积分余额',
    `total_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '累计消费金额',
    `status` TINYINT DEFAULT 1 COMMENT '状态:0-冻结 1-正常',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user` (`user_id`),
    KEY `idx_level` (`level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会员表';

-- ========================
-- 优惠券表
-- ========================
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '优惠券 ID',
    `name` VARCHAR(100) NOT NULL COMMENT '优惠券名称',
    `type` TINYINT NOT NULL COMMENT '类型:1-满减券 2-折扣券',
    `min_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠门槛',
    `discount_amount` DECIMAL(10,2) DEFAULT NULL COMMENT '优惠金额(满减)',
    `discount_rate` INT DEFAULT NULL COMMENT '折扣比例(折扣券,80=8折)',
    `max_discount_amount` DECIMAL(10,2) DEFAULT NULL COMMENT '最高优惠金额(折扣)',
    `total_count` INT DEFAULT NULL COMMENT '发放总量',
    `received_count` INT DEFAULT 0 COMMENT '已领取数量',
    `limit_per_user` INT DEFAULT 1 COMMENT '每人限领',
    `start_time` TIMESTAMP NOT NULL COMMENT '有效期开始',
    `end_time` TIMESTAMP NOT NULL COMMENT '有效期结束',
    `status` TINYINT DEFAULT 1 COMMENT '状态:0-禁用 1-启用',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_valid` (`start_time`, `end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';

-- ========================
-- 用户优惠券表
-- ========================
DROP TABLE IF EXISTS `user_coupons`;
CREATE TABLE `user_coupons` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户优惠券 ID',
    `user_id` BIGINT NOT NULL COMMENT '用户 ID',
    `coupon_id` BIGINT NOT NULL COMMENT '优惠券 ID',
    `status` TINYINT DEFAULT 0 COMMENT '状态:0-未使用 1-已使用 2-已过期',
    `received_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
    `used_at` TIMESTAMP NULL DEFAULT NULL COMMENT '使用时间',
    `order_id` BIGINT DEFAULT NULL COMMENT '关联订单 ID',
    PRIMARY KEY (`id`),
    KEY `idx_user` (`user_id`),
    KEY `idx_coupon` (`coupon_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户优惠券表';

-- ========================
-- 初始化会员等级数据
-- ========================
INSERT INTO `member_levels` (`id`, `name`, `icon`, `required_points`, `discount`, `sort_order`) VALUES
(1, '普通会员', 'https://api.dicebear.com/7.x/identicon/svg?seed=1', 0, 100, 1),
(2, '铜牌会员', 'https://api.dicebear.com/7.x/identicon/svg?seed=2', 500, 98, 2),
(3, '银牌会员', 'https://api.dicebear.com/7.x/identicon/svg?seed=3', 2000, 95, 3),
(4, '金牌会员', 'https://api.dicebear.com/7.x/identicon/svg?seed=4', 5000, 90, 4),
(5, '钻石会员', 'https://api.dicebear.com/7.x/identicon/svg?seed=5', 10000, 85, 5);

-- ========================
-- 初始化优惠券数据
-- ========================
INSERT INTO `coupons` (`id`, `name`, `type`, `min_amount`, `discount_amount`, `discount_rate`, `max_discount_amount`, `total_count`, `limit_per_user`, `start_time`, `end_time`, `status`) VALUES
(1, '新人满20减5', 1, 20.00, 5.00, NULL, NULL, 1000, 1, '2025-01-01 00:00:00', '2026-12-31 23:59:59', 1),
(2, '满50减10', 1, 50.00, 10.00, NULL, NULL, 500, 1, '2025-01-01 00:00:00', '2026-12-31 23:59:59', 1),
(3, '95折优惠券', 2, 30.00, NULL, 95, 20.00, 500, 1, '2025-01-01 00:00:00', '2026-12-31 23:59:59', 1),
(4, '9折会员专享', 2, 0.00, NULL, 90, 50.00, 200, 1, '2025-01-01 00:00:00', '2026-12-31 23:59:59', 1);

-- ========================
-- 为测试用户创建会员
-- ========================
INSERT INTO `members` (`user_id`, `level_id`, `points`, `total_amount`, `status`) VALUES
(1, 1, 100, 57.90, 1);

SET FOREIGN_KEY_CHECKS = 1;