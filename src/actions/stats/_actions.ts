'use server'

import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import {
  addMonths, eachDayOfInterval, eachWeekOfInterval, endOfMonth, endOfWeek,
  format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subWeeks,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { totalVolume } from '@/lib/workout'

const WEEK_OPTIONS = { weekStartsOn: 1 as const }

export type WeeklyPoint = {
  week: string
  label: string
  sessions: number
  volume: number
}

export type ProgressPoint = {
  date: string
  label: string
  maxWeight: number
  /** Maior numero de reps numa serie da sessao — e a progressao do peso corporal */
  maxReps: number
  volume: number
  reps: number
}

/**
 * Frequência e volume por semana nas últimas `weeks` semanas.
 * Semanas sem treino aparecem com zero — sem isso o gráfico mente,
 * pulando direto de uma semana ativa para a outra.
 */
export async function getWeeklyStats(weeks = 12): Promise<WeeklyPoint[]> {
  const user = await currentUser()
  if (!user) return []

  const end = startOfWeek(new Date(), WEEK_OPTIONS)
  const start = subWeeks(end, weeks - 1)

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user.id, performedAt: { gte: start } },
    select: {
      performedAt: true,
      setLogs: { select: { reps: true, weight: true } },
    },
  })

  const buckets = new Map<string, { sessions: number; volume: number }>()
  for (const session of sessions) {
    const key = format(startOfWeek(session.performedAt, WEEK_OPTIONS), 'yyyy-MM-dd')
    const bucket = buckets.get(key) ?? { sessions: 0, volume: 0 }
    bucket.sessions += 1
    bucket.volume += totalVolume(session.setLogs)
    buckets.set(key, bucket)
  }

  return eachWeekOfInterval({ start, end }, WEEK_OPTIONS).map((weekStart) => {
    const key = format(weekStart, 'yyyy-MM-dd')
    const bucket = buckets.get(key) ?? { sessions: 0, volume: 0 }
    return {
      week: key,
      label: format(weekStart, "d 'de' MMM", { locale: ptBR }),
      sessions: bucket.sessions,
      volume: Math.round(bucket.volume),
    }
  })
}

/** Exercícios que o usuário já executou pelo menos uma vez. */
export async function getTrackedExercises() {
  const user = await currentUser()
  if (!user) return []

  const logs = await prisma.setLog.findMany({
    where: { session: { userId: user.id } },
    select: { exerciseId: true, exercise: { select: { name: true, usesLoad: true } } },
    distinct: ['exerciseId'],
  })

  return logs
    .map((log) => ({
      id: log.exerciseId,
      name: log.exercise.name,
      usesLoad: log.exercise.usesLoad,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

/**
 * Evolução de um exercício ao longo do tempo.
 * `maxWeight` é a maior carga da sessão — é ela que representa o limite
 * atingido, não a última série (que costuma cair por fadiga).
 */
export async function getExerciseProgress(exerciseId: string): Promise<ProgressPoint[]> {
  const user = await currentUser()
  if (!user || !exerciseId) return []

  const logs = await prisma.setLog.findMany({
    where: { exerciseId, session: { userId: user.id } },
    orderBy: { session: { performedAt: 'asc' } },
    select: {
      reps: true,
      weight: true,
      sessionId: true,
      session: { select: { performedAt: true } },
    },
  })

  const bySession = new Map<string, { performedAt: Date; sets: { reps: number; weight: number }[] }>()
  for (const log of logs) {
    const bucket = bySession.get(log.sessionId)
      ?? { performedAt: log.session.performedAt, sets: [] }
    bucket.sets.push({ reps: log.reps, weight: log.weight })
    bySession.set(log.sessionId, bucket)
  }

  return [...bySession.values()]
    .sort((a, b) => a.performedAt.getTime() - b.performedAt.getTime())
    .map((session) => ({
      date: session.performedAt.toISOString(),
      label: format(session.performedAt, "d 'de' MMM", { locale: ptBR }),
      maxWeight: Math.max(...session.sets.map((set) => set.weight)),
      maxReps: Math.max(...session.sets.map((set) => set.reps)),
      volume: Math.round(totalVolume(session.sets)),
      reps: session.sets.reduce((total, set) => total + set.reps, 0),
    }))
}

export type CalendarDay = {
  date: string
  dayOfMonth: number
  inMonth: boolean
  isToday: boolean
  sessions: number
  labels: string[]
}

export type TrainingCalendar = {
  monthLabel: string
  offset: number
  total: number
  days: CalendarDay[]
}

/**
 * Calendario de treinos do mes. A grade cobre semanas inteiras (segunda a
 * domingo), entao inclui dias vizinhos marcados com inMonth=false.
 * `offset` navega meses: 0 e o atual, -1 o anterior.
 */
export async function getTrainingCalendar(offset = 0): Promise<TrainingCalendar | null> {
  const user = await currentUser()
  if (!user) return null

  const base = addMonths(new Date(), offset)
  const monthStart = startOfMonth(base)
  const monthEnd = endOfMonth(base)
  const gridStart = startOfWeek(monthStart, WEEK_OPTIONS)
  const gridEnd = endOfWeek(monthEnd, WEEK_OPTIONS)

  const sessions = await prisma.workoutSession.findMany({
    where: { userId: user.id, performedAt: { gte: gridStart, lte: gridEnd } },
    select: { performedAt: true, trainingLabel: true },
    orderBy: { performedAt: 'asc' },
  })

  const today = new Date()
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd }).map((day) => {
    const doDia = sessions.filter((session) => isSameDay(session.performedAt, day))
    return {
      date: format(day, 'yyyy-MM-dd'),
      dayOfMonth: day.getDate(),
      inMonth: isSameMonth(day, monthStart),
      isToday: isSameDay(day, today),
      sessions: doDia.length,
      labels: doDia.map((session) => session.trainingLabel),
    }
  })

  return {
    monthLabel: format(monthStart, "MMMM 'de' yyyy", { locale: ptBR }),
    offset,
    total: sessions.filter((session) => isSameMonth(session.performedAt, monthStart)).length,
    days,
  }
}
