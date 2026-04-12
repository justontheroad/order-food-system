package com.ordering.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.ordering.dto.LoginRequest;
import com.ordering.dto.LoginResponse;
import com.ordering.dto.RegisterRequest;
import com.ordering.entity.User;
import com.ordering.mapper.UserMapper;
import com.ordering.security.JwtUtil;
import com.ordering.util.RsaUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * 认证服务类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final RsaUtil rsaUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * 用户登录 (账号/手机号 + 密码)
     */
    public LoginResponse login(LoginRequest request) {
        String username = request.getUsername();
        String encryptedPassword = request.getPassword();

        // RSA 解密密码
        String password;
        try {
            password = rsaUtil.decrypt(encryptedPassword);
        } catch (RuntimeException e) {
            // 开发模式：如果解密失败且密码是明文（6位数字），直接使用
            if (encryptedPassword != null && encryptedPassword.matches("^\\d{6}$")) {
                password = encryptedPassword;
            } else {
                throw e;
            }
        }
        log.debug("Login attempt for user: {}", username);

        // 根据用户名或手机号查询用户
        User user = userMapper.selectOne(
            new QueryWrapper<User>()
                .eq("username", username)
                .or()
                .eq("phone", username)
        );

        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        if (user.getPassword() == null) {
            throw new RuntimeException("该用户未设置密码，请使用其他方式登录");
        }

        // 校验密码 (开发模式 testuser 可用明文密码 123456)
        if ("testuser".equals(username) && "123456".equals(password)) {
            // 开发模式快速登录
        } else if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("密码错误");
        }

        // 生成 Token
        String token = jwtUtil.generateToken(user.getId());

        return new LoginResponse(
            token,
            "Bearer",
            604800000L, // 7 天
            user.getId(),
            user.getNickname()
        );
    }

    /**
     * 用户注册
     */
    public LoginResponse register(RegisterRequest request) {
        String phone = request.getPhone();

        // 检查手机号是否已存在
        User existingUser = userMapper.selectOne(
            new QueryWrapper<User>().eq("phone", phone)
        );

        if (existingUser != null) {
            throw new RuntimeException("手机号已注册");
        }

        // 创建新用户
        User user = new User();
        user.setPhone(phone);
        user.setNickname(request.getNickname() != null ? request.getNickname() : "用户" + phone.substring(7));
        user.setCreatedAt(LocalDateTime.now());

        // 如果有密码，则加密存储
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            String decryptedPassword = rsaUtil.decrypt(request.getPassword());
            user.setPassword(passwordEncoder.encode(decryptedPassword));
        }

        userMapper.insert(user);

        // 生成 Token
        String token = jwtUtil.generateToken(user.getId());

        return new LoginResponse(
            token,
            "Bearer",
            604800000L,
            user.getId(),
            user.getNickname()
        );
    }

    /**
     * 获取 RSA 公钥
     */
    public String getPublicKey() {
        return rsaUtil.getPublicKeyString();
    }
}
