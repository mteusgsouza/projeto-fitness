import { PrismaClient } from '@prisma/client'
import { EXERCISE_DETAILS } from './exercise-details'

const prisma = new PrismaClient()

type CatalogExercise = {
  name: string
  muscleGroup: string
  equipment: string
  level: string
}

/**
 * Exercicios medidos em tempo, nao em repeticoes. Nao da para deduzir do
 * grupo: burpee e cardio mas conta repeticao, e prancha e core mas conta
 * tempo. Por isso a lista e explicita.
 */
const POR_DURACAO = new Set([
  'Esteira', 'Bicicleta ergométrica', 'Elíptico', 'Remo ergométrico',
  'Simulador de escada', 'Corda naval', 'Pular corda',
  'Prancha isométrica', 'Prancha lateral',
])

/** Onde distancia faz sentido. Corda naval e prancha tem tempo, nao km. */
const COM_DISTANCIA = new Set([
  'Esteira', 'Bicicleta ergométrica', 'Elíptico', 'Remo ergométrico',
])

/**
 * Carga externa nao se aplica a peso corporal nem a cardio. Nesses casos o
 * campo de carga some do formulario e o exercicio fica fora da progressao de
 * peso — a variante com carga e outro item do catalogo (agachamento livre
 * sem peso vs. agachamento livre com barra).
 */
function usesLoad(exercise: CatalogExercise) {
  if (exercise.muscleGroup === 'cardio') return false
  if (exercise.equipment === 'peso-corporal') return false
  return true
}

/**
 * Catálogo global de exercícios (userId = null).
 * Exercícios criados por usuários ficam na mesma tabela, com userId preenchido.
 */
const catalog: CatalogExercise[] = [
  // Peito
  { name: 'Supino reto com barra', muscleGroup: 'peito', equipment: 'barra', level: 'intermediario' },
  { name: 'Supino inclinado com barra', muscleGroup: 'peito', equipment: 'barra', level: 'intermediario' },
  { name: 'Supino reto com halteres', muscleGroup: 'peito', equipment: 'halter', level: 'iniciante' },
  { name: 'Supino inclinado com halteres', muscleGroup: 'peito', equipment: 'halter', level: 'intermediario' },
  { name: 'Crucifixo com halteres', muscleGroup: 'peito', equipment: 'halter', level: 'iniciante' },
  { name: 'Crossover no cabo', muscleGroup: 'peito', equipment: 'cabo', level: 'intermediario' },
  { name: 'Voador (peck deck)', muscleGroup: 'peito', equipment: 'maquina', level: 'iniciante' },
  { name: 'Flexão de braço', muscleGroup: 'peito', equipment: 'peso-corporal', level: 'iniciante' },
  { name: 'Mergulho em paralelas', muscleGroup: 'peito', equipment: 'peso-corporal', level: 'avancado' },
  { name: 'Supino declinado com barra', muscleGroup: 'peito', equipment: 'barra', level: 'intermediario' },
  { name: 'Flexão inclinada', muscleGroup: 'peito', equipment: 'peso-corporal', level: 'iniciante' },

  // Costas
  { name: 'Barra fixa', muscleGroup: 'costas', equipment: 'peso-corporal', level: 'avancado' },
  { name: 'Puxada frontal na polia', muscleGroup: 'costas', equipment: 'cabo', level: 'iniciante' },
  { name: 'Puxada com triângulo', muscleGroup: 'costas', equipment: 'cabo', level: 'iniciante' },
  { name: 'Remada curvada com barra', muscleGroup: 'costas', equipment: 'barra', level: 'intermediario' },
  { name: 'Remada unilateral com halter', muscleGroup: 'costas', equipment: 'halter', level: 'iniciante' },
  { name: 'Remada baixa no cabo', muscleGroup: 'costas', equipment: 'cabo', level: 'iniciante' },
  { name: 'Remada cavalinho', muscleGroup: 'costas', equipment: 'maquina', level: 'intermediario' },
  { name: 'Levantamento terra', muscleGroup: 'costas', equipment: 'barra', level: 'avancado' },
  { name: 'Pullover na polia', muscleGroup: 'costas', equipment: 'cabo', level: 'intermediario' },
  { name: 'Puxada supinada', muscleGroup: 'costas', equipment: 'cabo', level: 'iniciante' },
  { name: 'Remada invertida (barra australiana)', muscleGroup: 'costas', equipment: 'peso-corporal', level: 'iniciante' },
  { name: 'Face pull', muscleGroup: 'costas', equipment: 'cabo', level: 'iniciante' },

  // Pernas
  { name: 'Agachamento livre', muscleGroup: 'pernas', equipment: 'barra', level: 'avancado' },
  { name: 'Agachamento no Smith', muscleGroup: 'pernas', equipment: 'maquina', level: 'intermediario' },
  { name: 'Agachamento sumô', muscleGroup: 'pernas', equipment: 'halter', level: 'intermediario' },
  { name: 'Agachamento livre sem peso', muscleGroup: 'pernas', equipment: 'peso-corporal', level: 'iniciante' },
  { name: 'Leg press 45', muscleGroup: 'pernas', equipment: 'maquina', level: 'iniciante' },
  { name: 'Cadeira extensora', muscleGroup: 'pernas', equipment: 'maquina', level: 'iniciante' },
  { name: 'Mesa flexora', muscleGroup: 'pernas', equipment: 'maquina', level: 'iniciante' },
  { name: 'Cadeira flexora', muscleGroup: 'pernas', equipment: 'maquina', level: 'iniciante' },
  { name: 'Stiff', muscleGroup: 'pernas', equipment: 'barra', level: 'intermediario' },
  { name: 'Afundo (avanço)', muscleGroup: 'pernas', equipment: 'halter', level: 'intermediario' },
  { name: 'Agachamento búlgaro', muscleGroup: 'pernas', equipment: 'halter', level: 'avancado' },
  { name: 'Panturrilha em pé', muscleGroup: 'pernas', equipment: 'maquina', level: 'iniciante' },
  { name: 'Panturrilha sentado', muscleGroup: 'pernas', equipment: 'maquina', level: 'iniciante' },
  { name: 'Cadeira adutora', muscleGroup: 'pernas', equipment: 'maquina', level: 'iniciante' },
  { name: 'Cadeira abdutora', muscleGroup: 'pernas', equipment: 'maquina', level: 'iniciante' },
  { name: 'Agachamento hack', muscleGroup: 'pernas', equipment: 'maquina', level: 'intermediario' },
  { name: 'Passada (caminhada com afundo)', muscleGroup: 'pernas', equipment: 'halter', level: 'intermediario' },

  // Glúteos
  { name: 'Elevação pélvica (hip thrust)', muscleGroup: 'gluteos', equipment: 'barra', level: 'intermediario' },
  { name: 'Ponte de glúteo', muscleGroup: 'gluteos', equipment: 'peso-corporal', level: 'iniciante' },
  { name: 'Coice no cabo', muscleGroup: 'gluteos', equipment: 'cabo', level: 'iniciante' },
  { name: 'Abdução de quadril com elástico', muscleGroup: 'gluteos', equipment: 'peso-corporal', level: 'iniciante' },

  // Ombros
  { name: 'Desenvolvimento com barra', muscleGroup: 'ombros', equipment: 'barra', level: 'intermediario' },
  { name: 'Desenvolvimento com halteres', muscleGroup: 'ombros', equipment: 'halter', level: 'iniciante' },
  { name: 'Elevação lateral', muscleGroup: 'ombros', equipment: 'halter', level: 'iniciante' },
  { name: 'Elevação frontal', muscleGroup: 'ombros', equipment: 'halter', level: 'iniciante' },
  { name: 'Crucifixo inverso', muscleGroup: 'ombros', equipment: 'halter', level: 'intermediario' },
  { name: 'Remada alta', muscleGroup: 'ombros', equipment: 'barra', level: 'intermediario' },
  { name: 'Encolhimento de ombros', muscleGroup: 'ombros', equipment: 'halter', level: 'iniciante' },
  { name: 'Desenvolvimento Arnold', muscleGroup: 'ombros', equipment: 'halter', level: 'intermediario' },
  { name: 'Elevação lateral no cabo', muscleGroup: 'ombros', equipment: 'cabo', level: 'intermediario' },

  // Bíceps
  { name: 'Rosca direta com barra', muscleGroup: 'biceps', equipment: 'barra', level: 'iniciante' },
  { name: 'Rosca alternada com halteres', muscleGroup: 'biceps', equipment: 'halter', level: 'iniciante' },
  { name: 'Rosca martelo', muscleGroup: 'biceps', equipment: 'halter', level: 'iniciante' },
  { name: 'Rosca scott', muscleGroup: 'biceps', equipment: 'maquina', level: 'intermediario' },
  { name: 'Rosca concentrada', muscleGroup: 'biceps', equipment: 'halter', level: 'iniciante' },
  { name: 'Rosca no cabo', muscleGroup: 'biceps', equipment: 'cabo', level: 'iniciante' },
  { name: 'Rosca inversa', muscleGroup: 'biceps', equipment: 'barra', level: 'iniciante' },
  { name: 'Rosca 21', muscleGroup: 'biceps', equipment: 'barra', level: 'avancado' },

  // Tríceps
  { name: 'Tríceps testa', muscleGroup: 'triceps', equipment: 'barra', level: 'intermediario' },
  { name: 'Tríceps pulley com corda', muscleGroup: 'triceps', equipment: 'cabo', level: 'iniciante' },
  { name: 'Tríceps francês', muscleGroup: 'triceps', equipment: 'halter', level: 'intermediario' },
  { name: 'Tríceps coice', muscleGroup: 'triceps', equipment: 'halter', level: 'iniciante' },
  { name: 'Tríceps no banco', muscleGroup: 'triceps', equipment: 'peso-corporal', level: 'iniciante' },
  { name: 'Supino fechado', muscleGroup: 'triceps', equipment: 'barra', level: 'intermediario' },
  { name: 'Tríceps unilateral no cabo', muscleGroup: 'triceps', equipment: 'cabo', level: 'iniciante' },

  // Antebraço
  { name: 'Rosca de punho', muscleGroup: 'antebraco', equipment: 'halter', level: 'iniciante' },
  { name: 'Rosca de punho inversa', muscleGroup: 'antebraco', equipment: 'halter', level: 'iniciante' },

  // Core
  { name: 'Abdominal supra', muscleGroup: 'core', equipment: 'peso-corporal', level: 'iniciante' },
  { name: 'Abdominal infra', muscleGroup: 'core', equipment: 'peso-corporal', level: 'iniciante' },
  { name: 'Prancha isométrica', muscleGroup: 'core', equipment: 'peso-corporal', level: 'iniciante' },
  { name: 'Prancha lateral', muscleGroup: 'core', equipment: 'peso-corporal', level: 'intermediario' },
  { name: 'Elevação de pernas suspenso', muscleGroup: 'core', equipment: 'peso-corporal', level: 'avancado' },
  { name: 'Abdominal na roda', muscleGroup: 'core', equipment: 'peso-corporal', level: 'avancado' },
  { name: 'Russian twist', muscleGroup: 'core', equipment: 'halter', level: 'intermediario' },
  { name: 'Abdominal bicicleta', muscleGroup: 'core', equipment: 'peso-corporal', level: 'iniciante' },
  { name: 'Abdominal oblíquo', muscleGroup: 'core', equipment: 'peso-corporal', level: 'iniciante' },
  { name: 'Mountain climber', muscleGroup: 'core', equipment: 'peso-corporal', level: 'intermediario' },

  // Cardio
  { name: 'Esteira', muscleGroup: 'cardio', equipment: 'maquina', level: 'iniciante' },
  { name: 'Bicicleta ergométrica', muscleGroup: 'cardio', equipment: 'maquina', level: 'iniciante' },
  { name: 'Elíptico', muscleGroup: 'cardio', equipment: 'maquina', level: 'iniciante' },
  { name: 'Pular corda', muscleGroup: 'cardio', equipment: 'peso-corporal', level: 'iniciante' },
  { name: 'Corda naval', muscleGroup: 'cardio', equipment: 'maquina', level: 'intermediario' },
  { name: 'Burpee', muscleGroup: 'cardio', equipment: 'peso-corporal', level: 'intermediario' },
  { name: 'Remo ergométrico', muscleGroup: 'cardio', equipment: 'maquina', level: 'iniciante' },
  { name: 'Simulador de escada', muscleGroup: 'cardio', equipment: 'maquina', level: 'intermediario' },
]

async function main() {
  // Um nome errado nas listas acima nao faria nada e ninguem perceberia:
  // o exercicio simplesmente ficaria como repeticao. Melhor falhar aqui.
  const nomes = new Set(catalog.map((exercise) => exercise.name))
  const invalidos = [...POR_DURACAO, ...COM_DISTANCIA].filter((nome) => !nomes.has(nome))
  if (invalidos.length) {
    throw new Error('nomes fora do catalogo: ' + invalidos.join(', '))
  }

  console.log('seed: ' + catalog.length + ' exercícios no catálogo')

  const semDetalhe = catalog.filter((e) => !EXERCISE_DETAILS[e.name]).map((e) => e.name)
  if (semDetalhe.length) {
    console.warn('SEM descricao/musculos (' + semDetalhe.length + '): ' + semDetalhe.join(', '))
  }
  const sobrando = Object.keys(EXERCISE_DETAILS).filter((n) => !catalog.some((e) => e.name === n))
  if (sobrando.length) {
    console.warn('detalhe sem exercicio no catalogo: ' + sobrando.join(', '))
  }

  let created = 0
  let updated = 0

  for (const exercise of catalog) {
    // Não dá para usar upsert com a unique composta [name, userId]: no Postgres
    // dois NULL são considerados distintos, então a constraint não casa com os
    // exercícios globais. A checagem explícita mantém o seed idempotente.
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name, userId: null },
      select: { id: true },
    })

    const detail = EXERCISE_DETAILS[exercise.name]
    const data = {
      ...exercise,
      usesLoad: usesLoad(exercise),
      tracking: POR_DURACAO.has(exercise.name) ? 'duration' : 'reps',
      usesDistance: COM_DISTANCIA.has(exercise.name),
      description: detail?.description ?? null,
      muscles: detail?.muscles ?? [],
    }

    if (existing) {
      await prisma.exercise.update({ where: { id: existing.id }, data })
      updated++
    } else {
      await prisma.exercise.create({ data })
      created++
    }
  }

  console.log('seed concluído: ' + created + ' criados, ' + updated + ' atualizados')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
