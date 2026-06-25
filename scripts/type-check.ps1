# ============================================================
#  TodaAtividade E-Commerce — Type Check
#  Verifica tipos TypeScript sem emitir arquivos
#
#  Uso:
#    .\scripts\type-check.ps1
# ============================================================

$root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  ─────────────────────────────────────────" -ForegroundColor Cyan
Write-Host "  TodaAtividade E-Commerce — Type Check" -ForegroundColor Cyan
Write-Host "  ─────────────────────────────────────────" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [*] Verificando tipos TypeScript..." -ForegroundColor Cyan
Write-Host ""

Set-Location "$root\web"
npx tsc --noEmit

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  ✓ Sem erros de tipo!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "  ✗ Erros de tipo encontrados. Verifique acima." -ForegroundColor Red
    Write-Host ""
    exit 1
}
