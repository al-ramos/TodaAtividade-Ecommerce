# Todaatividade — Planejamento Técnico

> E-commerce de atividades escolares para ensino fundamental em PDF  
> Domínio: todaatividade.com.br  
> Data: Junho 2026

---

## 1. Visão Geral do Produto

Plataforma de venda de atividades pedagógicas em PDF. O cliente navega por um catálogo (estilo Netshoes), visualiza prévia e descrição de cada atividade, realiza o pagamento e recebe o link de download do PDF completo.

**Fluxo principal:**
```
Navegar catálogo → Visualizar prévia → Adicionar ao carrinho → Pagar → Baixar PDF
```

---

## 2. Stack Tecnológica

### Frontend
| Tecnologia | Função |
|---|---|
| **Next.js 14** (App Router) | Framework React com SSR/SSG — SEO excelente para catálogo |
| **TypeScript** | Tipagem estática, menos bugs |
| **Tailwind CSS** | Estilização rápida e responsiva |
| **shadcn/ui** | Componentes de UI acessíveis e bonitos |
| **React PDF** ou **pdf.js** | Prévia das páginas do PDF no browser |

### Backend / API
| Tecnologia | Função |
|---|---|
| **.NET 8 Web API** | API principal com Clean Architecture |
| **ASP.NET Core** | Framework HTTP |
| **Entity Framework Core** | ORM para PostgreSQL |
| **Swagger / OpenAPI** | Documentação da API |
| **Next.js API Routes** | BFF: webhooks de pagamento, integrações sociais |

### Banco de Dados & Storage
| Tecnologia | Função |
|---|---|
| **Supabase (PostgreSQL)** | Banco principal, auth, RLS policies |
| **Supabase Storage** | PDFs privados + prévias públicas + imagens |

### Autenticação
| Provedor | Método |
|---|---|
| **NextAuth.js** | Orquestra todos os provedores OAuth |
| Google | OAuth 2.0 |
| Microsoft | Azure AD / OAuth 2.0 |
| Facebook | Facebook Login |
| Email/senha | Via Supabase Auth (Magic Link opcional) |

### Pagamentos
| Gateway | Métodos | Prioridade |
|---|---|---|
| **Mercado Pago** | Pix, Boleto, Cartão, Parcelamento | Principal (BR) |
| Stripe | Cartão internacional | Futuro (fase 2) |

> **Por que Mercado Pago como principal?**  
> Parcelamento em até 12x (crucial no Brasil), Pix nativo, boleto, alta taxa de conversão com consumidores brasileiros, sem mensalidade mínima.

### Integrações Sociais
| Integração | Objetivo |
|---|---|
| **Meta Pixel** | Rastrear conversões, criar públicos para ads |
| **Facebook Login** | Autenticação social |
| **Instagram Basic Display API** | Exibir posts/feed do perfil da marca |
| **Open Graph** | Compartilhamento rico no Facebook/WhatsApp |

### Infraestrutura
| Serviço | Uso |
|---|---|
| **Vercel** | Frontend + API Routes — CI/CD automático via GitHub |
| **Railway** | .NET 8 API em container |
| **GitHub** | Repositório, PRs, Actions para CI |
| **Resend** (ou SendGrid) | E-mail transacional (confirmação, recibo, download) |

---

## 3. Modelo de Dados (Simplificado)

```
users
  id, email, name, avatar_url, provider, created_at

categories
  id, name, slug, description, icon

products (atividades)
  id, title, slug, description, category_id
  price, thumbnail_url, preview_pdf_url (1ª página pública)
  full_pdf_path (privado no Storage)
  grade_level (1º ao 9º ano)
  tags, active, created_at

orders
  id, user_id, status (pending/paid/failed)
  payment_method, payment_id (MP), total
  created_at, paid_at

order_items
  id, order_id, product_id, price_at_purchase

downloads
  id, user_id, product_id, order_id
  token (UUID assinado), expires_at, downloaded_at
```

---

## 4. Funcionalidades por Fase

### Fase 1 — MVP (6-8 semanas)
- [ ] Catálogo de atividades com filtros (série, categoria)
- [ ] Página do produto com prévia PDF (1ª página) + descrição
- [ ] Autenticação: Google + Email/senha
- [ ] Carrinho de compras
- [ ] Checkout com Mercado Pago (Pix + Cartão)
- [ ] Download do PDF após pagamento confirmado (link temporário)
- [ ] E-mail de confirmação com link de download
- [ ] Painel admin básico (upload de PDFs, cadastro de produtos)
- [ ] SEO: meta tags, sitemap, Open Graph

### Fase 2 — Crescimento (4-6 semanas)
- [ ] Autenticação: Microsoft + Facebook
- [ ] Integração Meta Pixel
- [ ] Exibição de feed do Instagram na home
- [ ] Boleto bancário (Mercado Pago)
- [ ] Área "Minhas compras" (histórico + redownload)
- [ ] Favoritos / wishlist
- [ ] Avaliações e comentários
- [ ] Cupons de desconto

### Fase 3 — Escala (futuro)
- [ ] Stripe (pagamentos internacionais)
- [ ] App mobile (React Native)
- [ ] Assinatura mensal (acesso ilimitado)
- [ ] Busca semântica de atividades (IA)
- [ ] Programa de afiliados para professores

---

## 5. Segurança

- **PDFs**: armazenados em bucket privado no Supabase Storage
- **Download**: links assinados com expiração (ex: 24h após compra)
- **Watermark dinâmico**: marcar o PDF com email do comprador antes do download
- **HTTPS/TLS**: obrigatório em todos os ambientes
- **Rate limiting**: API protegida contra abuso (ex: 100 req/min por IP)
- **Webhook Mercado Pago**: validar assinatura HMAC antes de processar
- **RLS (Row Level Security)**: Supabase garante que cada usuário só acessa seus dados
- **CORS**: configurado estritamente para o domínio da aplicação
- **Helmet.js / Security Headers**: Content-Security-Policy, X-Frame-Options, etc.

---

## 6. Estrutura de Repositório

```
todaatividade/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/                # App Router pages
│   │   ├── components/         # Componentes UI
│   │   ├── lib/                # Utilitários, clientes de API
│   │   └── api/                # API Routes (webhooks, BFF)
│   └── api/                    # .NET 8 Web API
│       ├── TodaAtividade.API/
│       ├── TodaAtividade.Application/
│       ├── TodaAtividade.Domain/
│       └── TodaAtividade.Infrastructure/
├── packages/
│   └── shared-types/           # Tipos compartilhados (TypeScript)
└── docker-compose.yml          # Ambiente local
```

> Usar **monorepo** com Turborepo ou pnpm workspaces.

---

## 7. Variáveis de Ambiente (principais)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Auth
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=

# API .NET
DOTNET_API_URL=
DOTNET_API_KEY=
```

---

## 8. Estimativa de Custos (Operação)

| Serviço | Plano Inicial | Custo/mês |
|---|---|---|
| Vercel | Hobby / Pro | R$ 0 – R$ 100 |
| Railway (.NET API) | Starter | ~R$ 25 – R$ 50 |
| Supabase | Free / Pro | R$ 0 – R$ 130 |
| Resend (email) | Free (3k emails/mês) | R$ 0 |
| Domínio | todaatividade.com.br | ~R$ 40/ano |
| Mercado Pago | % por transação | ~3.49% + R$ 0.40 |
| **Total fixo** | | **~R$ 50 – R$ 280/mês** |

---

## 9. Próximos Passos Imediatos

1. Criar repositório GitHub (`todaatividade-web`)
2. Inicializar projeto Next.js com TypeScript + Tailwind
3. Criar projeto Supabase e definir schema inicial
4. Configurar NextAuth.js com Google (primeiro provedor)
5. Criar conta Mercado Pago e obter credenciais de sandbox
6. Criar projeto .NET 8 com Clean Architecture
7. Implementar upload de PDFs no painel admin
8. Implementar catálogo + página de produto com prévia PDF
9. Implementar checkout + webhook de confirmação
10. Testes de ponta a ponta antes do go-live

---

*Documento vivo — atualizar conforme decisões forem tomadas.*
