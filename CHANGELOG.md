# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/);
o projeto segue [SemVer](https://semver.org/lang/pt-BR/).

## [1.2.0] — 2026-08-25

O app passa a convidar para a instalação e a abrir sem rede.

### Adicionado

- **Convite de instalação dentro do app.** Nenhum navegador sugere instalar
  sozinho — o banner automático do Chrome saiu na versão 76, e o Safari nunca
  teve API de instalação. Agora o próprio app captura `beforeinstallprompt` e
  mostra um convite dispensável, que não volta depois de recusado (volta se o
  app for instalado e removido).
- **Service worker** (`public/sw.js`) com cache da casca: estático versionado
  do Next e ícones. Além do offline, ele é o que destrava o convite acima — o
  Chrome só dispara `beforeinstallprompt` em página controlada por um service
  worker com fetch handler.
- **Tela `/offline`**, servida quando uma navegação falha por falta de rede, no
  lugar do erro do navegador.

### Notas

- **Offline abre o app, não os seus dados.** Fichas e histórico são
  renderizados no servidor a cada visita; sem rede, o que aparece é a tela de
  `/offline`. Guardar esse HTML em cache gravaria dados pessoais no aparelho e
  serviria uma versão velha na visita seguinte, então o service worker não
  cacheia página autenticada. Consultar treino offline exigiria replicar os
  dados no cliente e sincronizar — outra empreitada.
- No **iOS não há convite**: o Safari não expõe nenhuma API de instalação. Lá o
  caminho continua sendo Compartilhar › Adicionar à Tela de Início.

## [1.1.0] — 2026-08-25

O app passa a ser instalável na tela de início, com marca própria, e a cor de
destaque deixa de brigar com o fundo.

### Adicionado

- **PWA instalável**: manifest com `display: standalone`, ícones em 192 e 512
  (mais as variantes `maskable`, que o Android recorta em círculo sem cortar o
  desenho), apple touch icon e `appleWebApp.capable` — sem esse último o iOS
  abre o atalho dentro do Safari, com barra de endereço e tudo. Atalhos de
  toque longo para "Treinar agora" e "Meus treinos".
- **Marca própria**: prancheta de ficha com halter, em traço no padrão Lucide.
  Uma geometria só serve o ícone instalado e a marca dentro do app; como ela é
  pintada em `currentColor`, acompanha tema e cor de destaque sem precisar de
  uma variante por tema. Aparece no cabeçalho (mobile e desktop) e no rodapé.
- **Rodapé de crédito** no desktop, com autoria, ano e link do GitHub. Fica
  oculto no mobile, onde a barra inferior e o botão central ocupam essa faixa.

### Corrigido

- **A base neutra seguia presa no verde ao trocar a cor de destaque.** Fundo,
  cartão, borda, texto e malha estavam cravados no matiz 160, e os blocos de
  destaque só trocavam `--primary`, `--accent` e `--ring` — então escolher
  magenta ou âmbar dava botão colorido sobre uma base esverdeada. Agora o
  matiz da base é uma variável (`--base-h`) que cada destaque define, e o
  conjunto muda junto. Lima continua em 160, então o tema original não mudou.
- **O texto dos botões de destaque saía verde-escuro em qualquer cor**, porque
  `--primary-foreground` estava fixo em `160 39% 5%` nos blocos do tema escuro.

### Removido

- `favicon.ico` do scaffold do Next, que sobrescrevia a marca nova na aba.

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
