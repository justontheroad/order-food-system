package com.ordering.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 会员等级实体类
 */
@Data
@TableName("member_levels")
public class MemberLevel {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 等级名称
     */
    private String name;

    /**
     * 等级图标
     */
    private String icon;

    /**
     * 升级所需积分
     */
    private Integer requiredPoints;

    /**
     * 等级折扣（0-100）
     */
    private Integer discount;

    /**
     * 排序
     */
    private Integer sortOrder;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
}