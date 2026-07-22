# Stop backend (8080) and frontend (3000)
# Usage: .\scripts\stop-dev.ps1

$ErrorActionPreference = "Continue"
$scriptsDir = $PSScriptRoot
$root = Split-Path -Parent $scriptsDir
$pidFile = Join-Path $root "logs\dev.pids"

Write-Host "=== Java Simple Dev Stopper ===" -ForegroundColor Cyan

function Stop-Port {
    param(
        [int]$Port,
        [string]$Label
    )

    Write-Host "`n[$Label] Port $Port tekshirilmoqda..." -ForegroundColor Yellow

    $pids = @()
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($connections) {
            $pids = @($connections | Select-Object -ExpandProperty OwningProcess -Unique)
        }
    } catch {
        $lines = netstat -ano | Select-String ":$Port\s+.*LISTENING"
        foreach ($line in $lines) {
            $parts = ($line.ToString() -split '\s+') | Where-Object { $_ -ne "" }
            if ($parts.Count -ge 5) {
                $pids += [int]$parts[-1]
            }
        }
        $pids = @($pids | Select-Object -Unique)
    }

    if (-not $pids -or $pids.Count -eq 0) {
        Write-Host "  Port $Port bo'sh." -ForegroundColor DarkGray
        return
    }

    foreach ($procId in $pids) {
        if ($procId -le 0) { continue }
        try {
            # Kill process tree (cmd -> java/node children)
            & taskkill /PID $procId /T /F 2>$null | Out-Null
            $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
            $name = if ($proc) { $proc.ProcessName } else { "unknown" }
            Write-Host "  To'xtatildi: PID $procId ($name)" -ForegroundColor Green
        } catch {
            Write-Host "  PID $procId to'xtatilmadi: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

function Stop-SavedPids {
    if (-not (Test-Path $pidFile)) { return }

    Write-Host "`nSaqlangan PID lar to'xtatilmoqda..." -ForegroundColor Yellow
    Get-Content $pidFile -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_ -match "=(?<id>\d+)$") {
            $procId = [int]$Matches["id"]
            try {
                & taskkill /PID $procId /T /F 2>$null | Out-Null
                Write-Host "  PID $procId to'xtatildi" -ForegroundColor Green
            } catch { }
        }
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

function Stop-ByName {
    param(
        [string]$ProcessName,
        [string]$MatchCommand,
        [string]$Label
    )

    $procs = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if (-not $procs) { return }

    foreach ($proc in $procs) {
        try {
            $cmd = (Get-CimInstance Win32_Process -Filter "ProcessId=$($proc.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cmd -and ($cmd -like "*$MatchCommand*")) {
                & taskkill /PID $proc.Id /T /F 2>$null | Out-Null
                Write-Host "  [$Label] To'xtatildi: PID $($proc.Id)" -ForegroundColor Green
            }
        } catch { }
    }
}

Stop-SavedPids
Stop-Port -Port 8080 -Label "Backend"
Stop-Port -Port 3000 -Label "Frontend"

Write-Host "`nQo'shimcha jarayonlar tekshirilmoqda..." -ForegroundColor Yellow
Stop-ByName -ProcessName "java" -MatchCommand "spring-boot:run" -Label "Spring Boot"
Stop-ByName -ProcessName "java" -MatchCommand "java-simple" -Label "Java app"
Stop-ByName -ProcessName "node" -MatchCommand "vite" -Label "Vite"

Write-Host "`nTayyor. Backend va frontend to'xtatildi." -ForegroundColor Green
Write-Host "Qayta ishga tushirish: .\scripts\run-dev.ps1" -ForegroundColor DarkGray
