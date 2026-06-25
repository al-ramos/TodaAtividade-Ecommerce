# Deploy no Vercel — TodaAtividade E-commerce

## Import rápido (recomendado)

Clique no botão abaixo para importar direto do GitHub:

**https://vercel.com/new/import?s=https://github.com/al-ramos/TodaAtividade-Ecommerce**

---

## Configurações do projeto

| Configuração       | Valor                                            |
|--------------------|--------------------------------------------------|
| Framework          | Next.js (auto-detectado via `vercel.json`)       |
| Root Directory     | deixar em branco (usa `vercel.json` na raiz)     |
| Build Command      | `cd web && npm run build`                        |
| Output Directory   | `web/.next`                                      |
| Install Command    | `cd web && npm ci`                               |
| Branch de produção | `main`                                           |
| Branch de preview  | `develop`                                        |

> O arquivo `E-COMMERCE/vercel.json` já está configurado com esses valores — o Vercel os aplica automaticamente.

---

## Variáveis de ambiente obrigatórias

Configure em **Vercel Dashboard → Settings → Environment Variables** para os environments `Production` e `Preview`.

### App

| Variável                  | Valor / Como obter                                                                  |
|---------------------------|-------------------------------------------------------------------------------------|
| `NEXT_PUBLIC_APP_URL`     | URL de produção: `https://todaatividade.com.br` (preview: URL gerada pelo Vercel)  |

### NextAuth

| Variável          | Como obter                                                                             |
|-------------------|----------------------------------------------------------------------------------------|
| `NEXTAUTH_SECRET` | Gere com: `openssl rand -base64 32` (um segredo único para produção)                   |
| `NEXTAUTH_URL`    | URL de produção: `https://todaatividade.com.br` (preview: URL gerada pelo Vercel)     |

### Google OAuth

| Variável               | Como obter                                                                          |
|------------------------|-------------------------------------------------------------------------------------|
| `GOOGLE_CLIENT_ID`     | console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0               |
| `GOOGLE_CLIENT_SECRET` | Mesmo local acima                                                                   |

> Adicione a URL de callback no GCP: `https://todaatividade.com.br/api/auth/callback/google`

### Microsoft (Azure AD)

| Variável                  | Como obter                                                                      |
|---------------------------|---------------------------------------------------------------------------------|
| `MICROSOFT_CLIENT_ID`     | portal.azure.com → Azure Active Directory → App registrations                  |
| `MICROSOFT_CLIENT_SECRET` | Mesmo local acima → Certificates & secrets                                     |

> Adicione a URL de callback: `https://todaatividade.com.br/api/auth/callback/azure-ad`

### Facebook

| Variável                 | Como obter                                                                       |
|--------------------------|----------------------------------------------------------------------------------|
| `FACEBOOK_CLIENT_ID`     | developers.facebook.com → Seu App → Configurações → Básico                      |
| `FACEBOOK_CLIENT_SECRET` | Mesmo local acima                                                                |

> Adicione a URL de callback: `https://todaatividade.com.br/api/auth/callback/facebook`

### Supabase

| Variável                        | Como obter                                                                 |
|---------------------------------|----------------------------------------------------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`      | app.supabase.com → Seu projeto → Settings → API → Project URL             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Mesmo local → anon public key                                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Mesmo local → service_role key (nunca expor no cliente)                   |

### Cloudflare R2 (Storage de PDFs)

| Variável                          | Como obter                                                                    |
|-----------------------------------|-------------------------------------------------------------------------------|
| `CLOUDFLARE_R2_ACCOUNT_ID`        | dash.cloudflare.com → R2 → Overview → Account ID                             |
| `CLOUDFLARE_R2_ACCESS_KEY_ID`     | R2 → Manage R2 API Tokens → Create API Token                                 |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Gerado no mesmo momento do token acima (salve na hora)                        |
| `CLOUDFLARE_R2_BUCKET_NAME`       | `todaatividade-pdfs`                                                          |
| `CLOUDFLARE_R2_PUBLIC_URL`        | URL pública do bucket R2 (ex: `https://pub-xxx.r2.dev`)                      |

### Mercado Pago

| Variável                             | Como obter                                                                   |
|--------------------------------------|------------------------------------------------------------------------------|
| `MERCADOPAGO_ACCESS_TOKEN`           | mercadopago.com.br → Suas integrações → Credenciais → Access Token (Produção)|
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Mesmo local → Public Key (Produção)                                         |
| `MERCADOPAGO_WEBHOOK_SECRET`         | MP Dashboard → Suas integrações → Webhooks → Assinatura secreta             |

> URL do webhook para configurar no MP: `https://todaatividade.com.br/api/webhooks/mercadopago`

### Resend (E-mail transacional)

| Variável         | Como obter                                       |
|------------------|--------------------------------------------------|
| `RESEND_API_KEY` | resend.com → API Keys → Create API Key          |

### .NET API (Backend)

| Variável         | Valor                                                          |
|------------------|----------------------------------------------------------------|
| `DOTNET_API_URL` | URL da API no Railway (ex: `https://sua-api.railway.app`)     |
| `DOTNET_API_KEY` | Chave compartilhada configurada na API .NET                   |

### Cron Jobs (Vercel Cron)

| Variável      | Como obter                                                                 |
|---------------|----------------------------------------------------------------------------|
| `CRON_SECRET` | Gere com: `openssl rand -base64 32` (protege as rotas `/api/cron/*`)      |

---

## Variáveis opcionais (pós go-live)

### Meta Pixel

| Variável                    | Como obter                                                         |
|-----------------------------|--------------------------------------------------------------------|
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta Business → Events Manager → Pixel → ID do Pixel              |

### Sentry (Monitoramento de erros)

| Variável                  | Como obter                                                              |
|---------------------------|-------------------------------------------------------------------------|
| `NEXT_PUBLIC_SENTRY_DSN`  | sentry.io → Seu projeto → Settings → Client Keys (DSN)                 |
| `SENTRY_DSN`              | Mesmo DSN acima (usado no servidor)                                     |
| `SENTRY_ORG`              | Slug da organização no Sentry                                           |
| `SENTRY_PROJECT`          | Slug do projeto no Sentry                                               |
| `SENTRY_AUTH_TOKEN`       | Sentry → Settings → Auth Tokens → Create New Token (para source maps)  |

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
