package com.ordering.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 店铺实体类
 */
@Data
@TableName("shops")
public class Shop {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 店铺名称
     */
    private String name;

    /**
     * 店铺地址
     */
    private String address;

    /**
     * 联系电话
     */
    private String phone;

    /**
     * 店铺图片 URL
     */
    private String imageUrl;

    /**
     * 营业状态：1-营业中 0-休息中
     */
    private Integer status;

    /**
     * 营业时间
     */
    private String businessHours;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
}
