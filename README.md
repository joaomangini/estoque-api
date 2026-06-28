# Estoque API

API de **controle de estoque e patrimônio** com rastreamento de movimentações (entrada/saída), cálculo de estoque atual em tempo real e alerta de estoque baixo via n8n.

**Demo ao vivo:** https://estoque-api-qg3l.onrender.com/api
> Servidor gratuito (Render free tier) — primeira requisição pode levar ~50s para acordar.

## Stack

- NestJS (Node + TypeScript)
- Prisma v6 + PostgreSQL (Neon)
- JWT (access 15min + refresh 7d) + API Key (`x-api-key`)
- class-validator · multi-tenant (cada usuário dono dos seus dados)

## Endpoints

| Recurso | Rotas |
|---------|-------|
| **Auth** | `POST /api/auth/register` · `/login` · `/refresh` · `/logout` · `GET /api/auth/me` |
| **API Keys** | `POST /api/keys` · `GET /api/keys` · `DELETE /api/keys/:id` |
| **Categorias** | `GET/POST /api/categories` · `GET/PATCH/DELETE /api/categories/:id` |
| **Fornecedores** | `GET/POST /api/suppliers` · `GET/PATCH/DELETE /api/suppliers/:id` |
| **Localizacoes** | `GET/POST /api/locations` · `GET/PATCH/DELETE /api/locations/:id` |
| **Itens** | `GET/POST /api/items` · `GET/PATCH/DELETE /api/items/:id` · `GET /api/items/low-stock` |
| **Movimentacoes** | `GET/POST /api/movements` (tipo: `IN` ou `OUT`) |
| **Ativos** | `GET/POST /api/assets` · `GET/PATCH/DELETE /api/assets/:id` |

**Regras principais:**
- Estoque calculado via `SUM(IN) - SUM(OUT)` em tempo real (sem campo denormalizado).
- Saida bloqueada com **400** se quantidade maior que estoque atual.
- `GET /api/items/low-stock` retorna itens onde estoque atual <= minStock.

## Como rodar localmente

```bash
# 1. Clone e instale
npm install

# 2. Configure o .env
DATABASE_URL="postgresql://...neon.tech/...?sslmode=require"
JWT_ACCESS_SECRET="..."
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="..."
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000

# 3. Migration e start
npx prisma migrate dev
npm run start:dev
# API em http://localhost:3000/api
```

## Automacao n8n

Workflow de alerta: **Schedule (diario)** → `GET /api/items/low-stock` → se houver itens abaixo do minimo → envia lista no **Telegram** com nome, estoque atual e minimo esperado.

## Projeto

Projeto #6 do portfolio de APIs NestJS. Reutiliza o template de autenticacao da `financas-api`.
