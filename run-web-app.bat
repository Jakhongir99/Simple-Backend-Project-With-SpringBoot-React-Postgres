@echo off
echo ========================================
echo    PostgreSQL Web CRUD Application
echo ========================================
echo.

REM Check if Maven is available
mvn --version >nul 2>&1
if errorlevel 1 (
    echo Maven is not installed or not in PATH.
    echo Please install Maven or use the Maven wrapper.
    echo.
    echo Using Maven wrapper...
    call mvnw.cmd spring-boot:run
) else (
    echo Using Maven...
    mvn spring-boot:run
)

echo.
echo Application finished.
pause 