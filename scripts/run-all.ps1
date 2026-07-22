# Start EVERYTHING for demo/prod-like environment:
#   - App in Docker (frontend + backend + postgres + redis)
#   - Jenkins CI
#
# NOTE: Local run-dev (Vite/Java on host) is NOT started here —
# it uses the same ports 3000/8080 and would conflict.
#
# Usage: .\scripts\run-all.ps1

$ErrorActionPreference = "Continue"
$scriptsDir = $PSScriptRoot
$root = Split-Path -Parent $scriptsDir
Set-Location $root

Write-Host "=== Java Simple ALL Runner ===" -ForegroundColor Cyan
Write-Host "Docker App + Jenkins (local run-dev emas)" -ForegroundColor DarkGray

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Docker CLI topilmadi. Docker Desktop o'rnatilganligini tekshiring." -ForegroundColor Red
    exit 1
}
docker info 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nDocker Desktop ishlamayapti (daemon o'chiq)." -ForegroundColor Red
    Write-Host "  1) Start menu dan 'Docker Desktop' ni oching" -ForegroundColor Yellow
    Write-Host "  2) Pastki o'ngda whale ikonkasi yashil bo'lguncha kuting" -ForegroundColor Yellow
    Write-Host "  3) Qayta: .\scripts\run-all.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[1/4] Lokal run-dev tozalanmoqda (portlar bo'shashi uchun)..." -ForegroundColor Yellow
& (Join-Path $scriptsDir "stop-dev.ps1") | Out-Null

Write-Host "`n[2/4] Docker App (prod) ishga tushirilmoqda..." -ForegroundColor Yellow
docker compose -p java_simple -f docker-compose.prod.yml up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker App start failed." -ForegroundColor Red
    exit 1
}

Write-Host "`n[3/4] Jenkins ishga tushirilmoqda..." -ForegroundColor Yellow
docker compose -p java_simple -f docker-compose.jenkins.yml up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Jenkins start failed." -ForegroundColor Red
    exit 1
}

Write-Host "`n[4/4] Holat:" -ForegroundColor Yellow
docker compose -p java_simple -f docker-compose.prod.yml ps
docker compose -p java_simple -f docker-compose.jenkins.yml ps

Write-Host "`nTayyor!" -ForegroundColor Green
Write-Host "  Frontend:  http://localhost:3000"
Write-Host "  Backend:   http://localhost:8080"
Write-Host "  Swagger:   http://localhost:8080/swagger-ui/index.html"
Write-Host "  Health:    http://localhost:8080/actuator/health"
Write-Host "  Jenkins:   http://localhost:8081"
Write-Host "`nJenkins parol:" -ForegroundColor Cyan
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>$null
Write-Host ""
Write-Host "Toxtatish: .\scripts\stop-all.ps1" -ForegroundColor DarkGray
Write-Host "Faqat kod yozish (local): .\scripts\run-dev.ps1" -ForegroundColor DarkGray

try { Start-Process "http://localhost:3000" } catch { }
try { Start-Process "http://localhost:8081" } catch { }
