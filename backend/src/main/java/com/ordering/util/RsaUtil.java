package com.ordering.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;

/**
 * RSA 加密工具类
 */
@Slf4j
@Component
public class RsaUtil {

    private static final String RSA_ALGORITHM = "RSA";
    private static final int KEY_SIZE = 2048;

    // RSA 密钥对 (生产环境应从配置文件或密钥管理服务获取)
    private RSAPublicKey publicKey;
    private RSAPrivateKey privateKey;

    public RsaUtil() {
        try {
            generateKeyPair();
        } catch (Exception e) {
            log.error("Failed to generate RSA key pair", e);
        }
    }

    /**
     * 生成 RSA 密钥对
     */
    private void generateKeyPair() throws NoSuchAlgorithmException {
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(RSA_ALGORITHM);
        keyPairGenerator.initialize(KEY_SIZE);
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        this.publicKey = (RSAPublicKey) keyPair.getPublic();
        this.privateKey = (RSAPrivateKey) keyPair.getPrivate();
        log.info("RSA key pair generated successfully");
    }

    /**
     * 获取公钥字符串 (Base64 编码)
     */
    public String getPublicKeyString() {
        return Base64.getEncoder().encodeToString(publicKey.getEncoded());
    }

    /**
     * 使用私钥解密数据
     *
     * @param encryptedData Base64 编码的加密数据
     * @return 解密后的明文
     */
    public String decrypt(String encryptedData) {
        try {
            Cipher cipher = Cipher.getInstance(RSA_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, privateKey);
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
            return new String(decryptedBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("RSA decryption failed", e);
            throw new RuntimeException("密码解密失败", e);
        }
    }

    /**
     * 使用公钥加密数据 (用于测试)
     *
     * @param data 明文数据
     * @return Base64 编码的加密数据
     */
    public String encrypt(String data) {
        try {
            Cipher cipher = Cipher.getInstance(RSA_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, publicKey);
            byte[] encryptedBytes = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            log.error("RSA encryption failed", e);
            throw new RuntimeException("加密失败", e);
        }
    }
}