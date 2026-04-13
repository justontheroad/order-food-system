package com.ordering.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ordering.dto.ApiResponse;
import com.ordering.entity.Member;
import com.ordering.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 管理后台会员控制器
 */
@RestController
@RequestMapping("/api/admin/members")
@RequiredArgsConstructor
public class AdminMemberController {

    private final MemberMapper memberMapper;

    @GetMapping
    public ApiResponse<Page<Map<String, Object>>> getMembers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<Map<String, Object>> p = new Page<>(page, pageSize);
        Page<Map<String, Object>> result = memberMapper.selectMembersWithDetails(p);
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
            @RequestBody Map<String, Integer> body) {
        Member member = new Member();
        member.setId(id);
        member.setPoints(body.get("points"));
        memberMapper.updateById(member);
        return ApiResponse.success("更新成功", null);
    }
}
