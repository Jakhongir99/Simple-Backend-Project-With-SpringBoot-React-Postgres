# Java PostgreSQL CRUD Project

A complete CRUD (Create, Read, Update, Delete) application with PostgreSQL database and modern web interface.

## Features

- **Modern Web Interface**: Beautiful, responsive Bootstrap 5 UI
- **PostgreSQL Database**: Robust, scalable database backend
- **REST API**: Full RESTful endpoints for all operations
- **Real-time Updates**: Live database connection status
- **User Management**: Complete user CRUD operations
- **Validation**: Input validation and error handling
- **Responsive Design**: Works on desktop, tablet, and mobile

## Application Versions

### Version 1: Web Application (Recommended)

- **Spring Boot**: Modern Java web framework
- **PostgreSQL**: Production-ready database
- **Bootstrap 5**: Modern, responsive UI
- **REST API**: Full CRUD operations via HTTP
- **Real-time Status**: Database connection monitoring

### Version 2: Console Application

- **Standalone Java**: No external dependencies required
- **PostgreSQL**: Direct database connection
- **Console Interface**: Command-line interface
- **File-based Backup**: Optional data export

## Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/example/
│   │       ├── SimpleCRUDApp.java        # Simple console application
│   │       ├── Application.java          # Spring Boot main class
│   │       ├── controller/
│   │       │   └── UserController.java   # REST API endpoints
│   │       ├── service/
│   │       │   └── UserService.java      # Business logic
│   │       ├── repository/
│   │       │   └── UserRepository.java   # Data access layer
│   │       └── entity/
│   │           └── User.java             # JPA entity
│   └── resources/
│       ├── application.properties        # Database configuration
│       └── static/
│           └── index.html                # Web interface
└── test/
    └── java/                             # Test classes
```

## Quick Start (Web Application)

### Prerequisites

- Java 8 or higher
- PostgreSQL Database Server
- Maven (optional - Maven wrapper included)

### 1. Install PostgreSQL

```powershell
winget install PostgreSQL.PostgreSQL
```

### 2. Setup Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE crud_demo;

-- Exit
\q
```

### 3. Run the Web Application

**Option A: Using PowerShell Script**

```powershell
.\run-web-app.ps1
```

**Option B: Using Batch File**

```cmd
run-web-app.bat
```

**Option C: Manual Maven Command**

```bash
mvn spring-boot:run
```

### 4. Access the Application

Open your browser and go to: **http://localhost:8080**

### Features of Web Application

- ✅ **Modern UI** - Beautiful Bootstrap 5 interface
- ✅ **Real-time Status** - Database connection monitoring
- ✅ **Create/Read/Update/Delete** - Full CRUD operations
- ✅ **Responsive Design** - Works on all devices
- ✅ **Sample Data** - One-click sample data generation
- ✅ **Live Updates** - Real-time data refresh
- ✅ **Error Handling** - User-friendly error messages

## API Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/email/{email}` - Get user by email
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/users/health` - Health check

## Build and Run

### Prerequisites

- Java 11 or higher
- Maven 3.6 or higher

### Build the Project

```bash
mvn clean compile
```

### Run the Application

```bash
mvn spring-boot:run
```

### Access the Application

- **Web Interface**: http://localhost:8080
- **REST API**: http://localhost:8080/api/users
- **Health Check**: http://localhost:8080/api/users/health

### Package and Run

```bash
mvn package
java -jar target/java-simple-1.0.0.jar
```

## Database Schema

The application uses PostgreSQL with the following table:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Console Application

For users who prefer a command-line interface, there's also a standalone console application:

### Run Console Application

**Option A: Using PowerShell Script**

```powershell
.\run-postgresql.ps1
```

**Option B: Using Batch File**

```cmd
run-postgresql.bat
```

**Option C: Manual Compilation**

```bash
javac -cp "lib\postgresql-42.6.0.jar" PostgreSQLCRUDApp.java
java -cp ".;lib\postgresql-42.6.0.jar" PostgreSQLCRUDApp
```

### Console Features

- ✅ **Interactive Menu** - Easy-to-use command-line interface
- ✅ **Direct Database Access** - No web server required
- ✅ **Auto-download Driver** - Automatically downloads PostgreSQL JDBC driver
- ✅ **Error Handling** - Clear error messages and validation
- ✅ **Data Persistence** - All data stored in PostgreSQL database

## Testing

Run the tests:

```bash
mvn test
```
