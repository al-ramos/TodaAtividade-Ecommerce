# ============================================================
#  TodaAtividade E-Commerce — Build
#  Gera build de produção do Next.js
#
#  Uso:
#    .\scripts\build.ps1
# ============================================================

$root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "  ║  TodaAtividade E-Commerce — Build    ║" -ForegroundColor Yellow
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [*] Iniciando build de produção..." -ForegroundColor Yellow
Write-Host ""

Set-Location "$root\web"
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  ✓ Build concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "  ✗ Build falhou. Verifique os erros acima." -ForegroundColor Red
    Write-Host ""
    exit 1
}
