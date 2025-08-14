# Role-Based Access Control (RBAC) Implementation

This document explains the RBAC system implemented in the Java Simple CRUD application.

## Overview

The application now implements role-based access control with two user roles:

- **USER**: Default role for all new registrations
- **ADMIN**: Privileged role with access to update/delete operations

## Features

### 1. User Registration

- All new users automatically get the **USER** role
- Users can only perform read operations (GET requests)
- Users cannot update or delete other users

### 2. Admin Privileges

- **ADMIN** users can:
  - Update user information
  - Delete users
  - Promote other users to admin role
- **ADMIN** users have access to all endpoints

### 3. Protected Endpoints

The following endpoints require **ADMIN** role:

- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PUT /api/users/{id}/promote-to-admin` - Promote user to admin

## Setup Instructions

### 1. Database Migration

Run the SQL script to add the role column:

```sql
-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';

-- Update existing users to have USER role
UPDATE users SET role = 'USER' WHERE role IS NULL;

-- Create index on role column for better performance
CREATE INDEX idx_users_role ON users(role);
```

### 2. Create First Admin User

Use the special endpoint to create the first admin user:

```bash
POST /api/auth/create-admin
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "phone": "1234567890"
}
```

**Important**: This endpoint can only be used once. After the first admin is created, it will return an error.

### 3. Promote Additional Users to Admin

Existing admin users can promote other users:

```bash
PUT /api/users/{id}/promote-to-admin
Authorization: Bearer <admin-jwt-token>
```

## API Endpoints

### Public Endpoints (No Authentication Required)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/create-admin` - Create first admin (one-time use)

### User Endpoints (USER Role Required)

- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/search` - Search users
- `GET /api/users/created-between` - Get users by creation date
- `GET /api/users/email-domain-stats` - Get email domain statistics

### Admin Endpoints (ADMIN Role Required)

- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `PUT /api/users/{id}/promote-to-admin` - Promote user to admin

## Error Handling

### Insufficient Privileges (403 Forbidden)

When a user tries to access an admin-only endpoint:

```json
{
  "timestamp": "2024-01-01T00:00:00.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Insufficient privileges. Required roles: [ADMIN], User role: USER",
  "path": "/api/users/1"
}
```

### User Not Found (404 Not Found)

When trying to access a non-existent user:

```json
{
  "timestamp": "2024-01-01T00:00:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "User not found with id: 999",
  "path": "/api/users/999"
}
```

## Security Features

### 1. JWT Token Validation

- All protected endpoints require valid JWT tokens
- Tokens contain user email for role lookup

### 2. Role-Based Authorization

- Uses Spring AOP (Aspect-Oriented Programming)
- Automatic role checking before method execution
- No need to manually check roles in controllers

### 3. Exception Handling

- Custom exceptions for different error scenarios
- Proper HTTP status codes
- Detailed error messages for debugging

## Testing the RBAC System

### 1. Test User Registration

```bash
# Register a regular user
POST /api/auth/register
{
  "name": "Test User",
  "email": "user@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

### 2. Test User Login

```bash
# Login with the user
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 3. Test Admin Operations

```bash
# Try to update a user (should fail with 403)
PUT /api/users/1
Authorization: Bearer <user-jwt-token>
{
  "name": "Updated Name",
  "email": "user@example.com",
  "password": "newpassword123",
  "phone": "1234567890"
}
```

### 4. Test Admin Access

```bash
# Login as admin
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# Update user (should succeed)
PUT /api/users/1
Authorization: Bearer <admin-jwt-token>
{
  "name": "Updated Name",
  "email": "user@example.com",
  "password": "newpassword123",
  "phone": "1234567890"
}
```

## Database Schema

The `users` table now includes:

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Troubleshooting

### Common Issues

1. **403 Forbidden on Update/Delete**

   - Ensure user has ADMIN role
   - Check JWT token is valid
   - Verify user exists in database

2. **Role Column Missing**

   - Run the database migration script
   - Restart the application

3. **AOP Not Working**
   - Ensure `spring-boot-starter-aop` dependency is included
   - Check that `@EnableAspectJAutoProxy` is configured (auto-configured in Spring Boot)

### Debug Mode

Enable debug logging for AOP:

```properties
logging.level.com.example.aspect=DEBUG
logging.level.org.springframework.aop=DEBUG
```

## Future Enhancements

Potential improvements to the RBAC system:

1. **Role Hierarchy**: Implement role inheritance
2. **Permission-Based Access**: Granular permissions for specific operations
3. **Dynamic Role Assignment**: Admin interface for role management
4. **Audit Logging**: Track role changes and access attempts
5. **Session Management**: Role-based session timeouts
