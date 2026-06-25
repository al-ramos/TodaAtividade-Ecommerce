# todaatividade-web

Next.js 14 frontend do [TodaAtividade](../README.md) — App Router + TypeScript + Tailwind CSS + shadcn/ui.

---

## Comandos

```bash
npm run dev          # servidor de desenvolvimento — http://localhost:3000
npm run build        # build de produção
npm start            # servidor de produção (após build)
npm run lint         # ESLint
npx tsc --noEmit     # type-check sem compilar (obrigatório antes de abrir PR)
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

Variáveis obrigatórias para subir localmente:

| Variável | Descrição |
|----------|-----------|
| `NEXTAUTH_SECRET` | Gere com `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` em dev |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon pública (safe para client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role (apenas server-side) |
| `CLOUDFLARE_R2_ACCOUNT_ID` | Account ID Cloudflare |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Access key R2 |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Secret access key R2 |
| `CLOUDFLARE_R2_BUCKET_NAME` | Nome do bucket (`todaatividade-pdfs`) |
| `CLOUDFLARE_R2_PUBLIC_URL` | URL pública do bucket para prévias |
| `MERCADOPAGO_ACCESS_TOKEN` | Token MP (use sandbox para testes) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret para validação HMAC do webhook |
| `RESEND_API_KEY` | Chave da API Resend |

Para OAuth (opcional em dev):

| Variável | Descrição |
|----------|-----------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth App |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` | Azure App Registration |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | Meta App |

Consulte `.env.example` para a lista completa incluindo variáveis opcionais (Meta Pixel, .NET API).

---

## Rotas principais da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth — OAuth + credentials |
| `POST` | `/api/checkout/criar-pix` | Cria pagamento Pix no Mercado Pago |
| `POST` | `/api/checkout/cartao` | Processa pagamento com cartão |
| `GET` | `/api/checkout/parcelas` | Consulta parcelas disponíveis |
| `GET` | `/api/checkout/status/[paymentId]` | Status do pagamento |
| `POST` | `/api/webhooks/mercadopago` | Webhook MP com validação de assinatura HMAC |
| `GET` | `/api/download/[orderId]/[productId]` | Presigned URL R2 — requer pedido `paid` |
| `POST` | `/api/email/reenviar` | Reenvia email de confirmação de compra |
| `GET/POST` | `/api/admin/products` | CRUD de atividades (admin only) |
| `GET/PUT/DELETE` | `/api/admin/products/[id]` | Operações por ID (admin only) |
| `POST` | `/api/admin/upload` | Upload de PDF e prévia para Cloudflare R2 |
