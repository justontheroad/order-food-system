package com.ordering.config;

import com.ordering.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security 配置类
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 禁用 CSRF
            .csrf(AbstractHttpConfigurer::disable)
            // 禁用 Session
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 配置请求授权
            .authorizeHttpRequests(auth -> auth
                // 公开接口（无需登录）
                .requestMatchers(
                    "/api/auth/**",
                    "/api/admin/**",
                    "/api/products/**",
                    "/api/categories/**",
                    "/api/cart/**",
                    "/api/member/**",
                    "/api/promotions/**",
                    "/api/user/coupons",
                    "/api/payments/**",
                    "/api/orders/**",
                    "/druid/**",
                    "/images/**",
                    "/uploads/**",
                    "/error"
                ).permitAll()
                // 其他接口需要认证
                .requestMatchers("/api/**").authenticated()
                // 其他请求全部允许 (用于 H5 页面)
                .anyRequest().permitAll()
            )
            // 添加 JWT 过滤器
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
