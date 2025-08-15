# User and Auth Module Structure

This document outlines the modular backend architecture for User and Auth components, following the same pattern used for Department, Job, and Employee modules.

## Project Structure

```
src/main/java/com/example/
├── user/                           # User Module
│   ├── entity/
│   │   ├── User.java              # User JPA entity
│   │   └── enums/
│   │       └── UserRole.java      # User role enumeration
│   ├── repository/
│   │   └── UserRepository.java    # User JPA repository
│   ├── dto/
│   │   ├── UserDto.java           # User response DTO
│   │   ├── CreateUserRequest.java # User creation request DTO
│   │   └── UpdateUserRequest.java # User update request DTO
│   ├── service/
│   │   ├── UserService.java       # User service interface
│   │   └── impl/
│   │       └── UserServiceImpl.java # User service implementation
│   ├── controller/
│   │   └── UserController.java    # User REST controller
│   ├── scheduler/
│   │   └── UserStatsScheduler.java # User statistics scheduler
│   └── exception/
│       ├── UserNotFoundException.java
│       ├── UserValidationException.java
│       └── PasswordValidationException.java
├── auth/                           # Auth Module
│   ├── dto/
│   │   ├── LoginRequest.java      # Login request DTO
│   │   ├── RegisterRequest.java   # Registration request DTO
│   │   └── AuthResponse.java      # Authentication response DTO
│   ├── service/
│   │   ├── AuthService.java       # Auth service interface
│   │   └── impl/
│   │       └── AuthServiceImpl.java # Auth service implementation
│   ├── controller/
│   │   └── AuthController.java    # Auth REST controller
│   └── exception/
│       └── InvalidCredentialsException.java
├── department/                     # Department Module (existing)
├── job/                           # Job Module (existing)
├── employee/                       # Employee Module (existing)
└── security/                       # Security configuration (existing)
```

## User Module

### Entity

- **User.java**: JPA entity with fields: id, name, email, phone, password, role, createdAt, updatedAt
- **UserRole.java**: Enumeration for USER and ADMIN roles

### Repository

- **UserRepository.java**: Extends JpaRepository with custom query methods:
  - `findByEmail()`, `findByPhone()`, `findByName()`
  - `existsByEmail()`, `existsByPhone()`, `existsByName()`
  - `findByRole()`, `countByRole()`
  - Search and pagination methods

### DTOs

- **UserDto**: Response DTO for user data
- **CreateUserRequest**: Request DTO for user creation with validation
- **UpdateUserRequest**: Request DTO for user updates with validation

### Service

- **UserService**: Interface defining user operations
- **UserServiceImpl**: Implementation with business logic:
  - User CRUD operations
  - Password validation
  - Duplicate checking
  - Current user retrieval

### Controller

- **UserController**: REST endpoints:
  - `GET /api/users/me` - Get current user
  - `GET /api/users` - Get all users (admin only)
  - `GET /api/users/{id}` - Get user by ID
  - `POST /api/users` - Create user (admin only)
  - `PUT /api/users/{id}` - Update user
  - `DELETE /api/users/{id}` - Delete user (admin only)
  - Additional utility endpoints

### Scheduler

- **UserStatsScheduler**: Scheduled task to log user count every 5 minutes

### Exceptions

- **UserNotFoundException**: When user is not found
- **UserValidationException**: For validation errors
- **PasswordValidationException**: For password-related errors

## Auth Module

### DTOs

- **LoginRequest**: Login credentials (email, password)
- **RegisterRequest**: Registration data (name, email, phone, password, role)
- **AuthResponse**: Authentication response (token, message, email)

### Service

- **AuthService**: Interface defining authentication operations
- **AuthServiceImpl**: Implementation with business logic:
  - User registration
  - User login
  - Admin user creation
  - Current user retrieval
  - Logout handling

### Controller

- **AuthController**: REST endpoints:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `POST /api/auth/logout` - User logout
  - `POST /api/auth/create-admin` - Create first admin
  - `GET /api/auth/me` - Get current user
  - `GET /api/auth/debug-token` - Debug token information

### Exceptions

- **InvalidCredentialsException**: For authentication failures

## Key Features

### Modular Architecture

- Each module is self-contained with its own package structure
- Clear separation of concerns between modules
- Consistent pattern across all modules

### Security Integration

- JWT-based authentication
- Role-based access control
- Secure password handling with validation

### Data Validation

- Bean validation annotations on DTOs
- Custom validation logic in services
- Comprehensive error handling

### API Design

- RESTful endpoints following best practices
- Consistent response formats
- Proper HTTP status codes
- CORS support

## Migration from Old Structure

The following files were moved/restructured:

- `src/main/java/com/example/entity/User.java` → `src/main/java/com/example/user/entity/User.java`
- `src/main/java/com/example/entity/UserRole.java` → `src/main/java/com/example/user/enums/UserRole.java`
- `src/main/java/com/example/controller/UserController.java` → `src/main/java/com/example/user/controller/UserController.java`
- `src/main/java/com/example/controller/AuthController.java` → `src/main/java/com/example/auth/controller/AuthController.java`
- `src/main/java/com/example/service/UserService.java` → `src/main/java/com/example/user/service/UserService.java`
- `src/main/java/com/example/service/UserStatsScheduler.java` → `src/main/java/com/example/user/scheduler/UserStatsScheduler.java`
- `src/main/java/com/example/repository/UserRepository.java` → `src/main/java/com/example/user/repository/UserRepository.java`

## Benefits

1. **Maintainability**: Clear separation of concerns makes code easier to maintain
2. **Scalability**: New modules can be added following the same pattern
3. **Testability**: Each module can be tested independently
4. **Reusability**: Common patterns and utilities can be shared across modules
5. **Organization**: Logical grouping of related functionality

## Future Enhancements

- Add more user roles and permissions
- Implement user profile management
- Add user activity logging
- Implement password reset functionality
- Add email verification
- Implement two-factor authentication
