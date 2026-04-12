package com.ordering.controller;

import com.ordering.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * 管理后台上传控制器
 */
@RestController
@RequestMapping("/api/admin/upload")
public class AdminUploadController {

    @Value("${upload.dir:D:/Projects/AI/order-food-system/uploads}")
    private String uploadDir;

    @PostMapping(value = "/image", consumes = "multipart/form-data")
    public ApiResponse<String> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ApiResponse.error(400, "文件不能为空");
        }

        try {
            // 创建上传目录
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 生成文件名
            String originalFilename = file.getOriginalFilename();
            String ext = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String filename = UUID.randomUUID().toString() + ext;

            // 保存文件
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // 返回访问URL
            String url = "/uploads/" + filename;
            return ApiResponse.success(url);
        } catch (Exception e) {
            return ApiResponse.error(500, "上传失败: " + e.getMessage());
        }
    }
}
