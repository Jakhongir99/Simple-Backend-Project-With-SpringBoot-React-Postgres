# application-local.properties dagi OAuth secretlarni .env ga ko'chiradi (Docker uchun).
# Usage: .\scripts\sync-oauth-env.ps1

$ErrorActionPreference = "Stop"
$scriptsDir = $PSScriptRoot
$root = Split-Path -Parent $scriptsDir
$localProps = Join-Path $root "src\main\resources\application-local.properties"
$envFile = Join-Path $root ".env"

if (-not (Test-Path $localProps)) {
    Write-Host "Topilmadi: src\main\resources\application-local.properties" -ForegroundColor Red
    Write-Host "Avval application-local.properties.example dan nusxa oling va secretlarni to'ldiring." -ForegroundColor Yellow
    exit 1
}

$lines = Get-Content $localProps
function Get-Prop([string]$key) {
    foreach ($line in $lines) {
        if ($line -match ("^\s*" + [regex]::Escape($key) + "\s*=\s*(.+)\s*$")) {
            return $Matches[1].Trim()
        }
    }
    return ""
}

$googleId = Get-Prop "spring.security.oauth2.client.registration.google.client-id"
$googleSecret = Get-Prop "spring.security.oauth2.client.registration.google.client-secret"
$githubId = Get-Prop "spring.security.oauth2.client.registration.github.client-id"
$githubSecret = Get-Prop "spring.security.oauth2.client.registration.github.client-secret"

if (-not $googleId -or $googleId.StartsWith("your-")) {
    Write-Host "Google client-id placeholder ko'rinadi. application-local.properties ni tekshiring." -ForegroundColor Red
    exit 1
}

$envContent = @"
POSTGRES_DB=crud_demo
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
JWT_SECRET=change-this-in-production-local-dev-only
JWT_EXPIRATION_MS=3600000
GOOGLE_CLIENT_ID=$googleId
GOOGLE_CLIENT_SECRET=$googleSecret
GITHUB_CLIENT_ID=$githubId
GITHUB_CLIENT_SECRET=$githubSecret
BACKEND_PORT=8080
FRONTEND_PORT=3000
SPRING_CACHE_TYPE=simple
"@

Set-Content -Path $envFile -Value $envContent -Encoding UTF8
Write-Host "Tayyor: .env yozildi (gitignored)." -ForegroundColor Green
Write-Host "Backend ni qayta ishga tushiring:" -ForegroundColor Yellow
Write-Host "  docker compose -p java_simple -f docker-compose.prod.yml up -d --force-recreate --no-deps backend"
Write-Host "Yoki: .\scripts\run-docker.ps1"
