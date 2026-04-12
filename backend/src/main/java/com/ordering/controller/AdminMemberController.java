package com.ordering.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ordering.dto.ApiResponse;
import com.ordering.entity.Member;
import com.ordering.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 管理后台会员控制器
 */
@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
public class AdminMemberController {

    private final MemberMapper memberMapper;

    @GetMapping
    public ApiResponse<Page<Member>> getMembers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<Member> p = new Page<>(page, pageSize);
        QueryWrapper<Member> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("created_at");
        Page<Member> result = memberMapper.selectPage(p, wrapper);
        return ApiResponse.success(result);
    }

    @GetMapping("/{id}")
    public ApiResponse<Member> getMember(@PathVariable Long id) {
        Member member = memberMapper.selectById(id);
        return ApiResponse.success(member);
    }

    @PutMapping("/{id}/points")
    public ApiResponse<Void> updateMemberPoints(
            @PathVariable Long id,
            @RequestParam Integer points) {
        Member member = new Member();
        member.setId(id);
        member.setPoints(points);
        memberMapper.updateById(member);
        return ApiResponse.success("更新成功", null);
    }
}
