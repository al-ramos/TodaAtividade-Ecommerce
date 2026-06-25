# TodaAtividade — E-commerce

E-commerce de atividades pedagógicas em PDF para ensino fundamental.  
Domínio: **todaatividade.com.br**

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilo | Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js (Google, Microsoft, Facebook, email/senha) |
| Banco | Supabase (PostgreSQL + RLS) |
| Storage | Cloudflare R2 (PDFs privados + prévias públicas) |
| Pagamento | Mercado Pago SDK v3 (Pix, Boleto, Cartão) |
| Email | Resend |
| Deploy | Vercel (frontend) + Railway (.NET API) |
| CI | GitHub Actions (`.github/workflows/ci.yml`) |

---

## Estrutura de pastas

```
E-COMMERCE/
├── web/                        # Next.js app (working-directory do CI)
│   ├── app/                    # App Router
│   │   ├── (auth)/             # Grupo de rotas de autenticação
│   │   ├── admin/              # Painel administrativo
│   │   ├── atividades/         # Catálogo e páginas de produto
│   │   ├── carrinho/           # Carrinho de compras
│   │   ├── checkout/           # Fluxo de pagamento
│   │   ├── minha-conta/        # Área do usuário
│   │   ├── pedidos/            # Histórico de pedidos
│   │   └── perfil/             # Perfil do usuário
│   ├── components/             # Componentes reutilizáveis
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── catalog/
│   │   ├── checkout/
│   │   ├── layout/
│   │   ├── profile/
│   │   └── ui/                 # Componentes base (shadcn/ui)
│   ├── lib/                    # Utilitários e clientes
│   │   ├── auth.ts             # Config NextAuth
│   │   ├── cart-context.tsx    # Context API do carrinho
│   │   ├── email.ts            # Cliente Resend
│   │   ├── supabase.ts         # Cliente Supabase
│   │   ├── types.ts            # Tipos globais TypeScript
│   │   └── utils.ts            # Helpers gerais
│   └── middleware.ts           # Proteção de rotas NextAuth
├── api/                        # .NET 8 Web API (Clean Architecture)
├── supabase/                   # Migrations e config Supabase
├── .github/
│   ├── pull_request_template.md
│   └── workflows/ci.yml
└── CLAUDE.md                   # Este arquivo
```

---

## Comandos úteis

```bash
# Desenvolvimento
cd web
npm run dev          # Sobe na porta 3000

# Verificações (rodar antes de abrir PR)
npx tsc --noEmit     # Checar TypeScript sem compilar
npm run build        # Build de produção Next.js

# Supabase local (opcional)
npx supabase start
npx supabase db push # Aplicar migrations pendentes
```

---

## Variáveis de ambiente

Copie `web/.env.example` para `web/.env.local` e preencha:

```env
# App
NEXT_PUBLIC_APP_URL=https://todaatividade.com.br

# NextAuth
NEXTAUTH_SECRET=                  # openssl rand -base64 32
NEXTAUTH_URL=https://todaatividade.com.br

# OAuth providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=todaatividade-pdfs
CLOUDFLARE_R2_PUBLIC_URL=

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# .NET API
DOTNET_API_URL=http://localhost:5000
DOTNET_API_KEY=

# Meta Pixel
NEXT_PUBLIC_META_PIXEL_ID=
```

---

## Supabase

**Tabelas principais:**

| Tabela | Descrição |
|---|---|
| `profiles` | Dados do usuário (estende auth.users) |
| `products` | Atividades pedagógicas (título, preço, slug, grade_level) |
| `orders` | Pedidos (status: pending / paid / failed) |
| `order_items` | Itens de cada pedido (produto + preço no momento da compra) |

RLS ativado em todas as tabelas. Downloads de PDF via link assinado com expiração de 24h.

---

## Fluxo de pagamento (Mercado Pago)

1. Checkout → cria `order` com status `pending`
2. Frontend inicializa Brick do MP com `preference_id`
3. MP processa pagamento → chama webhook `/api/webhooks/mercadopago`
4. Webhook valida assinatura HMAC → atualiza `order.status = 'paid'`
5. Email de confirmação enviado via Resend + link de download gerado

---

## Convenções de código

- **Commits:** Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- **Branches:** `main` (produção) e `develop` (staging). Features em `feat/nome-da-feature`
- **PRs:** Usar template em `.github/pull_request_template.md`
- **Kanban:** Notion — referenciar US-ID no PR
- **TypeScript:** strict mode ativado — sem `any` sem comentário justificando

---

## CI/CD

- **GitHub Actions** roda em push/PR para `main` e `develop`
- Pipeline: `npm ci` → `tsc --noEmit` → `npm run build`
- **Vercel** faz deploy automático ao merge em `main`
- Secrets necessários no GitHub: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Deploy

**Plataforma:** Vercel (free tier ou pro)

| Configuração | Valor |
|---|---|
| Root Directory | deixar em branco (monorepo com `vercel.json` na raiz) |
| Framework | Next.js (auto-detectado via `vercel.json`) |
| Build Command | `cd web && npm run build` |
| Output Directory | `web/.next` |
| Install Command | `cd web && npm ci` |

**Variáveis de ambiente:** configurar no dashboard da Vercel em Settings → Environment Variables com os valores de produção do `web/.env.example`.

**Domínio:** `www.todaatividade.com.br` configurado na Vercel com SSL automático. Registros DNS no registrador:
- `CNAME www → cname.vercel-dns.com`
- `A @ → 76.76.21.21`

Consulte `DEPLOY.md` para o guia completo de configuração.

---

## Histórico de Sprints

| Sprint | Épico | Principais entregas |
|--------|-------|---------------------|
| **Sprint 1** | 🔐 Auth | Cadastro + login email/senha, OAuth (Google, Microsoft, Facebook), recuperação de senha por email, middleware de proteção de rotas, `profiles` no Supabase |
| **Sprint 2** | 📚 Catálogo + 📄 Preview | Listagem de atividades com busca e filtros, página de produto por slug, prévia de PDF via react-pdf, upload de prévias no R2 |
| **Sprint 3** | 🛒 Checkout | Carrinho com Context API, fluxo de checkout, Mercado Pago Bricks (Pix, Boleto, Cartão), criação de `order` com status `pending`, polling de status |
| **Sprint 4** | 📦 Entrega + 📧 Email | Webhook Mercado Pago com validação HMAC, `order.status = 'paid'`, download seguro via presigned URL R2 (24h), email de confirmação + link de download via Resend |
| **Sprint 5** | ⚙️ Admin + 📱 SEO | Painel admin (CRUD atividades, upload PDF+prévia R2, gestão de pedidos), SEO (metadata, sitemap), Meta Pixel _(em andamento)_ |

---

## Arquivos-chave por funcionalidade

### Pagamento (Mercado Pago)
- `app/api/checkout/criar-pix/route.ts` — cria preferência Pix
- `app/api/checkout/cartao/route.ts` — processa pagamento cartão
- `app/api/checkout/status/[paymentId]/route.ts` — polling de status
- `app/api/webhooks/mercadopago/route.ts` — recebe notificações, valida HMAC, atualiza pedido
- `app/checkout/pix/page.tsx` / `app/checkout/cartao/page.tsx` — UI do Mercado Pago Bricks

### Download seguro (Cloudflare R2)
- `app/api/download/[orderId]/[productId]/route.ts` — valida pedido pago → gera presigned URL 24h
- `lib/supabase.ts` — helper de validação de ownership do pedido

### Email (Resend)
- `lib/email.ts` — cliente Resend + templates
- `app/api/email/reenviar/route.ts` — reenvio de email de confirmação

### SEO
- `app/layout.tsx` — metadata global (title, description, og:image)
- `app/atividades/[slug]/page.tsx` — metadata dinâmica por produto
- `app/sitemap.ts` — sitemap gerado em runtime com produtos do Supabase

### Busca e filtros
- `app/atividades/page.tsx` — listagem com searchParams (query, grade_level, categoria)
- `lib/supabase.ts` — queries Supabase com filtros dinâmicos

### Admin
- `app/admin/atividades/` — CRUD de atividades (nova, editar, listar)
- `app/admin/pedidos/page.tsx` — gestão de pedidos
- `app/api/admin/products/route.ts` / `[id]/route.ts` — API admin products
- `app/api/admin/upload/route.ts` — upload de PDF e prévia para R2

---

## Padrões de trabalho

- **Não commitar** diretamente durante sessões de tasks — usar `.bat` para commits controlados
- **Scripts de commit:** usar os arquivos `.bat` na raiz do projeto para commits padronizados
- **Conventional Commits:** `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- **Antes de PR:** rodar `npx tsc --noEmit` + `npm run build` (CI vai falhar se quebrar)
- **Branches:** `main` (produção via Vercel) · `develop` (staging) · `feat/nome` para features
