package com.ordering.controller;

import com.ordering.dto.ApiResponse;
import com.ordering.entity.Member;
import com.ordering.entity.MemberLevel;
import com.ordering.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 会员控制器
 */
@RestController
@RequestMapping("/api/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /**
     * 获取会员信息
     */
    @GetMapping("/info")
    public ApiResponse<Member> getMemberInfo(@AuthenticationPrincipal Long userId) {
        Member member = memberService.getMemberInfo(userId);
        return ApiResponse.success(member);
    }

    /**
     * 获取会员等级列表
     */
    @GetMapping("/levels")
    public ApiResponse<List<MemberLevel>> getMemberLevels() {
        List<MemberLevel> levels = memberService.getMemberLevels();
        return ApiResponse.success(levels);
    }

    /**
     * 获取当前积分
     */
    @GetMapping("/points")
    public ApiResponse<Integer> getPoints(@AuthenticationPrincipal Long userId) {
        Integer points = memberService.getPoints(userId);
        return ApiResponse.success(points);
    }

    /**
     * 积分兑换
     */
    @PostMapping("/points/exchange")
    public ApiResponse<Void> exchangePoints(
            @AuthenticationPrincipal Long userId,
            @RequestParam Integer points,
            @RequestParam Integer forAmount) {
        boolean success = memberService.exchangePoints(userId, points, forAmount);
        if (success) {
            return ApiResponse.success("积分兑换成功", null);
        }
        return ApiResponse.error(400, "积分不足");
    }
}