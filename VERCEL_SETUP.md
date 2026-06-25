# Deploy no Vercel — TodaAtividade E-commerce

## Import rápido (recomendado)

Clique no botão abaixo para importar direto do GitHub:

**https://vercel.com/new/import?s=https://github.com/al-ramos/TodaAtividade-Ecommerce**

Na tela de configuração, selecione o team **`alexsandro`** e use o nome `todaatividade-ecommerce`.

---

## Configurações do projeto

| Configuração       | Valor                                            |
|--------------------|--------------------------------------------------|
| **Team**           | `alexsandro`                                     |
| **Project Name**   | `todaatividade-ecommerce`                        |
| **Root Directory** | **`E-COMMERCE`** ⚠️ não deixar em branco        |
| Framework          | Next.js (auto-detectado via `vercel.json`)       |
| Build Command      | `cd web && npm run build`                        |
| Output Directory   | `web/.next`                                      |
| Install Command    | `cd web && npm ci`                               |
| Branch de produção | `develop`                                           |
| Branch de preview  | `feature/*`                                     |

> **Por que `E-COMMERCE` e não em branco?**  
> A raiz do repositório tem apenas a pasta `E-COMMERCE/`. O `vercel.json` está em `E-COMMERCE/vercel.json`.  
> Se o Root Directory ficar em branco, a Vercel olha a raiz do repo, não encontra o `vercel.json` e os comandos de build falham.  
> Com Root Directory = `E-COMMERCE`, o `vercel.json` é encontrado automaticamente e instrui `cd web && ...` para o Next.js.

---

## Variáveis de ambiente

Configure em **Vercel Dashboard → Settings → Environment Variables** para os environments `Production` e `Preview`.

### Tier 1 — Obrigatórias para o build passar

Configure estas **antes** de disparar o primeiro deploy. O build falhará sem elas.

| Variável                        | Valor de produção | Como obter |
|---------------------------------|---|---|
| `NEXT_PUBLIC_APP_URL`           | `https://www.todaatividade.com.br` | fixo |
| `NEXTAUTH_SECRET`               | string aleatória 32 bytes | `openssl rand -base64 32` |
| `NEXTAUTH_URL`                  | `https://www.todaatividade.com.br` | fixo |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xhjlwwewsfpqnkmfpoop.supabase.co` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave anon | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY`     | chave service role | Supabase → Settings → API → service_role (**nunca expor no client**) |

### Tier 2 — Funcionais, não bloqueiam o build

Podem ficar em branco ou com placeholder no primeiro deploy; o app funciona mas as rotas que dependem desses serviços vão falhar.

| Variável         | Placeholder aceitável | Valor real |
|---|---|---|
| `DOTNET_API_URL` | `http://localhost:5000` | URL do Railway após deploy da API |
| `DOTNET_API_KEY` | `placeholder` | chave configurada no backend |
| `CRON_SECRET`    | qualquer string | `openssl rand -base64 32` |

### Tier 3 — OAuth (login social)

| Variável               | Como obter |
|---|---|
| `GOOGLE_CLIENT_ID`     | console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | mesmo local |
| `MICROSOFT_CLIENT_ID`     | portal.azure.com → Azure Active Directory → App registrations |
| `MICROSOFT_CLIENT_SECRET` | mesmo local → Certificates & secrets |
| `FACEBOOK_CLIENT_ID`     | developers.facebook.com → Seu App → Configurações → Básico |
| `FACEBOOK_CLIENT_SECRET` | mesmo local |

> Callbacks a adicionar em cada provider após configurar o domínio:
> - Google: `https://www.todaatividade.com.br/api/auth/callback/google`
> - Microsoft: `https://www.todaatividade.com.br/api/auth/callback/azure-ad`
> - Facebook: `https://www.todaatividade.com.br/api/auth/callback/facebook`

### Tier 3 — Cloudflare R2 (Storage de PDFs)

| Variável                          | Como obter |
|---|---|
| `CLOUDFLARE_R2_ACCOUNT_ID`        | dash.cloudflare.com → R2 → Overview → Account ID |
| `CLOUDFLARE_R2_ACCESS_KEY_ID`     | R2 → Manage R2 API Tokens → Create API Token |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | gerado no mesmo momento (salve na hora) |
| `CLOUDFLARE_R2_BUCKET_NAME`       | `todaatividade-pdfs` |
| `CLOUDFLARE_R2_PUBLIC_URL`        | URL pública do bucket R2 (ex: `https://pub-xxx.r2.dev`) |

### Tier 3 — Mercado Pago (Pagamentos)

| Variável                             | Como obter |
|---|---|
| `MERCADOPAGO_ACCESS_TOKEN`           | mercadopago.com.br → Suas integrações → Credenciais → Access Token (Produção) |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | mesmo local → Public Key (Produção) |
| `MERCADOPAGO_WEBHOOK_SECRET`         | MP Dashboard → Suas integrações → Webhooks → Assinatura secreta |

> URL do webhook para configurar no MP: `https://www.todaatividade.com.br/api/webhooks/mercadopago`

### Tier 3 — Resend (E-mail transacional)

| Variável         | Como obter |
|---|---|
| `RESEND_API_KEY` | resend.com → API Keys → Create API Key |

### Tier 4 — Opcionais (pós go-live)

| Variável                    | Como obter |
|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Business → Events Manager → Pixel → ID do Pixel |
| `NEXT_PUBLIC_SENTRY_DSN`    | sentry.io → Seu projeto → Settings → Client Keys (DSN) |
| `SENTRY_DSN`                | mesmo DSN acima (usado no servidor) |
| `SENTRY_ORG`                | slug da organização no Sentry |
| `SENTRY_PROJECT`            | slug do projeto no Sentry |
| `SENTRY_AUTH_TOKEN`         | Sentry → Settings → Auth Tokens → Create New Token (para source maps) |

---

## Domínio personalizado

Após o deploy inicial, configure o domínio em **Vercel Dashboard → Settings → Domains**:

1. Adicione `www.todaatividade.com.br`
2. Configure os registros DNS no seu registrador:
   - `CNAME www -> cname.vercel-dns.com`
   - `A @ -> 76.76.21.21`
3. O SSL é provisionado automaticamente pelo Vercel

---

## Deploy via CLI (alternativa)

Se preferir fazer o deploy pelo terminal, primeiro faça login:

```bash
npx vercel login
```

Depois, na raiz do monorepo (`E-COMMERCE/`):

```bash
npx vercel --yes
```

Para produção:

```bash
npx vercel --prod
```

---

## Checklist pré-go-live

- [ ] Todas as variáveis obrigatórias configuradas no Vercel
- [ ] Callbacks OAuth atualizados para o domínio de produção (Google, Microsoft, Facebook)
- [ ] Webhook do Mercado Pago apontando para a URL de produção
- [ ] Domínio `www.todaatividade.com.br` configurado e SSL ativo
- [ ] `NEXTAUTH_URL` atualizado para `https://todaatividade.com.br`
- [ ] `NEXT_PUBLIC_APP_URL` atualizado para `https://todaatividade.com.br`
- [ ] Variáveis de ambiente do GitHub Actions configuradas (para CI): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
