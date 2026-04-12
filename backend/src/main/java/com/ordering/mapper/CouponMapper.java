package com.ordering.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ordering.entity.Coupon;
import org.apache.ibatis.annotations.Mapper;

/**
 * 优惠券 Mapper 接口
 */
@Mapper
public interface CouponMapper extends BaseMapper<Coupon> {

}