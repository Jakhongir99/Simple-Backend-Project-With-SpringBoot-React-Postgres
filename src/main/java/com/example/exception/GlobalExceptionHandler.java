package com.example.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PasswordValidationException.class)
    public ResponseEntity<ApiError> handlePasswordValidation(PasswordValidationException ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        ApiError apiError = new ApiError(HttpStatus.UNPROCESSABLE_ENTITY.value(), "Unprocessable Entity", ex.getMessage(), path);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(apiError);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        ApiError apiError = new ApiError(HttpStatus.UNPROCESSABLE_ENTITY.value(), "Unprocessable Entity", "Validation failed", path);
        BindingResult br = ex.getBindingResult();
        apiError.setFieldErrors(
                br.getFieldErrors().stream()
                        .map(f -> new ApiError.FieldErrorItem(f.getField(), f.getDefaultMessage()))
                        .collect(Collectors.toList())
        );
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(apiError);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntime(RuntimeException ex, WebRequest request) {
        String path = ((ServletWebRequest) request).getRequest().getRequestURI();
        ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST.value(), "Bad Request", ex.getMessage(), path);
        return ResponseEntity.badRequest().body(apiError);
    }
}


