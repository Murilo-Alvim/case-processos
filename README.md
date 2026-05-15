# ProcessMap — Mapeamento de Processos Empresariais

Solução full-stack desenvolvida para o **Case Desenvolvedor Full-Stack — Stage Consulting**.
Permite mapear áreas, processos e subprocessos de uma organização em hierarquia
ilimitada, com visualização interativa em fluxograma, detalhamento de ferramentas,
responsáveis e documentação associada.

> 🇧🇷 100% em português · ⚡ TypeScript em todo o stack · 🎨 UI dark moderna

---

## Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Stack Técnica](#stack-técnica)
- [Modelo de Dados](#modelo-de-dados)
- [Setup local](#setup-local)
- [Deploy](#deploy)
- [API REST](#api-rest)
- [Funcionalidades](#funcionalidades)
- [Diferenciais & Extras](#diferenciais--extras)
- [Estrutura de pastas](#estrutura-de-pastas)

---

## Visão Geral

O sistema resolve o problema apresentado no case: empresas que crescem de forma
orgânica acabam com **processos internos sem documentação clara**, dificultando
a visão dos fluxos, das ferramentas utilizadas e dos responsáveis. O ProcessMap
oferece:

- 📁 **Cadastro de áreas** (com cor e ícone próprio para identificação visual)
- 🌳 **Processos hierárquicos infinitos** (processo → subprocesso → sub-sub...)
- 🛠️ **Detalhamento completo** (ferramentas, responsáveis, documentação)
- 🗺️ **Visualização em fluxograma** interativo via React Flow
- 🏷️ **Classificação visual** por tipo (sistêmico, manual, híbrido), status e prioridade
- 📊 **Dashboard analítico** com métricas agregadas em tempo real

## Arquitetura

```
┌──────────────────────────────────────────────────────────────────────┐
│                          NAVEGADOR DO USUÁRIO                        │
│                                                                      │
│   ┌────────────────────────────────────────────────────────────┐    │
│   │             FRONTEND (Vite + React 18 + TS)                │    │
│   │                                                            │    │
│   │   ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │    │
│   │   │ React Router │  │ TanStack     │  │ React Flow     │ │    │
│   │   │ (5 páginas)  │  │ Query        │  │ (fluxograma)   │ │    │
│   │   └──────────────┘  └──────────────┘  └────────────────┘ │    │
│   │   ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │    │
│   │   │ TailwindCSS  │  │ Framer       │  │ Lucide icons   │ │    │
│   │   │ (design sys) │  │ Motion       │  │ + Sonner toast │ │    │
│   │   └──────────────┘  └──────────────┘  └────────────────┘ │    │
│   └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬────────────────────────────────────────┘
                              │  HTTP / JSON
                              │  REST: /api/areas, /api/processes ...
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  BACKEND (Node + Express + TS)                       │
│                                                                      │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│   │ Routes       │  │ Zod          │  │ Error handler          │   │
│   │ (5 routers)  │  │ (validation) │  │ (HTTP + Prisma + Zod)  │   │
│   └──────────────┘  └──────────────┘  └────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│   ┌──────────────────────────────────────────────────────────┐     │
│   │             Prisma ORM (type-safe queries)                │     │
│   └──────────────────────────────────────────────────────────┘     │
└─────────────────────────────┬────────────────────────────────────────┘
                              │
                              ▼
                  ┌─────────────────────────┐
                  │   SQLite  (dev.db)      │
                  │   7 tabelas relacionais │
                  └─────────────────────────┘
```

Pasta dedicada com diagrama Mermaid também em [`docs/architecture.md`](docs/architecture.md).

## Stack Técnica

### Backend
| Camada | Ferramenta | Por quê |
|---|---|---|
| Runtime | **Node.js 18+** | Padrão de mercado, ecossistema TypeScript maduro |
| HTTP | **Express 4** | Simples, leve, amplamente conhecido |
| ORM | **Prisma 5** | Type-safe, migrations automáticas, ótima DX |
| Banco | **PostgreSQL** (Neon em produção) | SGBD relacional padrão; em dev usa o mesmo schema |
| Validação | **Zod** | Schemas tipados que casam com TS sem duplicação |
| Logs | **Morgan** | Logs HTTP legíveis em desenvolvimento |
| Dev | **tsx** | Hot-reload nativo de TS sem build |

### Frontend
| Camada | Ferramenta | Por quê |
|---|---|---|
| Build | **Vite 5** | HMR instantâneo, build moderno |
| UI | **React 18 + TypeScript** | Padrão para SPAs interativas |
| Estilo | **TailwindCSS 3** | Design system consistente e rápido de iterar |
| Estado servidor | **TanStack Query** | Cache, invalidation e refetch automatizados |
| Fluxograma | **@xyflow/react** (React Flow) | Lib robusta para visualização de grafos |
| Animações | **Framer Motion** | Modais fluidos, micro-interações |
| Ícones | **Lucide** | Set moderno, leve, semântico |
| Notificações | **Sonner** | Toasts elegantes com tema dark |
| Roteamento | **React Router 6** | Navegação por rotas com parâmetros |
| HTTP | **Axios** | Interceptor central de erros → UX consistente |

## Modelo de Dados

```
┌──────────┐      ┌────────────┐      ┌──────────┐
│   Area   │ 1──N │  Process   │ N──N │   Tool   │
└──────────┘      └────────────┘      └──────────┘
                   │   ▲                 (ProcessTool)
                   │   │ parentId (self-ref)
                   │   └────── hierarquia ilimitada
                   │
                   ├──N─────────► Responsible (N──N via ProcessResponsible)
                   │
                   └──N─────────► Document
```

- `Process.parentId` é auto-referencial → permite **árvores de profundidade arbitrária**.
- `onDelete: Cascade` em filhos e relações → manutenção sem registros órfãos.
- Áreas têm **cor + ícone** persistidos no banco para personalização visual.

## Setup local

> Pré-requisitos: **Node.js 18+** (recomendado 20) e um **Postgres** acessível.
> A forma mais rápida é criar um banco gratuito em [neon.tech](https://neon.tech)
> (~2 min) e usar a connection string dele para dev *e* produção.

### 1) Backend

```bash
cd backend
cp .env.example .env                 # cole sua DATABASE_URL do Neon
npm install
npm run db:setup                     # migra + popula (4 áreas, 37 processos, 10 ferramentas)
npm run dev                          # http://localhost:3333
```

Health-check: `GET http://localhost:3333/health`

### 2) Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev                          # http://localhost:5173
```

Em dev, o Vite proxia `/api/*` para `http://localhost:3333` automaticamente —
não precisa setar `VITE_API_URL`.

## Deploy

Guia passo a passo em **[DEPLOY.md](DEPLOY.md)**. Resumo:

| Camada | Plataforma | Free? |
|---|---|---|
| Frontend (Vite SPA) | Vercel | Sim |
| Backend (Node API) | Render Web Service | Sim (dorme após 15 min idle) |
| Banco Postgres | Neon | Sim, sem prazo |

Tudo é configurado via os arquivos versionados:
- [frontend/vercel.json](frontend/vercel.json) — rewrites SPA + build
- [backend/render.yaml](backend/render.yaml) — Blueprint do Render

## API REST

Todos os endpoints retornam JSON. Prefixo: `/api`.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/areas` | Lista áreas (com contagem de processos) |
| `GET` | `/areas/:id` | Detalhe de área (com processos + relações) |
| `POST` | `/areas` | Cria área |
| `PUT` | `/areas/:id` | Atualiza área |
| `DELETE` | `/areas/:id` | Remove área (cascata em processos) |
| `GET` | `/processes?areaId=&tree=true` | Lista plana ou em árvore |
| `GET` | `/processes/:id` | Detalhe de processo |
| `POST` | `/processes` | Cria processo (com `parentId`, `toolIds`, `responsibleIds`) |
| `PUT` | `/processes/:id` | Atualiza (substitui ferramentas / responsáveis em transação) |
| `DELETE` | `/processes/:id` | Remove processo (cascata em filhos) |
| `POST` | `/processes/:id/documents` | Adiciona documento |
| `DELETE` | `/processes/:id/documents/:docId` | Remove documento |
| `GET` | `/tools` · `POST` · `PUT` · `DELETE` | CRUD de ferramentas |
| `GET` | `/responsibles` · ... | CRUD de responsáveis |
| `GET` | `/stats` | Métricas agregadas para o dashboard |

### Exemplo de payload (criar processo)

```json
POST /api/processes
{
  "areaId": "f0a...",
  "parentId": "9b1...",
  "name": "Triagem técnica",
  "description": "Filtro técnico antes da entrevista final",
  "type": "hybrid",
  "status": "active",
  "priority": "high",
  "toolIds": ["a1...", "b2..."],
  "responsibleIds": ["c3..."]
}
```

### Validação e erros

Todos os payloads passam por **schemas Zod**. Erros viram resposta padronizada:

```json
{ "error": "Erro de validação", "details": { "fieldErrors": { "name": ["..."] } } }
```

Erros do Prisma (P2025 = not found, P2002 = unique) são traduzidos para
status HTTP corretos no `errorHandler` central.

## Funcionalidades

### 1. Dashboard analítico (`/`)
- KPIs totais (áreas, processos, ferramentas, responsáveis, documentos)
- Barra horizontal de processos por área (clicável → mapa)
- Breakdown por tipo, status e prioridade

### 2. Áreas (`/areas`)
- Cards com cor e ícone customizáveis (10 cores, 10 ícones)
- Contagem de processos
- Botão direto para o mapa da área
- CRUD em modal

### 3. Mapa de Processos (`/mapa` ou `/mapa/:areaId`)
- **Visualização em fluxograma** (React Flow) com layout horizontal automático
- Nós ricos: tipo (ícone), status (dot), prioridade, contadores de ferramentas/responsáveis/docs
- **Botão "+" inline** em cada nó para criar subprocesso (hover)
- Sidepanel ao clicar: edição completa, adição de documentos inline, exclusão
- MiniMap, controles de zoom, pan, fit-to-view
- Filtro por área via chips com a cor da própria área

### 4. Ferramentas (`/ferramentas`) e Responsáveis (`/responsaveis`)
- Listas/grids com CRUD em modal
- Vínculo automático em processos via multi-select com checkbox colorido

### 5. UX & Polimento
- Tema dark moderno com gradientes brand
- Animações em modais (Framer Motion)
- Toasts ricos (Sonner) com tema custom
- Estados de loading / vazio em todas as telas
- Acessibilidade: foco visível, ESC fecha modal
- TypeScript em 100% do código

## Diferenciais & Extras

| Diferencial | Como entrega valor |
|---|---|
| **Algoritmo próprio de layout em árvore** | `layoutTree.ts` posiciona nós com altura dinâmica por subárvore — sem libs externas além do React Flow |
| **Validação client + server** | Zod no backend + estados de form controlados no front |
| **Cache + invalidação automática** | TanStack Query refaz só o necessário após mutações |
| **Hierarquia ilimitada validada** | Backend rejeita `parentId === id` e parent de outra área |
| **Transações Prisma** | Update de processo recria vínculos N-N atomicamente |
| **Visualização semântica** | Cor da área propaga para os edges do fluxograma |
| **Documentação interna** | JSDoc, README, diagrama, comentários em decisões críticas |
| **Tipagem ponta-a-ponta** | Tipos compartilhados de Process / Area / Tool, sem `any` no fluxo crítico |
| **Endpoint /stats agregado** | Backend calcula métricas → frontend só renderiza |

## Estrutura de pastas

```
case-processos/
├── README.md                       (este arquivo)
├── docs/
│   └── architecture.md             (diagrama Mermaid)
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma           (7 tabelas)
│   │   └── seed.ts                 (4 áreas + 37 processos)
│   └── src/
│       ├── server.ts               (entrypoint)
│       ├── app.ts                  (Express + middlewares)
│       ├── lib/
│       │   ├── prisma.ts
│       │   ├── async.ts            (asyncRoute wrapper)
│       │   └── errors.ts           (HttpError, errorHandler, notFound)
│       └── routes/
│           ├── areas.ts
│           ├── processes.ts        (CRUD + nested docs + tree query)
│           ├── tools.ts
│           ├── responsibles.ts
│           └── stats.ts
└── frontend/
    ├── package.json
    ├── vite.config.ts              (proxy /api → :3333)
    ├── tailwind.config.js          (design tokens)
    ├── index.html
    └── src/
        ├── main.tsx                (providers: Query, Router, Toaster)
        ├── App.tsx                 (rotas)
        ├── index.css               (Tailwind + overrides React Flow)
        ├── types.ts                (tipos compartilhados)
        ├── lib/
        │   ├── api.ts              (axios com interceptor)
        │   ├── queries.ts          (hooks TanStack Query)
        │   ├── meta.ts             (cores/ícones de status, tipo, prioridade)
        │   └── utils.ts            (cn helper)
        ├── components/
        │   ├── Layout.tsx          (sidebar + header)
        │   ├── Modal.tsx           (animado)
        │   ├── ConfirmDialog.tsx
        │   ├── PageHeader.tsx
        │   ├── EmptyState.tsx
        │   └── processMap/
        │       ├── ProcessNode.tsx       (nó custom React Flow)
        │       ├── ProcessSidePanel.tsx  (detalhes + docs inline)
        │       ├── ProcessForm.tsx       (criar/editar)
        │       └── layout.ts             (algoritmo de layout)
        └── pages/
            ├── DashboardPage.tsx
            ├── AreasPage.tsx
            ├── ProcessMapPage.tsx
            ├── ToolsPage.tsx
            └── ResponsiblesPage.tsx
```

---

## Decisões técnicas

- **SQLite** foi escolhido para ser zero-setup ao avaliador, mas o schema Prisma
  é trivialmente trocável para Postgres mudando o `provider`.
- **TanStack Query > Redux/Zustand** porque o estado relevante é majoritariamente
  remoto. Reduz boilerplate e evita bugs de sincronização.
- **React Flow** sobre alternativas (mermaid, d3) por ser interativo, com handles,
  edges customizáveis e MiniMap nativos.
- **Algoritmo de layout próprio** (em vez de Dagre) porque a árvore tem
  comportamento previsível e o cálculo recursivo de altura é mais simples e legível.
- **CSS-in-JS evitado** — Tailwind + tokens em `tailwind.config.js` mantém o bundle
  pequeno e o design consistente.

---

**Autor:** Murilo Alvim · Case Stage Consulting — 2026
#   c a s e - p r o c e s o s  
 