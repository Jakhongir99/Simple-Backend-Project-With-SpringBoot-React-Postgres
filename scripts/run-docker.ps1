# Production Docker Compose — start (build + up)
# Usage: .\scripts\run-docker.ps1

$ErrorActionPreference = "Continue"
$scriptsDir = $PSScriptRoot
$root = Split-Path -Parent $scriptsDir
Set-Location $root

Write-Host "=== Java Simple Docker Runner ===" -ForegroundColor Cyan

# Free local ports if run-dev is still running
Write-Host "`n[1/3] Lokal run-dev tozalanmoqda (agar bor bolsa)..." -ForegroundColor Yellow
& (Join-Path $scriptsDir "stop-dev.ps1") | Out-Null

Write-Host "`n[2/3] Docker Compose build + start..." -ForegroundColor Yellow
Write-Host "  Bu birinchi marta 3-10 daqiqa olishi mumkin." -ForegroundColor DarkGray

docker compose -p java-simple -f docker-compose.prod.yml up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nXato: Docker ishlamayapti yoki build failed." -ForegroundColor Red
    Write-Host "  1) Docker Desktop yoqilganligini tekshiring" -ForegroundColor Yellow
    Write-Host "  2) Qayta urinish: .\scripts\run-docker.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[3/3] Konteynerlar holati:" -ForegroundColor Yellow
docker compose -p java-simple -f docker-compose.prod.yml ps

Write-Host "`nTayyor!" -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend:  http://localhost:8080"
Write-Host "  Health:   http://localhost:8080/actuator/health"
Write-Host "`nToxtatish: .\scripts\stop-docker.ps1" -ForegroundColor DarkGray
Write-Host "Docker Desktop da ham 'java_simple' guruhini korasiz." -ForegroundColor DarkGray

try { Start-Process "http://localhost:3000" } catch { }
