# ─────────────────────────────────────────────────────────────────────────────
#  push.ps1  —  Commit & Push para branch develop
#
#  Uso:
#    .\scripts\push.ps1 -Message "feat: adiciona checkout"
#    .\scripts\push.ps1 -m "fix: corrige validação de CEP"
# ─────────────────────────────────────────────────────────────────────────────

param(
    [Alias("m")]
    [Parameter(Mandatory=$true)]
    [string]$Message
)

$root = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  TodaAtividade E-Commerce — Commit & Push" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

Set-Location "$root"

$branch = git branch --show-current 2>$null
Write-Host "  Branch: $branch" -ForegroundColor DarkGray

$changed = git status --porcelain 2>$null
if (-not $changed) {
    Write-Host "  ✓ Nenhuma mudança para commitar." -ForegroundColor Green
    Write-Host ""
    exit 0
}

Write-Host "  Arquivos alterados:" -ForegroundColor DarkGray
$changed | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkYellow }
Write-Host ""

git add -A 2>&1 | Out-Null

$commitOut = git commit -m $Message 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Commit falhou: $commitOut" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Commit: $Message" -ForegroundColor Green

$pushOut = git push origin develop 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Push falhou: $pushOut" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Push OK  →  origin/develop" -ForegroundColor Green

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "  ✓ Concluído!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
