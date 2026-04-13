package com.ordering.controller;

import com.ordering.dto.ApiResponse;
import com.ordering.entity.User;
import com.ordering.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserMapper userMapper;
    private final String uploadDir = "D:/Projects/AI/order-food-system/uploads/avatars/";

    /**
     * 获取当前用户信息
     */
    @GetMapping("/info")
    public ApiResponse<User> getUserInfo(@AuthenticationPrincipal Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return ApiResponse.error(404, "用户不存在");
        }
        // 不返回密码
        user.setPassword(null);
        return ApiResponse.success(user);
    }

    /**
     * 上传头像
     */
    @PostMapping("/avatar")
    public ApiResponse<Map<String, String>> uploadAvatar(
            @AuthenticationPrincipal Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ApiResponse.error(400, "请选择要上传的文件");
            }

            // 验证文件类型
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ApiResponse.error(400, "只能上传图片文件");
            }

            // 创建上传目录
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 生成唯一文件名
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);

            // 保存文件
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 更新用户头像
            User user = userMapper.selectById(userId);
            if (user != null) {
                user.setAvatar("/uploads/avatars/" + filename);
                userMapper.updateById(user);
            }

            // 返回文件访问 URL
            Map<String, String> result = new HashMap<>();
            result.put("url", "/uploads/avatars/" + filename);
            result.put("filename", filename);

            return ApiResponse.success(result);
        } catch (IOException e) {
            return ApiResponse.error(500, "上传失败：" + e.getMessage());
        }
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/info")
    public ApiResponse<User> updateUserInfo(
            @AuthenticationPrincipal Long userId,
            @RequestParam String nickname) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            return ApiResponse.error(404, "用户不存在");
        }
        user.setNickname(nickname);
        userMapper.updateById(user);
        user.setPassword(null);
        return ApiResponse.success(user);
    }
}
