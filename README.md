# TodaAtividade — E-commerce de Atividades Escolares

## Como rodar localmente

### Pré-requisitos
- Node.js 18+
- .NET 8 SDK
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/todaatividade.git
cd todaatividade
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example web/.env.local
# Edite web/.env.local com suas credenciais
```

### 3. Rode o frontend (Next.js)
```bash
cd web
npm install
npm run dev
# Acesse http://localhost:3000
```

### 4. Rode a API (.NET)
```bash
cd api/TodaAtividade.API
dotnet restore
dotnet run
# Swagger: http://localhost:5000/swagger
```

### 5. Configure o banco (Supabase)
1. Crie um projeto em https://supabase.com → região São Paulo
2. Abra o SQL Editor e rode o conteúdo de `supabase/schema.sql`

---

## Estrutura do projeto
```
E-COMMERCE/
├── web/                    # Next.js 14 (frontend)
│   ├── app/                # App Router pages
│   ├── components/         # Componentes React
│   └── lib/                # Utilitários e tipos
├── api/                    # .NET 8 Web API
│   ├── TodaAtividade.API/
│   ├── TodaAtividade.Application/
│   ├── TodaAtividade.Domain/
│   └── TodaAtividade.Infrastructure/
├── supabase/
│   └── schema.sql          # Schema do banco
└── .env.example            # Template de variáveis
```
