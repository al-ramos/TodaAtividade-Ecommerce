# 🎓 TodaAtividade — Marketplace de Atividades Pedagógicas

[![Sprint 5 — Em andamento](https://img.shields.io/badge/Sprint%205-Em%20andamento-yellow)](https://github.com/al-ramos/TodaAtividade-Ecommerce)
[![Next.js 14](https://img.shields.io/badge/Next.js%2014-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![CI](https://github.com/al-ramos/TodaAtividade-Ecommerce/actions/workflows/ci.yml/badge.svg)](https://github.com/al-ramos/TodaAtividade-Ecommerce/actions/workflows/ci.yml)

Marketplace B2C de atividades pedagógicas em PDF para o ensino fundamental. Professores e educadores encontram, visualizam uma prévia e compram materiais didáticos com download imediato após a confirmação do pagamento.

**Domínio:** [todaatividade.com.br](https://todaatividade.com.br)

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilo | Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js (Google, Microsoft, Facebook, email/senha) |
| Banco | Supabase (PostgreSQL + RLS) |
| Storage | Cloudflare R2 (PDFs privados + prévias públicas) |
| Pagamento | Mercado Pago SDK v3 (Pix, Boleto, Cartão) |
| Email | Resend |
| Deploy | Vercel (frontend) |
| CI | GitHub Actions (`ci.yml` → tsc + build) |

---

## ✅ Funcionalidades Implementadas

| Sprint | Épico | Entregáveis |
|--------|-------|-------------|
| **Sprint 1** | 🔐 Auth | Cadastro, login, OAuth (Google/Microsoft/Facebook), recuperação de senha, proteção de rotas via middleware NextAuth |
| **Sprint 2** | 📚 Catálogo + 📄 Preview PDF | Listagem com filtros e busca, página de produto por slug, prévia de PDF com react-pdf |
| **Sprint 3** | 🛒 Checkout | Carrinho com Context API, fluxo de checkout, pagamento via Pix, Boleto e Cartão (Mercado Pago Bricks) |
| **Sprint 4** | 📦 Entrega + 📧 Email | Webhook Mercado Pago (validação HMAC), atualização de pedido, download seguro via R2 presigned URL (24h), emails transacionais com Resend |
| **Sprint 5** | ⚙️ Admin + 📱 SEO | Painel admin (CRUD atividades, upload R2, gestão de pedidos), SEO, Meta Pixel _(em andamento)_ |

---

## 🚀 Como rodar localmente

**Pré-requisitos:** Node.js 18+, Git. Para funcionalidades completas: conta Supabase, Cloudflare R2 e Mercado Pago (sandbox).

### 1. Clone o repositório

```bash
git clone https://github.com/al-ramos/TodaAtividade-Ecommerce.git
cd TodaAtividade-Ecommerce/E-COMMERCE
```

### 2. Configure as variáveis de ambiente

```bash
cp web/.env.example web/.env.local
# Edite web/.env.local com suas credenciais
```

### 3. Instale as dependências e suba

```bash
cd web
npm install
npm run dev
# Acesse http://localhost:3000
```

---

## 📁 Estrutura de pastas

```
E-COMMERCE/
├── web/                        # Next.js 14 App (porta 3000)
│   ├── app/
│   │   ├── (auth)/             # login · cadastro · recuperar/redefinir senha
│   │   ├── admin/              # painel admin — atividades e pedidos
│   │   ├── atividades/         # catálogo (/atividades) e produto (/atividades/[slug])
│   │   ├── carrinho/           # carrinho de compras
│   │   ├── checkout/           # fluxo pix e cartão
│   │   ├── minha-conta/        # área logada do usuário
│   │   └── api/                # Route Handlers
│   │       ├── auth/           # NextAuth
│   │       ├── checkout/       # criar-pix · cartao · parcelas · status
│   │       ├── download/       # presigned URL com validação de pedido pago
│   │       ├── email/          # reenvio de confirmação
│   │       ├── webhooks/       # mercadopago (HMAC)
│   │       └── admin/          # products CRUD + upload R2
│   ├── components/             # UI reutilizável — auth · cart · catalog · checkout · admin
│   └── lib/                    # supabase.ts · auth.ts · email.ts · cart-context.tsx · types.ts
├── supabase/
│   └── schema.sql              # Schema PostgreSQL + RLS policies
├── .github/
│   └── workflows/ci.yml        # npm ci → tsc --noEmit → npm run build
└── CLAUDE.md                   # Guia completo para desenvolvimento com IA
```

---

## 🗄️ Banco de dados (Supabase)

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Dados do usuário (estende `auth.users`) |
| `products` | Atividades pedagógicas (título, preço, slug, grade_level) |
| `orders` | Pedidos (`pending` / `paid` / `failed`) |
| `order_items` | Itens do pedido (produto + preço no momento da compra) |

RLS ativado em todas as tabelas. Downloads via presigned URL com expiração de 24h.

---

## 💳 Fluxo de pagamento

```
Checkout → cria order (pending)
  → Frontend inicializa Brick MP com preference_id
    → MP processa pagamento
      → Webhook /api/webhooks/mercadopago
        → Valida assinatura HMAC
          → order.status = 'paid'
            → Email de confirmação (Resend) + link de download (R2)
```

---

## 🔗 Links

| Recurso | URL |
|---------|-----|
| Deploy | [todaatividade.com.br](https://todaatividade.com.br) |
| GitHub | [al-ramos/TodaAtividade-Ecommerce](https://github.com/al-ramos/TodaAtividade-Ecommerce) |
| CI/CD | [GitHub Actions](https://github.com/al-ramos/TodaAtividade-Ecommerce/actions) |
| Banco | [Supabase Dashboard](https://app.supabase.com) |
| Deploy | [Vercel Dashboard](https://vercel.com/) |

---

## 📝 Licença

MIT © Alessandro Ramos
