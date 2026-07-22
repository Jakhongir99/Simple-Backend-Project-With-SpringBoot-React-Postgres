# Local dev runner: start backend + frontend as detached processes
# Closing this terminal will NOT stop the apps.
# Usage: .\run-dev.ps1

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot
$logDir = Join-Path $root "logs"
$pidFile = Join-Path $logDir "dev.pids"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$backendLog = Join-Path $logDir "backend.log"
$frontendLog = Join-Path $logDir "frontend.log"
$backendErr = Join-Path $logDir "backend.err.log"
$frontendErr = Join-Path $logDir "frontend.err.log"

Write-Host "=== Java Simple Dev Runner ===" -ForegroundColor Cyan

function Test-PortOpen {
    param([int]$Port)
    try {
        $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        return $null -ne $conn
    } catch {
        $hit = netstat -ano | Select-String ":$Port\s+.*LISTENING"
        return $null -ne $hit
    }
}

function Wait-Port {
    param(
        [int]$Port,
        [string]$Label,
        [int]$TimeoutSec = 180
    )
    $elapsed = 0
    while ($elapsed -lt $TimeoutSec) {
        if (Test-PortOpen -Port $Port) {
            Write-Host "  $Label tayyor (port $Port)" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
        Write-Host "  $Label kutilyapti... ${elapsed}s" -ForegroundColor DarkGray
    }
    Write-Host "  $Label $TimeoutSec soniyada ochilmadi." -ForegroundColor Red
    return $false
}

# Stop old instances first
Write-Host "`n[0/4] Eski jarayonlar tozalanmoqda..." -ForegroundColor Yellow
& (Join-Path $root "stop-dev.ps1") | Out-Null
Start-Sleep -Seconds 2

$frontendDir = Join-Path $root "crud-frontend"
if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
    Write-Host "node_modules yoq - npm install..." -ForegroundColor Yellow
    Push-Location $frontendDir
    npm install
    Pop-Location
}

# Clear old logs
foreach ($f in @($backendLog, $frontendLog, $backendErr, $frontendErr)) {
    if (Test-Path $f) { Remove-Item $f -Force }
}

# Backend — detached (windowless), survives closing this terminal
Write-Host "`n[1/4] Backend ishga tushirilmoqda (8080)..." -ForegroundColor Yellow
$backendProc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "mvnw.cmd spring-boot:run > `"$backendLog`" 2> `"$backendErr`"" `
    -WorkingDirectory $root `
    -WindowStyle Hidden `
    -PassThru
Write-Host "  Backend PID: $($backendProc.Id)" -ForegroundColor DarkGray

# Frontend — detached
Write-Host "`n[2/4] Frontend ishga tushirilmoqda (3000)..." -ForegroundColor Yellow
$frontendProc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c", "npm run dev > `"$frontendLog`" 2> `"$frontendErr`"" `
    -WorkingDirectory $frontendDir `
    -WindowStyle Hidden `
    -PassThru
Write-Host "  Frontend PID: $($frontendProc.Id)" -ForegroundColor DarkGray

# Save PIDs for stop-dev.ps1
@(
    "backend=$($backendProc.Id)"
    "frontend=$($frontendProc.Id)"
) | Set-Content -Path $pidFile -Encoding ASCII

# Wait for readiness
Write-Host "`n[3/4] Portlar ochilishi kutilmoqda..." -ForegroundColor Yellow
$backendOk = Wait-Port -Port 8080 -Label "Backend" -TimeoutSec 180
$frontendOk = Wait-Port -Port 3000 -Label "Frontend" -TimeoutSec 90

Write-Host "`n[4/4] Natija" -ForegroundColor Yellow
if ($backendOk -and $frontendOk) {
    Write-Host "Tayyor! (terminalni yopsangiz ham ishlayveradi)" -ForegroundColor Green
    Write-Host "  Backend:  http://localhost:8080"
    Write-Host "  Frontend: http://localhost:3000"
    Write-Host "  Swagger:  http://localhost:8080/swagger-ui.html"
    Write-Host "  Loglar:   logs\backend.log , logs\frontend.log"
    try { Start-Process "http://localhost:3000" } catch { }
} else {
    Write-Host "Ba'zi servislar ochilmadi." -ForegroundColor Red
    Write-Host "  Backend log:  $backendLog / $backendErr"
    Write-Host "  Frontend log: $frontendLog / $frontendErr"
    if (Test-Path $backendErr) {
        Write-Host "`n--- Backend error ---" -ForegroundColor Yellow
        Get-Content $backendErr -Tail 25 -ErrorAction SilentlyContinue
    }
    if (Test-Path $frontendErr) {
        Write-Host "`n--- Frontend error ---" -ForegroundColor Yellow
        Get-Content $frontendErr -Tail 25 -ErrorAction SilentlyContinue
    }
}

Write-Host "`nTo'xtatish: .\stop-dev.ps1" -ForegroundColor DarkGray
