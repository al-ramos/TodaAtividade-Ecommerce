# ============================================================
#  TodaAtividade E-Commerce — Dev
#  Inicia o servidor Next.js em modo desenvolvimento
#
#  Uso:
#    .\scripts\dev.ps1
#
#  Acesso:
#    Web  -> http://localhost:3000
# ============================================================

$root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor DarkCyan
Write-Host "  ║   TodaAtividade E-Commerce — Dev     ║" -ForegroundColor DarkCyan
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "  [*] Iniciando Next.js dev server..." -ForegroundColor Cyan
Write-Host "  [*] Acesso: http://localhost:3000" -ForegroundColor DarkGray
Write-Host ""

Set-Location "$root\web"
npm run dev
