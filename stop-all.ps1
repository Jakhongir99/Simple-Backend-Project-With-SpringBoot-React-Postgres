# Stop EVERYTHING started by run-all.ps1
#   - Docker App (prod)
#   - Jenkins
#   - Local run-dev (agar qolgan bo'lsa)
#
# Usage: .\stop-all.ps1

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot
Set-Location $root

Write-Host "=== Java Simple ALL Stopper ===" -ForegroundColor Cyan

Write-Host "`n[1/3] Lokal run-dev toxtatilmoqda..." -ForegroundColor Yellow
& (Join-Path $root "stop-dev.ps1") | Out-Null

Write-Host "`n[2/3] Docker App toxtatilmoqda..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml down

Write-Host "`n[3/3] Jenkins toxtatilmoqda..." -ForegroundColor Yellow
docker compose -f docker-compose.jenkins.yml down

Write-Host "`nTayyor. Hammasi toxtatildi." -ForegroundColor Green
Write-Host "Qayta ishga tushirish: .\run-all.ps1" -ForegroundColor DarkGray
Write-Host "Faqat local dev:         .\run-dev.ps1" -ForegroundColor DarkGray
