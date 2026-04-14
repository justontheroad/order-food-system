package com.ordering.service;

import com.ordering.entity.Admin;
import com.ordering.mapper.AdminMapper;
import com.ordering.security.JwtUtil;
import com.ordering.util.RsaUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 管理员服务类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminMapper adminMapper;
    private final JwtUtil jwtUtil;
    private final RsaUtil rsaUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * 管理员登录 (RSA 加密密码)
     */
    public Map<String, Object> login(String username, String encryptedPassword) {
        // RSA 解密密码
        String password;
        try {
            password = rsaUtil.decrypt(encryptedPassword);
        } catch (RuntimeException e) {
            log.error("RSA解密失败: {}", e.getMessage());
            throw new RuntimeException("密码解密失败");
        }

        log.debug("Admin login attempt for user: {}", username);

        // 查询管理员
        Admin admin = adminMapper.selectOne(
            new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<Admin>()
                .eq("username", username)
        );

        if (admin == null) {
            throw new RuntimeException("管理员不存在");
        }

        // 校验密码
        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        // 生成 Token
        String token = jwtUtil.generateToken(admin.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("username", admin.getUsername());
        result.put("role", admin.getRole());

        return result;
    }

    /**
     * 获取 RSA 公钥
     */
    public String getPublicKey() {
        return rsaUtil.getPublicKeyString();
    }
}
