# ============================================================
#  TodaAtividade E-Commerce — DB Reset
#  Aplica todas as migrations no banco Supabase local
#
#  Pré-requisito: Supabase CLI instalado
#    npm install -g supabase  ou  scoop install supabase
#
#  Uso:
#    .\scripts\db-reset.ps1
# ============================================================

$root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  ─────────────────────────────────────────" -ForegroundColor DarkYellow
Write-Host "  TodaAtividade E-Commerce — DB Reset" -ForegroundColor DarkYellow
Write-Host "  ─────────────────────────────────────────" -ForegroundColor DarkYellow
Write-Host ""

# Verifica se o Supabase CLI está disponível
if (-not (Get-Command supabase -ErrorAction SilentlyContinue) -and
    -not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "  ✗ Supabase CLI não encontrado." -ForegroundColor Red
    Write-Host "    Instale com: npm install -g supabase" -ForegroundColor DarkGray
    exit 1
}

Write-Host "  [*] Aplicando migrations Supabase..." -ForegroundColor DarkYellow
Write-Host ""

Set-Location "$root"
npx supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  ✓ Migrations aplicadas com sucesso!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "  ✗ Erro ao aplicar migrations. Verifique acima." -ForegroundColor Red
    Write-Host "    Certifique-se que o Supabase local está rodando: npx supabase start" -ForegroundColor DarkGray
    Write-Host ""
    exit 1
}
