# ============================================================
#  TodaAtividade E-Commerce — Clean
#  Remove artefatos de build e reinstala dependências
#
#  Uso:
#    .\scripts\clean.ps1
# ============================================================

$root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor DarkRed
Write-Host "  ║  TodaAtividade E-Commerce — Clean    ║" -ForegroundColor DarkRed
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor DarkRed
Write-Host ""

Set-Location "$root\web"

if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "  [x] .next removido" -ForegroundColor Red
} else {
    Write-Host "  [-] .next não encontrado" -ForegroundColor DarkGray
}

if (Test-Path "node_modules") {
    Write-Host "  [*] Removendo node_modules (pode demorar)..." -ForegroundColor DarkGray
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "  [x] node_modules removido" -ForegroundColor Red
} else {
    Write-Host "  [-] node_modules não encontrado" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "  [*] Reinstalando dependências..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  ✓ Dependências reinstaladas com sucesso!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "  ✗ npm install falhou. Verifique os erros acima." -ForegroundColor Red
    Write-Host ""
    exit 1
}
