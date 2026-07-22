# Local dev runner: unlock Liquibase, start backend + frontend
# Usage: .\run-dev.ps1

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot

Write-Host "=== Java Simple Dev Runner ===" -ForegroundColor Cyan

# 1. Liquibase lock — backend avtomatik ochadi (LiquibaseLockReleaseProcessor)
Write-Host "`n[1/3] Liquibase lock backend ishga tushganda avtomatik ochiladi." -ForegroundColor DarkGray

# 2. Backend
Write-Host "`n[2/3] Backend ishga tushirilmoqda (port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$root'; Write-Host 'Backend: http://localhost:8080' -ForegroundColor Green; .\mvnw.cmd spring-boot:run"
)

Start-Sleep -Seconds 4

# 3. Frontend
Write-Host "`n[3/3] Frontend ishga tushirilmoqda (port 3000)..." -ForegroundColor Yellow
$frontendDir = Join-Path $root "crud-frontend"
if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Host 'node_modules yok - npm install ishlayapti...' -ForegroundColor Yellow
    Push-Location $frontendDir
    npm install
    Pop-Location
}

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendDir'; Write-Host 'Frontend: http://localhost:3000' -ForegroundColor Green; npm run dev"
)

Write-Host "`nTayyor!" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8080"
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Swagger:  http://localhost:8080/swagger-ui.html"
Write-Host "`nYopish uchun ochilgan terminal oynalarini yoping." -ForegroundColor DarkGray
