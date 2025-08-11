package com.example.service;

import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrDataFactory;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import org.apache.commons.codec.binary.Base32;
import org.springframework.stereotype.Service;

@Service
public class TwoFactorService {
    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();

    public String generateSecret() {
        return secretGenerator.generate();
    }

    public boolean verifyCode(String secret, int code) {
        CodeVerifier verifier = new DefaultCodeVerifier(new DefaultCodeGenerator(HashingAlgorithm.SHA1), new dev.samstevens.totp.time.SystemTimeProvider());
        return verifier.isValidCode(secret, String.valueOf(code));
    }

    public String getOtpAuthUrl(String userEmail, String secret) {
        QrData data = new QrData.Builder()
                .label(userEmail)
                .secret(secret)
                .issuer("JavaSimpleApp")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
        return data.getUri();
    }
}


