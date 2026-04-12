package com.ordering.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.ordering.entity.Member;
import com.ordering.entity.MemberLevel;
import com.ordering.mapper.MemberMapper;
import com.ordering.mapper.MemberLevelMapper;
import com.ordering.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

/**
 * 会员服务实现类
 */
@Service
@RequiredArgsConstructor
public class MemberServiceImpl implements MemberService {

    private final MemberMapper memberMapper;
    private final MemberLevelMapper memberLevelMapper;

    // 消费1元 = 10积分
    private static final int POINTS_PER_YUAN = 10;

    @Override
    public Member getMemberInfo(Long userId) {
        if (userId == null) {
            return null; // 未登录用户返回null
        }
        Member member = memberMapper.selectOne(new LambdaQueryWrapper<Member>()
                .eq(Member::getUserId, userId));
        if (member == null) {
            // 自动创建会员
            member = createMember(userId);
        }
        // 加载等级信息
        if (member.getLevelId() != null) {
            MemberLevel level = memberLevelMapper.selectById(member.getLevelId());
            member.setLevel(level); // 设置等级对象供前端展示
        }
        return member;
    }

    @Override
    public List<MemberLevel> getMemberLevels() {
        return memberLevelMapper.selectList(new LambdaQueryWrapper<MemberLevel>()
                .orderByAsc(MemberLevel::getSortOrder));
    }

    @Override
    public Integer getPoints(Long userId) {
        Member member = memberMapper.selectOne(new LambdaQueryWrapper<Member>()
                .eq(Member::getUserId, userId));
        return member != null ? member.getPoints() : 0;
    }

    @Override
    @Transactional
    public boolean exchangePoints(Long userId, Integer points, Integer forAmount) {
        Member member = memberMapper.selectOne(new LambdaQueryWrapper<Member>()
                .eq(Member::getUserId, userId));

        if (member == null || member.getPoints() < points) {
            return false;
        }

        // 扣减积分
        member.setPoints(member.getPoints() - points);
        memberMapper.updateById(member);

        return true;
    }

    @Override
    @Transactional
    public void awardPoints(Long userId, Integer amount) {
        Member member = memberMapper.selectOne(new LambdaQueryWrapper<Member>()
                .eq(Member::getUserId, userId));

        if (member == null) {
            member = createMember(userId);
        }

        // 计算积分
        int points = amount * POINTS_PER_YUAN;
        member.setPoints(member.getPoints() + points);
        member.setTotalAmount(member.getTotalAmount().add(BigDecimal.valueOf(amount)));

        memberMapper.updateById(member);

        // 检查是否升级
        checkAndUpgradeLevel(userId);
    }

    @Override
    @Transactional
    public Member createMember(Long userId) {
        Member member = new Member();
        member.setUserId(userId);
        member.setLevelId(1L); // 默认等级
        member.setPoints(0);
        member.setTotalAmount(BigDecimal.ZERO);
        member.setStatus(1);
        memberMapper.insert(member);
        return member;
    }

    @Override
    @Transactional
    public void checkAndUpgradeLevel(Long userId) {
        Member member = memberMapper.selectOne(new LambdaQueryWrapper<Member>()
                .eq(Member::getUserId, userId));

        if (member == null) return;

        List<MemberLevel> levels = memberLevelMapper.selectList(new LambdaQueryWrapper<MemberLevel>()
                .orderByAsc(MemberLevel::getSortOrder));

        // 从高到低检查
        for (int i = levels.size() - 1; i >= 0; i--) {
            MemberLevel level = levels.get(i);
            if (member.getTotalAmount().compareTo(BigDecimal.valueOf(level.getRequiredPoints())) >= 0) {
                if (!level.getId().equals(member.getLevelId())) {
                    member.setLevelId(level.getId());
                    memberMapper.updateById(member);
                }
                break;
            }
        }
    }
}