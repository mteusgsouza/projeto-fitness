# Projeto Fitness

Aplicação web para montar fichas de treino de academia, registrar o que foi realmente executado em cada série e acompanhar a evolução ao longo do tempo.

Construído com Next.js (App Router), autenticação via Clerk e persistência em PostgreSQL com Prisma.

---

## O que o app faz

### Autenticação
- Cadastro e login via **Clerk**, com telas em `/sign-in` e `/sign-up` e interface traduzida para português (`@clerk/localizations`).
- Menu de conta (`UserButton`) no cabeçalho, com logout e gerenciamento de perfil.
- As rotas `/`, `/training/*`, `/history/*`, `/workout/*`, `/profile`, `/exercises` e `/settings` são protegidas no `proxy.ts`.
- Na primeira visita, o usuário do Clerk é espelhado na tabela `User` via upsert.

### Catálogo de exercícios
- **88 exercícios pré-cadastrados** pelo seed, em 10 grupos musculares (peito, costas, pernas, glúteos, ombros, bíceps, tríceps, antebraço, core, cardio), cada um com equipamento e nível (iniciante/intermediário/avançado).
- Cada exercício tem **página própria** em `/exercises/[id]`: como executar, músculos trabalhados (do principal para os auxiliares), nível, equipamento e o seu histórico naquele movimento — sessões, recorde e última vez. O recorde respeita a carga: kg para quem usa, repetições para peso corporal.
- **Carga é propriedade do exercício** (`usesLoad`): 62 usam carga externa, 26 não (peso corporal e cardio). Nos que não usam, o campo de carga nem aparece — carga ali é "não se aplica", não zero. A variante com peso é outro item do catálogo: *Agachamento livre sem peso* e *Agachamento livre* (barra) são exercícios distintos.
- O catálogo é global (`userId` nulo); a mesma tabela aceita exercícios personalizados por usuário.
- É o que torna a comparação de evolução possível: "Rosca direta" é sempre a mesma entidade, em vez de texto livre digitado de formas diferentes.

### Fichas de treino
- **Uma ficha por dia da semana**, garantido por constraint no banco. Dias já ocupados aparecem desabilitados no formulário.
- Cada exercício da ficha tem séries, repetições e carga alvo opcional.
- Cadastrar (`/training/create`), editar (`/training/update/[id]`) e excluir, com lista dinâmica de exercícios.
- Validação com **Zod** em schema compartilhado entre cliente e servidor.

### Execução do treino
- `/workout/[trainingId]` registra o treino **série a série**: carga, repetições e RPE (esforço percebido, 1–10) independentes por série.
- Os campos vêm **pré-preenchidos com a última sessão** daquele exercício — ou com a prescrição da ficha, se for a primeira vez.
- A prescrição é valor inicial, não trava: dá para mudar a carga só da última série, adicionar séries além do previsto ou parar antes.
- Permite **lançamento retroativo** (data e hora editáveis) e observações.
- Se a carga executada divergir da ficha, o app oferece atualizar a prescrição no fim da sessão.

### Histórico
- `/history` lista as sessões com data, número de exercícios e séries. Não há volume somado: quilos de exercícios diferentes não se somam em nada legível — 14 t de perna e 3 t de peito não são comparáveis, e nenhum dos dois diz se o treino foi bom.
- `/history/[sessionId]` mostra o detalhe série a série, com carga, reps e RPE.
- Excluir uma sessão não afeta a ficha.

### Home: calendário
- **Treino de hoje** em destaque, com atalho para começar — a ação mais provável ao abrir o app.
- **Calendário mensal** marcando os dias treinados, navegável entre meses (um ponto por sessão, então dois treinos no mesmo dia aparecem).
- Últimas atividades e as fichas cadastradas.

### Perfil: evolução
- **Progressão por exercício**, com seletor, recorde e variação desde o primeiro registro. Exercício com carga progride em **kg**; peso corporal e cardio progridem em **repetições**.
- **Frequência** por semana nas últimas 12 semanas (semanas sem treino aparecem como zero, para o gráfico não mentir).
- Atalhos para o catálogo de exercícios e as configurações.

### Interface
- **Mobile primeiro**: barra inferior fixa com indicação de página ativa e botão de ação em destaque; no desktop, navegação no topo.
- **Seletores viram drawer no mobile** (bottom sheet do Vaul) e modal no desktop, com busca que ignora acentos — "triceps" acha "Tríceps".
- Campos de toque com 44px de altura e sem setas em `input[type=number]`, para digitar carga rápido na academia.
- **Tema claro/escuro** com paleta esmeralda própria e detecção da preferência do sistema (`next-themes`).
- Componentes **shadcn/ui** sobre Radix UI, ícones Lucide, notificações via Sonner.

---

## Como o modelo de dados funciona

A decisão central é separar **plano** de **execução**:

```
Exercise          catálogo, estável (nome, grupo muscular, equipamento, nível)
  ↑                    ↑
TrainingExercise   SetLog          ← execução aponta pro catálogo, não pra ficha
  ↑                    ↑
Training           WorkoutSession
(ficha do dia)     (sessão realizada)
```

`SetLog` referencia `Exercise`, **nunca** `TrainingExercise`. Isso é o que mantém o histórico intacto quando a ficha é editada — e editar é frequente, já que a ficha muda conforme a evolução. Como `updateTraining` apaga e recria as linhas da prescrição, qualquer histórico preso a elas seria perdido a cada ajuste.

Pelo mesmo motivo, `WorkoutSession.trainingId` é opcional com `SetNull` e a sessão guarda um snapshot do nome em `trainingLabel`: apagar uma ficha não apaga meses de dados de execução.

**Exemplo:** a ficha prescreve rosca direta 3×10 @ 15kg. A execução registra 10@15kg, 10@15kg e 8@12kg com RPE 9 — três linhas distintas em `SetLog`. O gráfico de progressão usa a carga **máxima** da sessão (15kg), não a última série, que costuma cair por fadiga.

---

## Status do projeto

Limitações conhecidas:

| Item | Situação |
|---|---|
| Descanso entre séries | Não há cronômetro nem registro do tempo de descanso. |
| Exercícios isométricos | Prancha e similares são gravados em `reps`, mas na prática a medida é tempo. O schema não tem noção de duração, então 3×45 ali significa 45 segundos por convenção, não por modelo. |
| Descrições dos exercícios | Escritas com base em prática comum de academia, sem revisão de profissional de educação física. Servem de referência, não de prescrição. |
| Volume no detalhe da sessão | O card de volume somado saiu da listagem e das últimas atividades, mas segue no detalhe de cada sessão — mesma métrica, mesma ressalva. |
| Metas e periodização | Não há definição de meta de carga nem sugestão automática de progressão. |
| Medidas corporais | Só treino é registrado — sem peso corporal, medidas ou fotos. |
| `createRouteMatcher` | Depreciado no Clerk 7: a recomendação passou a ser checar autorização em cada página/rota em vez de casar caminhos no proxy. Funciona hoje, mas sai no próximo major. |
| Exercícios personalizados | O schema já suporta (`Exercise.userId`), mas ainda não há tela para criar. |
| Bundle da home | Os gráficos levam a home a ~314 kB de First Load JS. Um `dynamic()` no recharts resolveria. |
| `footer.tsx` | O componente existe, mas está comentado no `main-layout`. |
| Componentes shadcn sem uso | Alguns arquivos em `components/ui/` não são importados por ninguém, e os pacotes Radix correspondentes seguem no `package.json`. |
| Testes | O projeto não tem testes automatizados. |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.3 (App Router, Server Actions, Turbopack) |
| Linguagem | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Radix UI, Vaul, Lucide, Sonner |
| Gráficos | Recharts 2 (via shadcn/chart) |
| Autenticação | Clerk 7 (Core 3) |
| Banco | PostgreSQL (Neon) via Prisma 6 |
| Formulários | React Hook Form + Zod |
| Datas | date-fns (locale pt-BR) |
| Deploy | Vercel |

---

## Rodando localmente

### Pré-requisitos

- **Node.js 20+**
- **pnpm** — o projeto é padronizado em pnpm (versão fixada em `packageManager` no `package.json`)
- Uma conta no [Clerk](https://clerk.com) e um banco **PostgreSQL** acessível

### 1. Clonar e instalar

```bash
git clone https://github.com/mteusgsouza/projeto-fitness.git
cd projeto-fitness
pnpm install
```

> O `postinstall` roda `prisma generate && prisma migrate deploy`. O `migrate deploy` **aplica migrations no banco apontado por `DATABASE_URL`** — configure o `.env.local` antes, ou instale com `pnpm install --ignore-scripts` e rode os comandos do Prisma manualmente depois.

### 2. Variáveis de ambiente

Crie um `.env.local` na raiz:

```bash
# Clerk — copie do dashboard em API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# PostgreSQL
DATABASE_URL=postgres://usuario:senha@host/banco?sslmode=require
```

### 3. Preparar o banco

```bash
pnpm exec prisma migrate deploy
```

Popule o catálogo de exercícios (idempotente — pode rodar quantas vezes quiser):

```bash
pnpm exec prisma db seed
```

### 4. Subir o servidor

```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000).

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|:---:|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | sim | Chave pública do Clerk (`pk_test_` em dev, `pk_live_` em produção) |
| `CLERK_SECRET_KEY` | sim | Chave secreta do Clerk. Nunca comitar |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | sim | Caminho da tela de login — `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | sim | Caminho da tela de cadastro — `/sign-up` |
| `DATABASE_URL` | sim | String de conexão PostgreSQL usada pelo Prisma |

Os arquivos `.env*` estão no `.gitignore` e **não vão junto no deploy** — em produção, as variáveis precisam ser cadastradas no painel da Vercel.

---

## Scripts

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento com Turbopack |
| `pnpm build` | Build de produção |
| `pnpm start` | Sobe o build de produção |
| `pnpm lint` | ESLint (flat config; `next lint` foi removido no Next 16) |
| `pnpm exec prisma db seed` | Popula o catálogo de exercícios |

---

## Estrutura

```
prisma/
  schema.prisma          User, Exercise, Training, TrainingExercise,
                         WorkoutSession, SetLog
  seed.ts                catálogo global de exercícios (idempotente)
  exercise-details.ts    descrição e músculos de cada exercício
  migrations/
src/
  proxy.ts               Clerk - protege as rotas autenticadas
  actions/
    training/            CRUD da ficha + validação Zod compartilhada
    workout/             createWorkoutSession, deleteWorkoutSession,
                         syncPrescriptionWeights
    stats/               agregações para os gráficos
  app/
    layout.tsx           ClerkProvider + ThemeProvider
    page.tsx             Home: treino de hoje + calendario
    (auth)/              sign-in, sign-up
    training/            listagem, create, update/[id], delete-dialog
    workout/[trainingId] execução série a série
    history/             listagem, [sessionId], create (escolha da ficha)
    profile/             evolucao por exercicio e atalhos
    exercises/           catálogo e [id] com o detalhe de cada exercício
    settings/            tema e cor de destaque
  components/
    ui/                  shadcn/ui
    charts/              gráficos em Recharts
    picker.tsx           seletor: drawer no mobile, dialog no desktop
    training-calendar.tsx calendario mensal da home
    header, bottom-nav, page-header, header-title, treinos, ...
  lib/
    db.ts                singleton do Prisma Client
    training-day.ts      dias da semana
    exercise.ts          grupos musculares e agrupamento do catálogo
    workout.ts           volume e formatação de datas
    nav.ts               destinos e regra de item ativo
```

### Modelos

- **User** — espelha o usuário do Clerk (o `id` é o ID do Clerk).
- **Exercise** — catálogo. `userId` nulo = global; preenchido = personalizado. `usesLoad` diz se usa carga externa; `description` e `muscles` alimentam a página do exercício.
- **Training** — a ficha de um dia da semana. Único por `[userId, trainingDay]`.
- **TrainingExercise** — a prescrição: qual exercício, quantas séries/reps, carga alvo.
- **WorkoutSession** — uma sessão realizada, com data e snapshot do nome da ficha.
- **SetLog** — uma linha por série executada: carga, reps e RPE.

### Migrations

O histórico começa com `20241215212752_first`. A migration `20250101000000_add_training_day_and_sets` existe para corrigir um drift: `Training.trainingDay` e `TrainingMenu.sets` tinham sido aplicadas com `prisma db push`, sem migration correspondente. Ela usa `ADD COLUMN IF NOT EXISTS` — no-op em bancos que já têm as colunas, correta em um banco novo.

Como `postinstall` roda `prisma migrate deploy`, toda migration é aplicada automaticamente no build da Vercel.

### Convenções do Next 16

O `middleware.ts` foi renomeado para `proxy.ts` — no Next 16 essa é a convenção, e o build acusa depreciação se o nome antigo for usado. O `AGENTS.md` e o `CLAUDE.md` na raiz são gerados automaticamente pelo Next; para desligar, use `agentRules: false` no `next.config.ts`.

---

## Deploy na Vercel

1. Importe o repositório na Vercel — o framework é detectado automaticamente.
2. Cadastre todas as variáveis da tabela acima em **Settings → Environment Variables**, marcando o ambiente **Production**.
3. Faça um **Redeploy** depois de salvar: variáveis de ambiente só valem em deploys novos.
4. Rode o seed uma vez contra o banco de produção para popular o catálogo.

Dois pontos que costumam causar erro 500 em produção:

- **Variável faltando.** O middleware do Clerk roda antes de qualquer página; sem `CLERK_SECRET_KEY` ou `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` ele lança exceção e a Vercel devolve *"This Routing Middleware has crashed"* em todas as rotas. O erro real aparece em **Logs → Runtime Logs**.
- **Chaves de desenvolvimento em produção.** Chaves `pk_test_`/`sk_test_` pertencem a uma instância de desenvolvimento do Clerk, que tem limite de requisições baixo e não é suportada em domínio de produção. Para um deploy público, crie uma *Production instance* no Clerk e use as chaves `pk_live_`/`sk_live_`.
