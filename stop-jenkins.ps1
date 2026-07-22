# Jenkins Docker stopper
# Usage: .\stop-jenkins.ps1

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot
Set-Location $root

Write-Host "=== Jenkins Stopper ===" -ForegroundColor Cyan
Write-Host "`nJenkins toxtatilmoqda..." -ForegroundColor Yellow

docker compose -f docker-compose.jenkins.yml down

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nTayyor. Jenkins toxtatildi." -ForegroundColor Green
    Write-Host "  (Sozlamalar jenkins_home volume da saqlanadi)" -ForegroundColor DarkGray
    Write-Host "`nQayta ishga tushirish: .\run-jenkins.ps1" -ForegroundColor DarkGray
} else {
    Write-Host "`nXato: Docker Desktop ishlamayotgan bolishi mumkin." -ForegroundColor Red
}
