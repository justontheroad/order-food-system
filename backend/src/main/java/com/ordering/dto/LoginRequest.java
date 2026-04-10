package com.ordering.dto;

import lombok.Data;

/**
 * 登录请求 DTO
 */
@Data
public class LoginRequest {

    /**
     * 用户名 (可以是账号或手机号)
     */
    private String username;

    /**
     * 密码 (RSA 加密后的密文)
     */
    private String password;

    /**
     * 手机号 (预留短信登录)
     */
    private String phone;

    /**
     * 验证码 (预留)
     */
    private String code;
}
