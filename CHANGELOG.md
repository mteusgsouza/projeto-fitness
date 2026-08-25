# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/);
o projeto segue [SemVer](https://semver.org/lang/pt-BR/).

## [1.0.0] — 2026-08-24

Primeira versão completa: o ciclo inteiro do app funciona de ponta a ponta —
montar a ficha, executar o treino série a série, ver o histórico e acompanhar a
progressão de cada exercício. Está em produção na Vercel.

### Adicionado

- **Catálogo de exercícios** com 88 itens pré-cadastrados em 10 grupos
  musculares, cada um com equipamento, nível, descrição e músculos trabalhados.
  É o que torna a comparação de evolução possível.
- **Fichas por dia da semana**, uma por dia, editáveis conforme a evolução e com
  exercícios reordenáveis arrastando.
- **Execução série a série** com carga, medida e RPE independentes por série,
  pré-preenchida com a última sessão. Cada exercício recolhe, expande e é
  reordenável; só o que é marcado como feito entra no registro.
- **Histórico** por sessão, com detalhe série a série e esforço médio (RPE).
- **Página por exercício** (`/exercises/[id]`) com execução, músculos, seu
  histórico no movimento e a curva de progressão.
- **Perfil** com progressão por exercício, frequência semanal e há quanto tempo
  você treina.
- **Home com calendário mensal** dos dias treinados e o treino de hoje em
  destaque.
- **Medida em tempo** (`tracking`) para cardio e isometria — min/seg no lugar de
  repetições, distância em km opcional na esteira, bike, elíptico e remo, e
  progressão medida em tempo.
- **Configurações de aparência**: tema claro/escuro e cor de destaque.

### Alterado

- **Plano e execução separados no banco**: `SetLog` aponta para `Exercise`,
  nunca para `TrainingExercise`. Editar ou apagar uma ficha deixa o histórico
  intacto.
- **Carga é propriedade do exercício** (`usesLoad`): onde não se aplica, o campo
  não aparece — a variante com peso é outro item do catálogo.
- Redesign mobile-first: barra inferior fixa, seletores como drawer no celular,
  alvos de toque de 44px.
- Upgrade para **Next.js 16**, **Clerk 7 (Core 3)** e **Tailwind CSS 4**;
  `middleware.ts` virou `proxy.ts`.

### Removido

- **Volume somado de carga** (reps × kg) das telas de histórico. Quilos de
  exercícios diferentes não somam nada legível; no lugar entrou o esforço médio
  por RPE, que já nasce normalizado de 1 a 10.

## [0.1.0]

Versão inicial: autenticação com Clerk, CRUD de treinos e registro simples de
sessões.
