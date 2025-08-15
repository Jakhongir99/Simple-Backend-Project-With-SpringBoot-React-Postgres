package com.example.user.exception;

public class PasswordValidationException extends RuntimeException {
    public PasswordValidationException(String message) {
        super(message);
    }
    
    public PasswordValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
