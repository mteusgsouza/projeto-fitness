import {
  differenceInCalendarDays, differenceInMonths,
  format, isToday, isYesterday,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type SetLike = { reps: number | null; weight: number }

/** Volume de treino: soma de reps × carga. É a métrica de esforço total da sessão. */
export function totalVolume(sets: SetLike[]) {
  // Exercicio por duracao tem reps nulo e simplesmente nao soma volume
  return sets.reduce((total, set) => total + (set.reps ?? 0) * set.weight, 0)
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

/**
 * Segundos para leitura humana: "45s" abaixo de um minuto, "30:00" acima.
 * Guardamos segundos porque cobre prancha de 45s e esteira de 30min sem
 * casa decimal, mas ninguém lê "1800".
 */
export function formatDuration(seconds: number) {
  const minutos = Math.floor(seconds / 60)
  const restante = Math.round(seconds % 60)
  if (!minutos) return `${restante}s`
  return `${minutos}:${String(restante).padStart(2, '0')}`
}

/** Quebra segundos nos dois campos da tela. */
export function splitDuration(seconds: number | null | undefined) {
  if (!seconds) return { min: '', sec: '' }
  return { min: String(Math.floor(seconds / 60)), sec: String(seconds % 60) }
}

/** Junta os dois campos da tela em segundos. Vazio dos dois lados vira null. */
export function joinDuration(min: string, sec: string) {
  const total = (Number(min) || 0) * 60 + (Number(sec) || 0)
  return total > 0 ? total : null
}

/**
 * Como a ficha descreve uma linha de prescricao: "3×12", "3×20:00",
 * "3×12 · 40kg". Fica aqui porque a lista de fichas e a tela de execucao
 * precisam dizer exatamente a mesma coisa.
 */
export function formatPrescription(item: {
  sets: number
  reps: number | null
  durationSeconds: number | null
  targetWeight: number | null
}) {
  const medida = item.durationSeconds
    ? formatDuration(item.durationSeconds)
    : String(item.reps ?? 0)
  const carga = item.targetWeight === null ? '' : ` · ${formatNumber(item.targetWeight)}kg`
  return `${item.sets}×${medida}${carga}`
}

/**
 * Ha quanto tempo a pessoa treina, contado do primeiro treino registrado:
 * "12 dias", "5 meses", "1 ano e 4 meses".
 *
 * Conta em dias e meses de calendario, nao em blocos de 30 dias: quem comecou
 * em 3 de janeiro completa "1 mes" em 3 de fevereiro, que e como as pessoas
 * contam.
 */
export function formatTrainingSpan(since: Date, now = new Date()) {
  const dias = differenceInCalendarDays(now, since)
  if (dias < 1) return 'hoje'

  // differenceInMonths conta mes completo, nao virada de calendario: em 24 de
  // agosto, quem comecou em 25 de julho ainda esta em dias, nao em "1 mes"
  const meses = differenceInMonths(now, since)
  if (meses < 1) return `${dias} ${dias === 1 ? 'dia' : 'dias'}`
  if (meses < 12) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`

  const anos = Math.floor(meses / 12)
  const resto = meses % 12
  const rotuloAnos = `${anos} ${anos === 1 ? 'ano' : 'anos'}`
  if (!resto) return rotuloAnos
  return `${rotuloAnos} e ${resto} ${resto === 1 ? 'mês' : 'meses'}`
}
