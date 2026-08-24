import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type SetLike = { reps: number; weight: number }

/** Volume de treino: soma de reps × carga. É a métrica de esforço total da sessão. */
export function totalVolume(sets: SetLike[]) {
  return sets.reduce((total, set) => total + set.reps * set.weight, 0)
}

export function formatVolume(volume: number) {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1).replace('.', ',')} t`
  return `${Math.round(volume)} kg`
}

export function formatSessionDate(date: Date) {
  if (isToday(date)) return 'Hoje'
  if (isYesterday(date)) return 'Ontem'
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function formatShortDate(date: Date) {
  if (isToday(date)) return 'Hoje'
  if (isYesterday(date)) return 'Ontem'
  return format(date, "d 'de' MMM", { locale: ptBR })
}

/** Separador decimal pt-BR, sem casas desnecessárias: 42,5 / 15 */
export function formatNumber(value: number) {
  return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}
