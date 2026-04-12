package com.ordering.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 会员实体类
 */
@Data
@TableName("members")
public class Member {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 会员等级ID
     */
    private Long levelId;

    /**
     * 会员等级对象（用于前端展示，不映射数据库）
     */
    @TableField(exist = false)
    private MemberLevel level;

    /**
     * 积分余额
     */
    private Integer points;

    /**
     * 累计消费金额
     */
    private java.math.BigDecimal totalAmount;

    /**
     * 会员状态：0-冻结 1-正常
     */
    private Integer status;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}