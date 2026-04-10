package com.ordering.dto;

import lombok.Data;

/**
 * 注册请求 DTO
 */
@Data
public class RegisterRequest {

    /**
     * 手机号
     */
    private String phone;

    /**
     * 密码 (RSA 加密后的密文)
     */
    private String password;

    /**
     * 验证码
     */
    private String code;

    /**
     * 昵称
     */
    private String nickname;
}
