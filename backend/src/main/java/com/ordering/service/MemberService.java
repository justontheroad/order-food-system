package com.ordering.service;

import com.ordering.entity.Member;
import com.ordering.entity.MemberLevel;

import java.util.List;

/**
 * 会员服务接口
 */
public interface MemberService {

    /**
     * 获取会员信息
     */
    Member getMemberInfo(Long userId);

    /**
     * 获取会员等级列表
     */
    List<MemberLevel> getMemberLevels();

    /**
     * 获取当前积分
     */
    Integer getPoints(Long userId);

    /**
     * 积分兑换
     */
    boolean exchangePoints(Long userId, Integer points, Integer forAmount);

    /**
     * 消费后发放积分
     */
    void awardPoints(Long userId, Integer amount);

    /**
     * 创建会员
     */
    Member createMember(Long userId);

    /**
     * 检查并升级会员等级
     */
    void checkAndUpgradeLevel(Long userId);
}