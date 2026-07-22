# Jenkins Docker stopper
# Usage: .\scripts\stop-jenkins.ps1

$ErrorActionPreference = "Continue"
$scriptsDir = $PSScriptRoot
$root = Split-Path -Parent $scriptsDir
Set-Location $root

Write-Host "=== Jenkins Stopper ===" -ForegroundColor Cyan
Write-Host "`nJenkins toxtatilmoqda..." -ForegroundColor Yellow

docker compose -p java_simple -f docker-compose.jenkins.yml down

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nTayyor. Jenkins toxtatildi." -ForegroundColor Green
    Write-Host "  (Sozlamalar jenkins_home volume da saqlanadi)" -ForegroundColor DarkGray
    Write-Host "`nQayta ishga tushirish: .\scripts\run-jenkins.ps1" -ForegroundColor DarkGray
} else {
    Write-Host "`nXato: Docker Desktop ishlamayotgan bolishi mumkin." -ForegroundColor Red
}
