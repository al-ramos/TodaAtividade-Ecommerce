# Deploy — TodaAtividade E-commerce

Guia completo para deploy do Next.js na Vercel e configuração do domínio `todaatividade.com.br`.

---

## Pré-requisitos

- Node.js 18+ instalado
- Conta na [Vercel](https://vercel.com) (free tier suficiente para começar)
- Acesso ao painel do registrador de domínio (onde `todaatividade.com.br` foi registrado)
- Variáveis de ambiente de produção em mãos (veja seção abaixo)

---

## 1. Configuração inicial na Vercel

### Via dashboard (recomendado para o primeiro deploy)

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Conecte o repositório `al-ramos/TodaAtividade-Ecommerce`
3. Na tela de configuração do projeto:
   - **Root Directory:** deixe em branco (o `vercel.json` na raiz resolve tudo)
   - **Framework:** Next.js (detectado automaticamente)
   - **Build Command:** `cd web && npm run build` (preenchido pelo `vercel.json`)
   - **Output Directory:** `web/.next` (preenchido pelo `vercel.json`)
4. Clique em **Deploy** — o primeiro build vai falhar por falta das env vars. Isso é esperado.

### Via CLI

```bash
npm i -g vercel
vercel login
cd C:\GitHub\TodaAtividade\E-COMMERCE
vercel link          # Associa o diretório ao projeto na Vercel
vercel --prod        # Deploy de produção
```

---

## 2. Variáveis de ambiente de produção

Configure todas as variáveis abaixo em **Vercel Dashboard → projeto → Settings → Environment Variables**.  
Marque cada variável como **Production** (e opcionalmente Preview/Development).

### App

| Variável | Valor de produção | Onde encontrar |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://www.todaatividade.com.br` | fixo |
| `NEXTAUTH_URL` | `https://www.todaatividade.com.br` | fixo |
| `NEXTAUTH_SECRET` | string aleatória 32 bytes | `openssl rand -base64 32` |

### Google OAuth

| Variável | Onde encontrar |
|---|---|
| `GOOGLE_CLIENT_ID` | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → OAuth 2.0 Client IDs |
| `GOOGLE_CLIENT_SECRET` | mesmo lugar |

> **Atenção:** adicionar `https://www.todaatividade.com.br/api/auth/callback/google` como URI de redirecionamento autorizado no Google Console.

### Microsoft OAuth (Azure AD)

| Variável | Onde encontrar |
|---|---|
| `MICROSOFT_CLIENT_ID` | [portal.azure.com](https://portal.azure.com) → Azure Active Directory → App registrations |
| `MICROSOFT_CLIENT_SECRET` | mesmo lugar → Certificates & secrets |

### Facebook OAuth

| Variável | Onde encontrar |
|---|---|
| `FACEBOOK_CLIENT_ID` | [developers.facebook.com](https://developers.facebook.com) → seu app → Settings → Basic |
| `FACEBOOK_CLIENT_SECRET` | mesmo lugar |

### Supabase

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com) → projeto → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | mesma tela → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | mesma tela → service_role (manter secreto!) |

### Cloudflare R2

| Variável | Onde encontrar |
|---|---|
| `CLOUDFLARE_R2_ACCOUNT_ID` | [dash.cloudflare.com](https://dash.cloudflare.com) → R2 Object Storage → Account ID (barra lateral direita) |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | R2 → Manage R2 API tokens → Create API token |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | mesmo lugar (exibido uma vez na criação) |
| `CLOUDFLARE_R2_BUCKET_NAME` | `todaatividade-pdfs` |
| `CLOUDFLARE_R2_PUBLIC_URL` | URL pública do bucket R2 (se habilitada) |

### Mercado Pago

| Variável | Onde encontrar |
|---|---|
| `MERCADOPAGO_ACCESS_TOKEN` | [mercadopago.com.br](https://www.mercadopago.com.br) → Suas integrações → Credenciais → Access token de produção |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | mesma tela → Public key de produção |
| `MERCADOPAGO_WEBHOOK_SECRET` | MP Dashboard → Suas integrações → Webhooks → Assinatura secreta |

> **Atenção:** configurar o webhook no MP apontando para `https://www.todaatividade.com.br/api/webhooks/mercadopago`.

### Resend

| Variável | Onde encontrar |
|---|---|
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys → Create API Key |

> Verificar o domínio `todaatividade.com.br` no Resend para envio sem limitações.

### .NET API (Backend)

| Variável | Valor |
|---|---|
| `DOTNET_API_URL` | URL do serviço no Railway (ex: `https://api.todaatividade.com.br`) |
| `DOTNET_API_KEY` | chave de autenticação configurada no backend |

### Meta Pixel

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_META_PIXEL_ID` | [business.facebook.com](https://business.facebook.com) → Events Manager → Pixel ID |

---

## 3. Configuração de domínio

### Na Vercel

1. Acesse **Vercel Dashboard → projeto → Settings → Domains**
2. Adicione `www.todaatividade.com.br` → clique **Add**
3. Adicione `todaatividade.com.br` → selecione **Redirect to www** → clique **Add**

### No registrador de domínio

Adicione (ou atualize) os registros DNS abaixo:

| Tipo | Nome | Valor | TTL |
|---|---|---|---|
| `CNAME` | `www` | `cname.vercel-dns.com` | 3600 |
| `A` | `@` | `76.76.21.21` | 3600 |

> A propagação DNS pode levar até 24h, mas costuma ser menos de 1h.  
> O SSL (HTTPS) é provisionado automaticamente pela Vercel via Let's Encrypt após a propagação.

---

## 4. Deploy automático (CI/CD)

O repo já tem GitHub Actions (`.github/workflows/ci.yml`) que roda lint/build em cada PR.  
A Vercel cria automaticamente:
- **Preview deployments** para cada branch/PR
- **Production deployment** ao merge em `main`

Para que o CI da Vercel funcione, o app GitHub da Vercel precisa ter acesso ao repositório (configurado durante o `vercel link`).

---

## 5. Checklist pós-deploy

Após o primeiro deploy em produção, verificar:

- [ ] Site carrega em `https://www.todaatividade.com.br`
- [ ] Redirect de `todaatividade.com.br` → `www.todaatividade.com.br` funciona
- [ ] SSL ativo (cadeado no browser)
- [ ] Login com Google funcionando
- [ ] Login com Microsoft funcionando
- [ ] Login com Facebook funcionando
- [ ] Catálogo de atividades carrega
- [ ] Preview de PDF funciona
- [ ] Checkout do Mercado Pago inicializa
- [ ] Webhook do MP recebe eventos (`/api/webhooks/mercadopago`)
- [ ] Email de confirmação enviado após compra (Resend)
- [ ] Download de PDF via link assinado funciona

---

## 6. Rollback

### Via dashboard

Vercel Dashboard → projeto → Deployments → selecione um deploy anterior → **Promote to Production**

### Via CLI

```bash
vercel rollback [deployment-url]
```

---

## Suporte

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Next.js monorepo: [vercel.com/docs/monorepos](https://vercel.com/docs/monorepos)
- Domínios: [vercel.com/docs/domains](https://vercel.com/docs/domains)
