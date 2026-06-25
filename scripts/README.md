# TodaAtividade E-Commerce — Scripts de Automação

Scripts PowerShell para tarefas comuns do projeto. Execute sempre a partir da raiz do projeto ou use o caminho relativo.

```powershell
cd C:\GitHub\TodaAtividade\E-COMMERCE
```

---

## Referência rápida

| Script | Comando | Descrição |
|---|---|---|
| Dev | `.\scripts\dev.ps1` | Servidor local Next.js (http://localhost:3000) |
| Build | `.\scripts\build.ps1` | Build de produção |
| Clean | `.\scripts\clean.ps1` | Remove `.next`, `node_modules` e reinstala deps |
| Type-check | `.\scripts\type-check.ps1` | Verifica tipos TypeScript sem emitir arquivos |
| Lint | `.\scripts\lint.ps1` | ESLint em todo o projeto web |
| DB Reset | `.\scripts\db-reset.ps1` | Aplica migrations Supabase locais |
| Push | `.\scripts\push.ps1 -Message "msg"` | Commit + push para `develop` |

---

## Detalhes

### `dev.ps1`
Inicia o Next.js em modo hot-reload. Requer `.env.local` configurado.

```powershell
.\scripts\dev.ps1
# Acesso: http://localhost:3000
```

### `build.ps1`
Gera o bundle de produção. Falha com exit code 1 se houver erros de compilação.

```powershell
.\scripts\build.ps1
```

### `clean.ps1`
Remove `.next` e `node_modules`, depois executa `npm install`. Útil quando há dependências corrompidas ou conflitos de cache.

```powershell
.\scripts\clean.ps1
```

### `type-check.ps1`
Roda `tsc --noEmit` — valida tipos sem gerar arquivos. Mais rápido que o build completo.

```powershell
.\scripts\type-check.ps1
```

### `lint.ps1`
Executa `npm run lint` (ESLint com a config do Next.js).

```powershell
.\scripts\lint.ps1
```

### `db-reset.ps1`
Aplica todas as migrations no banco Supabase local via `npx supabase db push`.

**Pré-requisito:** Supabase CLI instalado e projeto local rodando (`npx supabase start`).

```powershell
.\scripts\db-reset.ps1
```

### `push.ps1`
Faz `git add -A`, commit e push direto para `origin/develop`.

```powershell
.\scripts\push.ps1 -Message "feat: adiciona carrinho de compras"
# Alias curto:
.\scripts\push.ps1 -m "fix: corrige validação de CEP"
```
