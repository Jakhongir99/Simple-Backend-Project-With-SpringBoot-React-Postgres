Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PostgreSQL Web CRUD Application" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Maven is available
try {
    mvn --version | Out-Null
    Write-Host "Using Maven..." -ForegroundColor Green
    mvn spring-boot:run
} catch {
    Write-Host "Maven is not installed or not in PATH." -ForegroundColor Yellow
    Write-Host "Using Maven wrapper..." -ForegroundColor Green
    .\mvnw.cmd spring-boot:run
}

Write-Host ""
Write-Host "Application finished." -ForegroundColor Cyan
Read-Host "Press Enter to exit" 