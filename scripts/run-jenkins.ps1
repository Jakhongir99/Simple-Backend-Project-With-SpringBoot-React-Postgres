# Jenkins Docker runner
# Usage: .\scripts\run-jenkins.ps1

$ErrorActionPreference = "Continue"
$scriptsDir = $PSScriptRoot
$root = Split-Path -Parent $scriptsDir
Set-Location $root

Write-Host "=== Jenkins Runner ===" -ForegroundColor Cyan

Write-Host "`n[1/2] Jenkins image build + start..." -ForegroundColor Yellow
docker compose -f docker-compose.jenkins.yml up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nXato: Docker Desktop yoqilganligini tekshiring." -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/2] Jenkins tayyor bolishi kutilmoqda..." -ForegroundColor Yellow
$ready = $false
for ($i = 1; $i -le 60; $i++) {
    try {
        $resp = Invoke-WebRequest "http://localhost:8081/login" -UseBasicParsing -TimeoutSec 3
        if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
            $ready = $true
            break
        }
    } catch {
        # still starting
    }
    Start-Sleep -Seconds 2
    Write-Host "  Kutilyapti... $($i * 2)s" -ForegroundColor DarkGray
}

Write-Host ""
if ($ready) {
    Write-Host "Jenkins ochildi: http://localhost:8081" -ForegroundColor Green
} else {
    Write-Host "Jenkins hali yuklanayotgan bolishi mumkin: http://localhost:8081" -ForegroundColor Yellow
}

Write-Host "`n--- Administrator parol ---" -ForegroundColor Cyan
$password = docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>$null
if ($password) {
    Write-Host $password -ForegroundColor Green
    Write-Host "`nShu parolni Jenkins sahifasiga joylang va Continue bosing." -ForegroundColor DarkGray
} else {
    Write-Host "Parol hali tayyor emas. Bir necha soniyadan keyin:" -ForegroundColor Yellow
    Write-Host '  docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword'
}

Write-Host "`nToxtatish: .\scripts\stop-jenkins.ps1" -ForegroundColor DarkGray
try { Start-Process "http://localhost:8081" } catch { }
