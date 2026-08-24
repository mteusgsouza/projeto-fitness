/**
 * Descrição de execução e músculos trabalhados, por nome de exercício.
 *
 * Fica separado do catálogo em seed.ts porque é conteúdo, não estrutura:
 * a lista de exercícios define o que existe, este arquivo define o que
 * cada um é. `muscles` vai do principal para os auxiliares, e é mais
 * específico que `muscleGroup` — que é só a gaveta do catálogo.
 */
export type ExerciseDetail = {
  muscles: string[]
  description: string
}

export const EXERCISE_DETAILS: Record<string, ExerciseDetail> = {
  // ---------- Peito ----------
  'Supino reto com barra': {
    muscles: ['peitoral maior', 'tríceps', 'deltoide anterior'],
    description: 'Deitado no banco, desça a barra até a linha do peito com os cotovelos a cerca de 45° do tronco e empurre até estender os braços, sem travar os ombros.',
  },
  'Supino inclinado com barra': {
    muscles: ['peitoral maior (porção superior)', 'deltoide anterior', 'tríceps'],
    description: 'No banco inclinado a 30–45°, desça a barra até a parte alta do peito e empurre. A inclinação desloca a ênfase para o feixe superior do peitoral.',
  },
  'Supino declinado com barra': {
    muscles: ['peitoral maior (porção inferior)', 'tríceps'],
    description: 'No banco declinado, desça a barra até a base do peito. Enfatiza a porção inferior do peitoral e alivia o ombro.',
  },
  'Supino reto com halteres': {
    muscles: ['peitoral maior', 'deltoide anterior', 'tríceps'],
    description: 'Com um halter em cada mão, desça até sentir alongamento no peito e junte na subida. Exige mais estabilização que a barra e corrige assimetrias.',
  },
  'Supino inclinado com halteres': {
    muscles: ['peitoral maior (porção superior)', 'deltoide anterior', 'tríceps'],
    description: 'Banco a 30–45°, halteres descendo ao lado do peito e subindo em leve convergência.',
  },
  'Crucifixo com halteres': {
    muscles: ['peitoral maior'],
    description: 'Deitado, braços quase estendidos, abra em arco até a altura do peito e feche como se abraçasse. Movimento de isolamento — carga baixa.',
  },
  'Crossover no cabo': {
    muscles: ['peitoral maior'],
    description: 'Em pé entre duas polias altas, traga as mãos à frente do corpo em arco, cruzando levemente. A tensão é constante em toda a amplitude.',
  },
  'Voador (peck deck)': {
    muscles: ['peitoral maior'],
    description: 'Sentado na máquina, feche os braços à frente controlando a volta. É a versão guiada do crucifixo, boa para quem está começando.',
  },
  'Flexão de braço': {
    muscles: ['peitoral maior', 'tríceps', 'core'],
    description: 'Mãos na largura dos ombros, corpo alinhado da cabeça aos pés. Desça até o peito quase tocar o chão e empurre sem deixar o quadril cair.',
  },
  'Flexão inclinada': {
    muscles: ['peitoral maior', 'tríceps'],
    description: 'Mãos apoiadas em banco ou step, o que reduz a carga sobre os braços. É a progressão de entrada para a flexão tradicional.',
  },
  'Mergulho em paralelas': {
    muscles: ['peitoral maior (porção inferior)', 'tríceps', 'deltoide anterior'],
    description: 'Suspenso nas barras, desça até os ombros ficarem na altura dos cotovelos. Tronco inclinado à frente enfatiza o peito; ereto, o tríceps.',
  },

  // ---------- Costas ----------
  'Barra fixa': {
    muscles: ['grande dorsal', 'bíceps', 'romboides'],
    description: 'Pegada pronada mais larga que os ombros, puxe até o queixo passar a barra sem balançar o corpo. Desça controlando até estender os braços.',
  },
  'Puxada frontal na polia': {
    muscles: ['grande dorsal', 'bíceps', 'romboides'],
    description: 'Sentado, puxe a barra até a parte alta do peito levando os cotovelos para baixo e para trás, sem jogar o tronco.',
  },
  'Puxada supinada': {
    muscles: ['grande dorsal', 'bíceps'],
    description: 'Mesma puxada, com as palmas voltadas para você. A pegada supinada aumenta a participação do bíceps.',
  },
  'Puxada com triângulo': {
    muscles: ['grande dorsal', 'bíceps', 'romboides'],
    description: 'Com o pegador triangular, puxe até o peito. A pegada neutra é mais confortável para punho e ombro.',
  },
  'Remada curvada com barra': {
    muscles: ['grande dorsal', 'romboides', 'trapézio', 'bíceps'],
    description: 'Tronco inclinado a cerca de 45°, coluna neutra, puxe a barra até o abdômen e desça controlando. Não use impulso de lombar.',
  },
  'Remada unilateral com halter': {
    muscles: ['grande dorsal', 'romboides', 'bíceps'],
    description: 'Um apoio no banco, puxe o halter em direção ao quadril mantendo o tronco estável, sem rodar a coluna.',
  },
  'Remada baixa no cabo': {
    muscles: ['grande dorsal', 'romboides', 'bíceps'],
    description: 'Sentado, puxe o pegador até o abdômen com o tronco firme. Boa opção para volume sem carga axial na coluna.',
  },
  'Remada cavalinho': {
    muscles: ['grande dorsal', 'trapézio', 'romboides'],
    description: 'Peito apoiado no suporte, puxe o peso em direção ao tronco. O apoio elimina o esforço de lombar.',
  },
  'Remada invertida (barra australiana)': {
    muscles: ['grande dorsal', 'romboides', 'bíceps', 'core'],
    description: 'Deitado sob uma barra baixa, corpo reto, puxe o peito até a barra. Quanto mais horizontal o corpo, mais difícil.',
  },
  'Levantamento terra': {
    muscles: ['eretores da espinha', 'glúteos', 'isquiotibiais', 'trapézio'],
    description: 'Barra junto às canelas, coluna neutra, empurre o chão estendendo quadril e joelhos ao mesmo tempo. Técnica antes de carga.',
  },
  'Pullover na polia': {
    muscles: ['grande dorsal', 'peitoral maior'],
    description: 'Em pé de frente para a polia alta, braços quase estendidos, leve a barra até as coxas em arco. Isola o dorsal sem envolver o bíceps.',
  },
  'Face pull': {
    muscles: ['deltoide posterior', 'trapézio', 'romboides'],
    description: 'Polia na altura do rosto, puxe a corda até a testa abrindo os cotovelos. Trabalha a postura e compensa o excesso de empurrar.',
  },

  // ---------- Pernas ----------
  'Agachamento livre': {
    muscles: ['quadríceps', 'glúteos', 'isquiotibiais', 'core'],
    description: 'Barra nas costas, pés na largura dos ombros. Desça levando o quadril para trás e para baixo, joelhos alinhados aos pés, e suba empurrando o chão.',
  },
  'Agachamento no Smith': {
    muscles: ['quadríceps', 'glúteos'],
    description: 'A barra guiada dispensa o equilíbrio, o que permite variar a posição dos pés para mudar a ênfase entre quadríceps e glúteo.',
  },
  'Agachamento sumô': {
    muscles: ['adutores', 'glúteos', 'quadríceps'],
    description: 'Pés bem afastados e pontas para fora, desça mantendo o tronco ereto. A abertura recruta mais adutor e glúteo.',
  },
  'Agachamento livre sem peso': {
    muscles: ['quadríceps', 'glúteos', 'core'],
    description: 'Mesmo padrão do agachamento, só com o peso do corpo. Serve para aprender o movimento e para aquecimento.',
  },
  'Agachamento hack': {
    muscles: ['quadríceps', 'glúteos'],
    description: 'Na máquina inclinada, com as costas apoiadas. Isola a perna com pouca demanda de estabilização.',
  },
  'Leg press 45': {
    muscles: ['quadríceps', 'glúteos', 'isquiotibiais'],
    description: 'Pés na plataforma na largura dos ombros, desça até cerca de 90° no joelho e empurre sem travar. Não deixe a lombar sair do apoio.',
  },
  'Cadeira extensora': {
    muscles: ['quadríceps'],
    description: 'Sentado, estenda os joelhos até quase travar e volte controlando. Isolamento puro de quadríceps.',
  },
  'Mesa flexora': {
    muscles: ['isquiotibiais'],
    description: 'De bruços, flexione os joelhos trazendo os pés ao glúteo, sem levantar o quadril do apoio.',
  },
  'Cadeira flexora': {
    muscles: ['isquiotibiais'],
    description: 'Sentado, puxe o apoio para baixo flexionando os joelhos. Alternativa à mesa flexora com menos tensão na lombar.',
  },
  'Stiff': {
    muscles: ['isquiotibiais', 'glúteos', 'eretores da espinha'],
    description: 'Pernas quase estendidas, desça a barra rente às pernas levando o quadril para trás. Pare quando a lombar começar a arredondar.',
  },
  'Afundo (avanço)': {
    muscles: ['quadríceps', 'glúteos', 'isquiotibiais'],
    description: 'Um passo à frente, desça até o joelho de trás quase tocar o chão e volte. Trabalha uma perna por vez e exige equilíbrio.',
  },
  'Passada (caminhada com afundo)': {
    muscles: ['quadríceps', 'glúteos', 'isquiotibiais', 'core'],
    description: 'Afundos alternados avançando pelo espaço. Soma o componente de deslocamento e eleva a demanda cardiovascular.',
  },
  'Agachamento búlgaro': {
    muscles: ['quadríceps', 'glúteos'],
    description: 'Pé de trás apoiado em banco, desça na perna da frente. É o unilateral mais exigente de perna — comece sem carga.',
  },
  'Panturrilha em pé': {
    muscles: ['gastrocnêmio', 'sóleo'],
    description: 'Suba nas pontas dos pés na maior amplitude possível e desça alongando. Amplitude importa mais que carga aqui.',
  },
  'Panturrilha sentado': {
    muscles: ['sóleo'],
    description: 'Sentado com os joelhos flexionados, o que tira o gastrocnêmio e isola o sóleo.',
  },
  'Cadeira adutora': {
    muscles: ['adutores'],
    description: 'Sentado, feche as pernas contra a resistência. Isola a face interna da coxa.',
  },
  'Cadeira abdutora': {
    muscles: ['glúteo médio', 'abdutores'],
    description: 'Sentado, abra as pernas contra a resistência. Trabalha o glúteo médio, importante para a estabilidade do quadril.',
  },

  // ---------- Glúteos ----------
  'Elevação pélvica (hip thrust)': {
    muscles: ['glúteo máximo', 'isquiotibiais'],
    description: 'Costas apoiadas no banco, barra sobre o quadril, suba até o tronco ficar paralelo ao chão e contraia o glúteo no topo.',
  },
  'Ponte de glúteo': {
    muscles: ['glúteo máximo', 'isquiotibiais'],
    description: 'Deitado de costas, pés apoiados, eleve o quadril até alinhar tronco e coxa. É a versão sem carga da elevação pélvica.',
  },
  'Coice no cabo': {
    muscles: ['glúteo máximo'],
    description: 'Preso ao tornozelo, estenda o quadril para trás sem arquear a lombar. Isolamento de glúteo com tensão constante.',
  },
  'Abdução de quadril com elástico': {
    muscles: ['glúteo médio'],
    description: 'Elástico acima dos joelhos, abra as pernas contra a resistência. Bom para ativar antes de agachar.',
  },

  // ---------- Ombros ----------
  'Desenvolvimento com barra': {
    muscles: ['deltoide anterior', 'deltoide lateral', 'tríceps'],
    description: 'Empurre a barra da altura do queixo até acima da cabeça sem arquear a lombar. Contraia o abdômen para estabilizar.',
  },
  'Desenvolvimento com halteres': {
    muscles: ['deltoide anterior', 'deltoide lateral', 'tríceps'],
    description: 'Halteres na altura dos ombros, empurre para cima em leve convergência. Mais amigável ao ombro que a barra.',
  },
  'Desenvolvimento Arnold': {
    muscles: ['deltoide anterior', 'deltoide lateral'],
    description: 'Comece com as palmas voltadas para você e rode os punhos enquanto empurra. A rotação amplia a amplitude do deltoide.',
  },
  'Elevação lateral': {
    muscles: ['deltoide lateral'],
    description: 'Braços ao lado do corpo, eleve até a altura dos ombros com leve flexão de cotovelo. Sem impulso de tronco — carga baixa.',
  },
  'Elevação lateral no cabo': {
    muscles: ['deltoide lateral'],
    description: 'Mesma elevação com polia baixa, que mantém tensão desde o início do movimento.',
  },
  'Elevação frontal': {
    muscles: ['deltoide anterior'],
    description: 'Eleve os braços à frente até a altura dos ombros. Costuma dispensar volume alto, já que o deltoide anterior trabalha em todo empurrar.',
  },
  'Crucifixo inverso': {
    muscles: ['deltoide posterior', 'romboides'],
    description: 'Tronco inclinado à frente, abra os braços para os lados. Trabalha a parte de trás do ombro, normalmente negligenciada.',
  },
  'Remada alta': {
    muscles: ['deltoide lateral', 'trapézio'],
    description: 'Puxe a barra rente ao corpo até a altura do peito, cotovelos acima dos punhos. Se incomodar o ombro, reduza a amplitude.',
  },
  'Encolhimento de ombros': {
    muscles: ['trapézio'],
    description: 'Eleve os ombros em direção às orelhas e desça controlando, sem rodar. Movimento curto por natureza.',
  },

  // ---------- Bíceps ----------
  'Rosca direta com barra': {
    muscles: ['bíceps braquial', 'braquiorradial'],
    description: 'Cotovelos junto ao tronco, flexione até a barra chegar perto dos ombros e desça controlando. Sem balançar o corpo.',
  },
  'Rosca alternada com halteres': {
    muscles: ['bíceps braquial'],
    description: 'Um braço por vez, com leve supinação do punho na subida. Alternar permite mais concentração por lado.',
  },
  'Rosca martelo': {
    muscles: ['braquial', 'braquiorradial', 'bíceps braquial'],
    description: 'Pegada neutra, como se segurasse um martelo. Enfatiza o braquial, que dá espessura ao braço.',
  },
  'Rosca scott': {
    muscles: ['bíceps braquial (porção curta)'],
    description: 'Braços apoiados no banco inclinado, o que elimina o impulso e isola o bíceps na parte final do movimento.',
  },
  'Rosca concentrada': {
    muscles: ['bíceps braquial'],
    description: 'Sentado, cotovelo apoiado na coxa, flexione um braço por vez. É o isolamento máximo de bíceps.',
  },
  'Rosca no cabo': {
    muscles: ['bíceps braquial'],
    description: 'Na polia baixa, a tensão é constante do início ao fim, diferente do halter que alivia no topo.',
  },
  'Rosca inversa': {
    muscles: ['braquiorradial', 'extensores do antebraço', 'bíceps braquial'],
    description: 'Pegada pronada (palmas para baixo). Trabalha o antebraço e a pegada junto com o braço.',
  },
  'Rosca 21': {
    muscles: ['bíceps braquial'],
    description: 'Sete repetições na metade de baixo, sete na de cima e sete completas. A parcialidade aumenta o tempo sob tensão.',
  },

  // ---------- Tríceps ----------
  'Tríceps testa': {
    muscles: ['tríceps braquial'],
    description: 'Deitado, desça a barra até perto da testa mantendo os cotovelos apontados para cima, e estenda sem abrir os braços.',
  },
  'Tríceps pulley com corda': {
    muscles: ['tríceps braquial'],
    description: 'Cotovelos junto ao corpo, estenda os braços e afaste as pontas da corda no final para contrair mais.',
  },
  'Tríceps francês': {
    muscles: ['tríceps braquial (cabeça longa)'],
    description: 'Halter acima da cabeça, desça atrás da nuca flexionando só o cotovelo. A posição alonga a cabeça longa do tríceps.',
  },
  'Tríceps coice': {
    muscles: ['tríceps braquial'],
    description: 'Tronco inclinado, braço junto ao corpo, estenda o cotovelo para trás. Carga baixa e controle alto.',
  },
  'Tríceps no banco': {
    muscles: ['tríceps braquial', 'deltoide anterior'],
    description: 'Mãos apoiadas no banco atrás do corpo, desça flexionando os cotovelos e empurre. Pés mais afastados deixa mais difícil.',
  },
  'Supino fechado': {
    muscles: ['tríceps braquial', 'peitoral maior'],
    description: 'Supino com as mãos na largura dos ombros, cotovelos junto ao tronco. Transfere a maior parte do esforço para o tríceps.',
  },
  'Tríceps unilateral no cabo': {
    muscles: ['tríceps braquial'],
    description: 'Um braço por vez na polia, o que expõe e corrige diferença de força entre os lados.',
  },

  // ---------- Antebraço ----------
  'Rosca de punho': {
    muscles: ['flexores do antebraço'],
    description: 'Antebraços apoiados, palmas para cima, flexione apenas os punhos. Amplitude curta e repetições altas.',
  },
  'Rosca de punho inversa': {
    muscles: ['extensores do antebraço'],
    description: 'Mesmo movimento com as palmas para baixo. Equilibra o trabalho de flexores e ajuda na saúde do cotovelo.',
  },

  // ---------- Core ----------
  'Abdominal supra': {
    muscles: ['reto abdominal'],
    description: 'Deitado, eleve o tronco enrolando a coluna sem puxar a cabeça com as mãos. Movimento curto e controlado.',
  },
  'Abdominal infra': {
    muscles: ['reto abdominal (porção inferior)', 'flexores do quadril'],
    description: 'Deitado, eleve as pernas trazendo o quadril do chão. Mantenha a lombar apoiada durante a descida.',
  },
  'Abdominal oblíquo': {
    muscles: ['oblíquos', 'reto abdominal'],
    description: 'Eleve o tronco levando o ombro em direção ao joelho oposto, trabalhando a rotação.',
  },
  'Abdominal bicicleta': {
    muscles: ['oblíquos', 'reto abdominal'],
    description: 'Pedale no ar alternando cotovelo e joelho opostos, sem apoiar os pés. Combina flexão e rotação.',
  },
  'Prancha isométrica': {
    muscles: ['core', 'reto abdominal', 'eretores da espinha'],
    description: 'Apoio nos antebraços e pontas dos pés, corpo em linha reta. Sustente sem deixar o quadril subir nem cair.',
  },
  'Prancha lateral': {
    muscles: ['oblíquos', 'glúteo médio'],
    description: 'De lado, apoio em um antebraço, quadril elevado e alinhado. Trabalha a estabilidade lateral do tronco.',
  },
  'Elevação de pernas suspenso': {
    muscles: ['reto abdominal (porção inferior)', 'flexores do quadril'],
    description: 'Pendurado na barra, eleve as pernas até a altura do quadril sem balançar. Exige também força de pegada.',
  },
  'Abdominal na roda': {
    muscles: ['reto abdominal', 'core', 'grande dorsal'],
    description: 'Role a roda à frente mantendo a lombar neutra e traga de volta com o abdômen. Avance a amplitude aos poucos.',
  },
  'Mountain climber': {
    muscles: ['core', 'flexores do quadril', 'ombros'],
    description: 'Na posição de prancha, alterne os joelhos em direção ao peito em ritmo constante. Trabalha core com componente cardiovascular.',
  },
  'Russian twist': {
    muscles: ['oblíquos', 'reto abdominal'],
    description: 'Sentado com o tronco inclinado para trás, rode de um lado ao outro levando o peso. O giro vem do tronco, não dos braços.',
  },

  // ---------- Cardio ----------
  'Esteira': {
    muscles: ['sistema cardiovascular', 'quadríceps', 'panturrilhas'],
    description: 'Caminhada ou corrida com velocidade e inclinação ajustáveis. A inclinação aumenta o esforço sem exigir mais velocidade.',
  },
  'Bicicleta ergométrica': {
    muscles: ['sistema cardiovascular', 'quadríceps', 'glúteos'],
    description: 'Pedalada sentada, de baixo impacto nas articulações. Boa escolha para volume aeróbico sem desgastar joelho e tornozelo.',
  },
  'Elíptico': {
    muscles: ['sistema cardiovascular', 'pernas', 'ombros'],
    description: 'Movimento contínuo sem impacto, envolvendo braços e pernas ao mesmo tempo.',
  },
  'Remo ergométrico': {
    muscles: ['sistema cardiovascular', 'grande dorsal', 'pernas', 'core'],
    description: 'A remada começa nas pernas, passa pelo tronco e termina nos braços. É o cardio que envolve mais massa muscular.',
  },
  'Pular corda': {
    muscles: ['sistema cardiovascular', 'panturrilhas', 'ombros'],
    description: 'Saltos curtos e contínuos, aterrissando na ponta dos pés. Alto retorno cardiovascular em pouco espaço.',
  },
  'Corda naval': {
    muscles: ['sistema cardiovascular', 'ombros', 'core'],
    description: 'Ondas alternadas ou simultâneas com as cordas, em séries curtas e intensas.',
  },
  'Simulador de escada': {
    muscles: ['sistema cardiovascular', 'glúteos', 'quadríceps'],
    description: 'Subida contínua de degraus. Exige mais de glúteo e coxa que a esteira na mesma percepção de esforço.',
  },
  'Burpee': {
    muscles: ['sistema cardiovascular', 'peitoral maior', 'quadríceps', 'core'],
    description: 'Agachar, prancha, flexão, voltar e saltar. Movimento de corpo inteiro com demanda cardiovascular alta.',
  },
}
