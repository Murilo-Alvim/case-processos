# Guia de Deploy — ProcessMap

Stack escolhida (tudo no plano gratuito, sem cartão de crédito obrigatório):

| Camada | Plataforma | Por quê |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Build do Vite em segundos, CDN global, free generoso |
| **Backend** | [Render](https://render.com) | Free Web Service Node nativo, `prisma migrate deploy` no boot |
| **Banco** | [Neon](https://neon.tech) | Postgres serverless free, **sem prazo**, sem cartão |

> ⚠️ O free tier do Render "dorme" após 15 min sem requests e demora ~30s para
> acordar. Isso é normal — para a apresentação do case, basta abrir a URL do
> backend ~1 min antes para esquentar.

---

## Pré-requisito: criar repositório no GitHub

Na raiz do projeto:

```powershell
git init
git add .
git commit -m "feat: ProcessMap full-stack"
git branch -M main
# crie um repo vazio em github.com/new (sem README), depois:
git remote add origin https://github.com/SEU_USUARIO/case-processos.git
git push -u origin main
```

---

## Passo 1 · Banco no Neon (3 min)

1. Acesse https://console.neon.tech e faça login (GitHub funciona).
2. **Create Project** → nome `processmap` → região mais próxima (us-east-2 funciona bem).
3. Copie a **Connection String** (formato `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require`).
   - Use a opção **Pooled connection** (porta `5432`, host com `-pooler`).
4. Guarde essa string — vai colar no Render no próximo passo.

## Passo 2 · Backend no Render (5 min)

### Opção A — Blueprint automático (recomendado)
1. Acesse https://dashboard.render.com → **New +** → **Blueprint**.
2. Conecte o repositório do GitHub.
3. Render detecta o `backend/render.yaml` automaticamente.
4. Antes de aplicar, ele pede as duas envs marcadas como `sync: false`:
   - `DATABASE_URL` = a connection string do Neon
   - `ALLOWED_ORIGINS` = deixe `*` por enquanto (preenche depois com a URL do Vercel)
5. Clique **Apply** — o primeiro build leva ~3 min.

### Opção B — manual
1. **New +** → **Web Service** → conecte o repo.
2. Configurações:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
3. Variáveis de ambiente (aba **Environment**):
   - `DATABASE_URL` = string do Neon
   - `NODE_ENV` = `production`
   - `ALLOWED_ORIGINS` = (deixe vazio temporariamente)
4. Salve e dispare o deploy.

Ao final você terá uma URL do tipo `https://processmap-api-xxxx.onrender.com`.
Teste: `https://processmap-api-xxxx.onrender.com/health`

### Popular o banco (uma vez só)
No painel do Render → seu serviço → aba **Shell**:

```bash
npm run db:seed:prod
```

Isso cria as 4 áreas, 37 processos, 10 ferramentas e 6 responsáveis de exemplo.

## Passo 3 · Frontend no Vercel (3 min)

1. Acesse https://vercel.com/new e importe o repositório.
2. **Root Directory:** `frontend`
3. Framework detection: **Vite** (automático graças ao `vercel.json`).
4. **Environment Variables** (aba antes de fazer deploy):
   - `VITE_API_URL` = `https://processmap-api-xxxx.onrender.com` (URL do Render do passo 2, **sem `/api` no final**)
5. **Deploy**.

Em ~40 segundos você tem a URL `https://case-processos-xxxx.vercel.app`.

## Passo 4 · Fechar o CORS (recomendado)

Agora que você tem a URL pública do Vercel, volte ao Render → seu serviço → **Environment**:

- `ALLOWED_ORIGINS` = `https://case-processos-xxxx.vercel.app`

Salve. Render reinicia o serviço sozinho (~30s).

---

## Estrutura das migrações Prisma

O backend usa `prisma migrate deploy` no `start`, então as migrações **devem estar
versionadas no Git** (pasta `backend/prisma/migrations/`).

Para gerar a migração inicial localmente antes do primeiro push:

```powershell
cd backend
# .env precisa apontar para o Neon (ou outro Postgres)
npx prisma migrate dev --name init
git add prisma/migrations
git commit -m "chore: prisma init migration"
git push
```

A partir daí, todo `git push` para `main` dispara redeploys no Render e no Vercel.

---

## Custos & limites

| Recurso | Free tier | Quando vira pago |
|---|---|---|
| Vercel Hobby | 100 GB-mês de tráfego, build ilimitado | Tráfego comercial / time |
| Render Free | 750 h-mês de runtime, dorme após 15 min idle | Se quiser sem dormir → $7/mês (Starter) |
| Neon Free | 0.5 GB storage, 191h compute/mês | Mais que suficiente para o case |

---

## Checklist final antes da apresentação

- [ ] `https://...render.com/health` retorna `{"status":"ok"}`
- [ ] Front no Vercel abre e mostra os 4 cards do Dashboard
- [ ] Página **Mapa de Processos** renderiza a árvore (área "Pessoas" tem mais nós)
- [ ] Criar uma área → ela aparece (testa o ciclo POST → invalidate → refetch)
- [ ] `ALLOWED_ORIGINS` está restringindo só ao domínio do Vercel
- [ ] Abrir a API uns ~30s antes da apresentação pra "acordar" o Render

---

## Troubleshooting

**Frontend mostra "Erro de comunicação com a API"**
→ Veja a aba Network: se mostra `CORS error`, atualize `ALLOWED_ORIGINS` no Render.
→ Se mostra `connection refused`, o Render pode estar dormindo (espere 30s) ou `VITE_API_URL` está errado.

**Build no Render falha com `Can't reach database server`**
→ A `DATABASE_URL` do Neon expirou ou está sem `?sslmode=require`.

**Erro do Prisma `P3009: migrate found failed migrations`**
→ Você editou migrations à mão. Solução: no Render Shell, `npx prisma migrate resolve --rolled-back NOME_DA_MIGRATION`.
