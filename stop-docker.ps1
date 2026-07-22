# Production Docker Compose — stop
# Usage: .\stop-docker.ps1

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot
Set-Location $root

Write-Host "=== Java Simple Docker Stopper ===" -ForegroundColor Cyan

Write-Host "`nDocker Compose toxtatilmoqda..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml down

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nTayyor. Barcha prod konteynerlar toxtatildi." -ForegroundColor Green
    Write-Host "  (Postgres ma'lumotlari volume da saqlanadi)" -ForegroundColor DarkGray
    Write-Host "`nQayta ishga tushirish: .\run-docker.ps1" -ForegroundColor DarkGray
    Write-Host "Lokal dev uchun:           .\run-dev.ps1" -ForegroundColor DarkGray
} else {
    Write-Host "`nXato: Docker Desktop ishlamayotgan bolishi mumkin." -ForegroundColor Red
}
