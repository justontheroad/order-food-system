package com.ordering.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置类
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${upload.dir:D:/Projects/AI/order-food-system/uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 统一图片资源映射（使用绝对路径）
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");

        // 分类图片映射
        registry.addResourceHandler("/avatars/**")
                .addResourceLocations("file:" + uploadDir + "/avatars/");
        registry.addResourceHandler("/products/**")
                .addResourceLocations("file:" + uploadDir + "/products/");
        registry.addResourceHandler("/coupons/**")
                .addResourceLocations("file:" + uploadDir + "/coupons/");

        // 配置静态资源映射，允许访问 static/images 目录
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
    }
}
