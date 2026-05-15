# Arquitetura — ProcessMap

Documento técnico complementar ao [README.md](../README.md).

## Visão em camadas (Mermaid)

```mermaid
flowchart LR
  subgraph Browser["🖥️ Navegador"]
    UI["React SPA<br/>(Vite + TS)"]
    RQ["TanStack Query<br/>(cache & sync)"]
    RF["React Flow<br/>(visualização)"]
    UI --> RQ
    UI --> RF
  end

  subgraph Server["⚙️ Backend Node.js"]
    EX["Express + Routers"]
    ZOD["Zod schemas<br/>(validação)"]
    PR["Prisma Client<br/>(type-safe ORM)"]
    EX --> ZOD --> PR
  end

  subgraph DB["💾 Persistência"]
    SQL["SQLite (dev)<br/>↔ trocável p/ Postgres"]
  end

  RQ -- "HTTP/JSON<br/>REST /api/*" --> EX
  PR --> SQL
```

## Modelo Entidade-Relacionamento

```mermaid
erDiagram
  AREA ||--o{ PROCESS : "contém"
  PROCESS ||--o{ PROCESS : "subprocessos (self-ref)"
  PROCESS }o--o{ TOOL : "ProcessTool"
  PROCESS }o--o{ RESPONSIBLE : "ProcessResponsible"
  PROCESS ||--o{ DOCUMENT : "documentação"

  AREA {
    string id PK
    string name UK
    string description
    string color
    string icon
  }
  PROCESS {
    string id PK
    string name
    string description
    string type "system | manual | hybrid"
    string status "active | draft | deprecated"
    string priority "low | medium | high | critical"
    int order
    string areaId FK
    string parentId FK "self-ref"
  }
  TOOL {
    string id PK
    string name UK
    string type
    string url
    string description
  }
  RESPONSIBLE {
    string id PK
    string name
    string email
    string role
    string team
  }
  DOCUMENT {
    string id PK
    string title
    string url
    string type
    string processId FK
  }
```

## Fluxo de criação de subprocesso

```mermaid
sequenceDiagram
  participant U as Usuário
  participant FE as Frontend (React)
  participant BE as Backend (Express)
  participant DB as SQLite

  U->>FE: Clica no "+" do nó pai
  FE->>FE: Abre ProcessForm com parentId pré-preenchido
  U->>FE: Preenche dados + seleciona tools/responsáveis
  FE->>BE: POST /api/processes (JSON validado)
  BE->>BE: Zod valida payload
  BE->>DB: BEGIN TRANSACTION
  BE->>DB: INSERT Process
  BE->>DB: INSERT ProcessTool (N-N)
  BE->>DB: INSERT ProcessResponsible (N-N)
  BE->>DB: COMMIT
  BE-->>FE: 201 Created (Process completo)
  FE->>FE: TanStack Query invalida cache "processes"
  FE->>BE: GET /api/processes?tree=true (refetch)
  BE-->>FE: Nova árvore
  FE->>FE: layoutTree() recalcula posições
  FE-->>U: Mapa atualizado com o novo nó
```

## Algoritmo de layout (árvore)

Implementação em [`frontend/src/components/processMap/layout.ts`](../frontend/src/components/processMap/layout.ts).

**Pseudocódigo:**

```
function measure(node):
  if node.children == empty:
    return NODE_HEIGHT
  return sum(measure(child) + V_GAP) - V_GAP

function place(node, depth, yStart):
  height = measure(node)
  position = (depth * (NODE_WIDTH + H_GAP), yStart + height/2 - NODE_HEIGHT/2)
  emit(node, position)
  childY = yStart
  for child in node.children:
    place(child, depth + 1, childY)
    emit(edge: node → child)
    childY += measure(child) + V_GAP
```

Complexidade: **O(n)** com `n = total de nós`. Sem dependência externa
(Dagre/Elk) — a árvore tem topologia previsível, então um cálculo recursivo
em pós-ordem é suficiente e legível.

## Decisões de design

| Tópico | Decisão | Motivação |
|---|---|---|
| Estado servidor | TanStack Query | Cache automático, invalidação por chave, refetch transparente |
| Hierarquia | Auto-referência (`parentId`) | Suporta árvores ilimitadas sem JOIN dinâmico |
| Transação em update | `prisma.$transaction` | Vínculos N-N precisam ser atômicos |
| Validação dupla | Zod (server) + form state (client) | Server é fonte de verdade; client melhora UX |
| Estilo | Tailwind com tokens custom | Sem CSS-in-JS runtime, bundle menor |
| Visualização | React Flow + nó custom | Handles nativos, MiniMap, edges customizáveis |
| Layout | Algoritmo próprio | Sem peso extra de Dagre/Elk |
| Cores semânticas | `meta.ts` central | Mudanças de paleta em 1 arquivo |
