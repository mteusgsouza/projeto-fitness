import { subDays } from 'date-fns'
import prisma from '@/lib/db'
import { DEMO_PREFIX, demoId } from '@/lib/guest-cookie'
import { TRAINING_DAYS, todayTrainingDay } from '@/lib/training-day'

type DemoExercise = {
  /** Nome no catálogo global; se não existir no banco, a linha é ignorada. */
  name: string
  sets: number
  reps?: number
  durationSeconds?: number
  /** Carga alvo em kg; ignorada em exercício sem carga. */
  weight?: number
  distanceKm?: number
}

/**
 * As fichas que o visitante encontra pronto. A primeira cai no dia de hoje,
 * para que a home abra já com o card "Treino de hoje" — é ele que mostra o
 * fluxo principal do app logo na primeira tela.
 */
const DEMO_TRAININGS: { label: string; exercises: DemoExercise[] }[] = [
  {
    label: 'Peito, ombro e tríceps',
    exercises: [
      { name: 'Supino reto com barra', sets: 4, reps: 8, weight: 60 },
      { name: 'Supino inclinado com halteres', sets: 3, reps: 10, weight: 22 },
      { name: 'Desenvolvimento com halteres', sets: 3, reps: 10, weight: 14 },
      { name: 'Elevação lateral', sets: 3, reps: 12, weight: 8 },
      { name: 'Tríceps pulley com corda', sets: 3, reps: 12, weight: 25 },
    ],
  },
  {
    label: 'Costas e bíceps',
    exercises: [
      { name: 'Puxada frontal na polia', sets: 4, reps: 10, weight: 45 },
      { name: 'Remada baixa no cabo', sets: 3, reps: 10, weight: 50 },
      { name: 'Remada unilateral com halter', sets: 3, reps: 12, weight: 24 },
      { name: 'Rosca direta com barra', sets: 3, reps: 10, weight: 20 },
      { name: 'Rosca martelo', sets: 3, reps: 12, weight: 12 },
    ],
  },
  {
    label: 'Pernas e core',
    exercises: [
      { name: 'Agachamento livre', sets: 4, reps: 8, weight: 70 },
      { name: 'Leg press 45', sets: 3, reps: 12, weight: 120 },
      { name: 'Cadeira extensora', sets: 3, reps: 15, weight: 40 },
      { name: 'Elevação pélvica (hip thrust)', sets: 3, reps: 12, weight: 60 },
      { name: 'Prancha isométrica', sets: 3, durationSeconds: 45 },
      { name: 'Esteira', sets: 1, durationSeconds: 900, distanceKm: 2.4 },
    ],
  },
]

/** Quantas sessões de exemplo entram no histórico, uma a cada dois dias. */
const DEMO_SESSIONS = 14

type CatalogRow = {
  id: string
  name: string
  usesLoad: boolean
  tracking: string
  usesDistance: boolean
}

/**
 * Quando a sessão aconteceu: uma a cada dois dias, em horário de academia.
 * Sem fixar a hora todas cairiam no minuto exato da semeadura, e o histórico
 * inteiro apareceria com o mesmo relógio.
 */
function performedAt(sessionsAgo: number) {
  const day = subDays(new Date(), sessionsAgo * 2 + 1)
  day.setHours(18 + (sessionsAgo % 3), (sessionsAgo * 17) % 60, 0, 0)
  return day
}

/** Carga cai conforme se afasta no tempo: é o que dá inclinação ao gráfico. */
function fadedWeight(weight: number, sessionsAgo: number) {
  return Math.round(weight * (1 - sessionsAgo * 0.025) * 2) / 2
}

/**
 * Popula a conta do visitante com fichas e um mês de histórico.
 *
 * Um app de acompanhamento aberto vazio não mostra nada do que ele faz —
 * gráfico, calendário e evolução por exercício só existem depois de algumas
 * sessões registradas. Então o modo visitante começa com dados plausíveis.
 */
export async function seedGuestData(userId: string) {
  const names = [...new Set(DEMO_TRAININGS.flatMap((t) => t.exercises.map((e) => e.name)))]
  const catalog = await prisma.exercise.findMany({
    where: { userId: null, name: { in: names } },
    select: { id: true, name: true, usesLoad: true, tracking: true, usesDistance: true },
  })
  const byName = new Map(catalog.map((exercise) => [exercise.name, exercise]))
  // Catálogo global ainda não semeado: sem exercício não há ficha para montar,
  // e o visitante simplesmente começa com a conta vazia.
  if (!byName.size) return

  const days = TRAINING_DAYS.map((day) => day.value)
  const firstDay = days.indexOf(todayTrainingDay())

  const fichas = DEMO_TRAININGS.map((training, index) => ({
    id: demoId(),
    label: training.label,
    trainingDay: days[(firstDay + index) % days.length],
    linhas: training.exercises
      .map((exercise) => ({ ...exercise, catalog: byName.get(exercise.name) }))
      .filter((exercise): exercise is DemoExercise & { catalog: CatalogRow } => !!exercise.catalog),
  })).filter((ficha) => ficha.linhas.length)

  const trainingCreates = fichas.map((ficha) =>
    prisma.training.create({
      data: {
        id: ficha.id,
        userId,
        label: ficha.label,
        trainingDay: ficha.trainingDay,
        exercises: {
          createMany: {
            data: ficha.linhas.map((linha, order) => ({
              exerciseId: linha.catalog.id,
              order,
              sets: linha.sets,
              reps: linha.catalog.tracking === 'duration' ? null : linha.reps ?? null,
              durationSeconds: linha.catalog.tracking === 'duration' ? linha.durationSeconds ?? null : null,
              targetWeight: linha.catalog.usesLoad ? linha.weight ?? null : null,
            })),
          },
        },
      },
    })
  )

  const sessionCreates = Array.from({ length: DEMO_SESSIONS }, (_, sessionsAgo) => {
    const ficha = fichas[sessionsAgo % fichas.length]

    const setLogs = ficha.linhas.flatMap((linha) =>
      Array.from({ length: linha.sets }, (_, index) => ({
        exerciseId: linha.catalog.id,
        setNumber: index + 1,
        // Última série cai uma repetição: é o que acontece de verdade e evita
        // um histórico de números idênticos.
        reps: linha.catalog.tracking === 'duration'
          ? null
          : Math.max(1, (linha.reps ?? 10) - (index === linha.sets - 1 ? 1 : 0)),
        durationSeconds: linha.catalog.tracking === 'duration' ? linha.durationSeconds ?? null : null,
        distanceKm: linha.catalog.usesDistance ? linha.distanceKm ?? null : null,
        weight: linha.catalog.usesLoad ? fadedWeight(linha.weight ?? 0, sessionsAgo) : 0,
        rpe: Math.min(9, 7 + index),
      }))
    )

    return prisma.workoutSession.create({
      data: {
        id: demoId(),
        userId,
        trainingId: ficha.id,
        trainingLabel: ficha.label,
        performedAt: performedAt(sessionsAgo),
        setLogs: { createMany: { data: setLogs } },
      },
    })
  })

  await prisma.$transaction([...trainingCreates, ...sessionCreates])
}

/**
 * Visitante que criou conta: o que ele montou durante o teste vai junto.
 *
 * Só migra para conta nova (sem ficha e sem sessão): numa conta que já tem
 * treino, a ficha do visitante bateria na unique [userId, trainingDay] e o
 * histórico de exemplo mentiria nos números que a pessoa já acumulou.
 *
 * O histórico semeado é descartado sempre — carga e frequência de mentira não
 * podem virar a evolução real de ninguém. As fichas ficam: servem de ponto de
 * partida e são fáceis de editar ou apagar.
 */
export async function claimGuestData(guestId: string, userId: string) {
  const [trainings, sessions] = await Promise.all([
    prisma.training.count({ where: { userId } }),
    prisma.workoutSession.count({ where: { userId } }),
  ])

  if (!trainings && !sessions) {
    await prisma.$transaction([
      prisma.workoutSession.deleteMany({
        where: { userId: guestId, id: { startsWith: DEMO_PREFIX } },
      }),
      prisma.exercise.updateMany({ where: { userId: guestId }, data: { userId } }),
      prisma.training.updateMany({ where: { userId: guestId }, data: { userId } }),
      prisma.workoutSession.updateMany({ where: { userId: guestId }, data: { userId } }),
    ])
  }

  // O que não foi migrado cai por cascade junto com a linha do visitante.
  await prisma.user.deleteMany({ where: { id: guestId } })
}
