# ============================================================
#  TodaAtividade E-Commerce — Lint
#  Executa ESLint em todo o projeto web
#
#  Uso:
#    .\scripts\lint.ps1
# ============================================================

$root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  ─────────────────────────────────────────" -ForegroundColor Magenta
Write-Host "  TodaAtividade E-Commerce — Lint" -ForegroundColor Magenta
Write-Host "  ─────────────────────────────────────────" -ForegroundColor Magenta
Write-Host ""
Write-Host "  [*] Executando ESLint..." -ForegroundColor Magenta
Write-Host ""

Set-Location "$root\web"
npm run lint

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  ✓ Sem problemas de lint!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "  ✗ Problemas encontrados. Verifique acima." -ForegroundColor Red
    Write-Host ""
    exit 1
}
