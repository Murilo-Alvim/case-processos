# ProcessMap

ProcessMap é uma aplicação full-stack para mapeamento hierárquico de processos empresariais. O projeto permite que organizações descrevam áreas, processos e subprocessos com profundidade ilimitada, anexando ferramentas, responsáveis, status, prioridades e documentação a cada nó.

A proposta é transformar processos que normalmente vivem em planilhas, fluxogramas estáticos e documentos soltos em uma experiência visual e navegável, mais próxima de ferramentas como Notion, Lucidchart e Process Street.

🔗 **Demo:** https://case-processos.vercel.app
📦 **Repositório:** https://github.com/Murilo-Alvim/case-processos

## Destaques

- Hierarquia ilimitada de processos com auto-referência no banco e validação anti-ciclo.
- Mapa de processos interativo em fluxograma (React Flow) com layout automático em árvore.
- Dashboard analítico com KPIs e breakdown por tipo, status e prioridade.
- CRUD completo de áreas (com cor e ícone próprios), processos, ferramentas e responsáveis.
- Relacionamentos N-N entre processos ↔ ferramentas e processos ↔ responsáveis.
- Documentação anexada por processo (links e títulos).
- Backend REST em Node.js, Express, TypeScript e Prisma.
- Banco PostgreSQL na Neon, acessado via `@prisma/adapter-neon` sobre WebSocket.
- Frontend em React 18, TypeScript, Vite e Tailwind CSS, com TanStack Query.
- Tipagem ponta-a-ponta, validação Zod no backend e estados controlados no front.
- Interface dark moderna, 100% responsiva (drawer no mobile, sidebar fixa no desktop).
- Deploy pronto para Vercel (front), Render (back) e Neon (banco).

## Visão do produto

Empresas precisam entender quem faz o que, em qual área, com qual ferramenta, em qual nível de prioridade e onde está a documentação de apoio. O ProcessMap centraliza essa informação em uma interface visual onde cada processo é um nó conectável.

Fluxo principal:

1. O usuário cria **áreas** (Comercial, Financeiro, Tecnologia, Pessoas...) com cor e ícone próprios.
2. Dentro de cada área, cadastra **processos** e **subprocessos**, definindo tipo (manual, sistêmico ou híbrido), status e prioridade.
3. A cada processo vincula **ferramentas** usadas, **responsáveis** envolvidos e **documentos** de referência.
4. O **Mapa de Processos** renderiza a hierarquia inteira como um fluxograma navegável, com painel lateral de detalhes.
5. O **Dashboard** agrega tudo em métricas operacionais consultáveis em tempo real.

## Stack técnica

### Backend

- **Node.js** + **Express 4** + **TypeScript** — runtime e framework HTTP.
- **Prisma 5** — ORM type-safe com migrations versionadas.
- **PostgreSQL** (**Neon**) — banco serverless, conectado via `@prisma/adapter-neon` sobre WebSocket (porta 443) para funcionar em redes que bloqueiam a 5432.
- **Zod** — validação de schemas no boundary da API.
- **Morgan** — logs HTTP em desenvolvimento.
- **tsx** — execução de TypeScript com hot-reload, sem build em dev.

### Frontend

- **React 18** + **TypeScript** + **Vite 5** — base e build moderna.
- **Tailwind CSS** — design system com tokens próprios em `tailwind.config.js`.
- **TanStack Query** — cache, invalidação e refetch automatizados após mutações.
- **React Flow (@xyflow/react)** — visualização do fluxograma com nós e edges customizáveis.
- **Framer Motion** — animações de modais e micro-interações.
- **Lucide Icons**, **Sonner**, **React Router 6**, **Axios** com interceptor central de erros.

## Modelo de dados

```
Area  1───N  Process  N───N  Tool          (via ProcessTool)
              │   ▲
              │   │ parentId (auto-referência)
              │   └────── hierarquia ilimitada
              │
              ├───N  Responsible           (via ProcessResponsible)
              └───N  Document
```

- `Process.parentId` é auto-referencial, permitindo árvores de profundidade arbitrária.
- `onDelete: Cascade` em filhos e relações N-N garante manutenção sem registros órfãos.
- O backend rejeita ciclos (`parentId === id`) e parents de outras áreas.

## Como rodar localmente

Pré-requisitos: **Node.js 18+** e uma instância de Postgres acessível (a forma mais rápida é criar um banco gratuito em [neon.tech](https://neon.tech)).

### Backend

```bash
cd backend
cp .env.example .env                # cole sua DATABASE_URL do Neon
npm install
npm run db:setup                    # migrations + seed (4 áreas, 37 processos, 10 ferramentas)
npm run dev                         # http://localhost:3333
```

Health-check: `GET http://localhost:3333/health`

### Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev                         # http://localhost:5173
```

Em desenvolvimento, o Vite faz proxy de `/api/*` para `http://localhost:3333` — não é necessário definir `VITE_API_URL`.

## Deploy

| Camada | Plataforma | Free? |
|---|---|---|
| Frontend (SPA Vite) | Vercel | Sim |
| Backend (API Node) | Render Web Service | Sim (instância dorme após 15 min idle) |
| Banco Postgres | Neon | Sim, sem prazo |

Cada `git push` no branch `main` dispara redeploys automáticos no Render e no Vercel. Configuração versionada em:

- [`frontend/vercel.json`](frontend/vercel.json) — rewrites SPA + build.
- [`backend/render.yaml`](backend/render.yaml) — Blueprint do Render.

Passo a passo completo em [DEPLOY.md](DEPLOY.md).

## API REST

Todas as rotas retornam JSON. Prefixo: `/api`.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/areas` | Lista áreas com contagem de processos |
| `POST` `PUT` `DELETE` | `/areas[/:id]` | CRUD de áreas |
| `GET` | `/processes?areaId=&tree=true` | Lista plana ou em árvore |
| `POST` `PUT` `DELETE` | `/processes[/:id]` | CRUD de processos (com vínculos N-N em transação) |
| `POST` `DELETE` | `/processes/:id/documents[/:docId]` | Documentos aninhados |
| `GET` `POST` `PUT` `DELETE` | `/tools` | CRUD de ferramentas |
| `GET` `POST` `PUT` `DELETE` | `/responsibles` | CRUD de responsáveis |
| `GET` | `/stats` | Métricas agregadas para o dashboard |

Erros do Prisma (`P2025`, `P2002`) e do Zod são traduzidos em respostas HTTP padronizadas pelo `errorHandler` central.

## Estrutura do repositório

```
case-processos/
├── README.md
├── DEPLOY.md
├── docs/
│   └── architecture.md
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── lib/        (prisma, asyncRoute, errorHandler)
│       └── routes/     (areas, processes, tools, responsibles, stats)
└── frontend/
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── lib/        (api, queries, meta, utils)
        ├── components/ (Layout, Modal, PageHeader, ConfirmDialog, processMap/...)
        └── pages/      (Dashboard, Areas, ProcessMap, Tools, Responsibles)
```

## Decisões técnicas

- **Neon + adapter WebSocket** em vez de conexão TCP tradicional, porque a rede de desenvolvimento bloqueia a porta 5432. O `@prisma/adapter-neon` tunela Postgres pela 443.
- **TanStack Query > Redux/Zustand** porque o estado relevante é majoritariamente remoto. Elimina boilerplate e bugs de sincronização.
- **Algoritmo próprio de layout em árvore** (em `frontend/src/components/processMap/layout.ts`) em vez de Dagre, porque o cálculo recursivo de altura por subárvore é mais simples, previsível e legível neste caso.
- **Tailwind + design tokens** evitando CSS-in-JS, mantendo bundle pequeno e estilo consistente.
- **Tipagem compartilhada** de `Process`, `Area`, `Tool` etc. no front, sem `any` no fluxo crítico.

---

**Autor:** Murilo Alvim — 2026
