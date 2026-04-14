-- 创建管理员表
CREATE TABLE IF NOT EXISTS `admin` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `role` VARCHAR(20) DEFAULT 'admin' COMMENT '角色',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 插入默认管理员 (密码: admin123, BCrypt加密)
INSERT INTO `admin` (`username`, `password`, `role`) VALUES
('admin', '$2b$10$ixe9Hyaj7RboW3hfJJ2BiexCRKqKjB.3odGLmNjTrNU1esJMLf2QW', 'admin');
