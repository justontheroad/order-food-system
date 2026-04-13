package com.ordering.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单列表 DTO（包含会员信息）
 */
@Data
public class OrderListDTO {
    private Long id;
    private String orderNo;
    private Long userId;
    private String memberName;
    private String memberPhone;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal payAmount;
    private Integer status;
    private String statusText;
    private Integer payType;
    private LocalDateTime payTime;
    private LocalDateTime createdAt;
}
