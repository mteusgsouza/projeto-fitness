import { formatDuration, formatNumber } from './workout'

/** O bastante para saber em que unidade o exercicio progride. */
export type Measure = { usesLoad: boolean; tracking: string }

/**
 * Cada exercicio progride em uma coisa diferente, e misturar as tres num
 * grafico so nao diria nada: supino sobe em carga, barra fixa em repeticoes,
 * esteira e prancha em tempo. Aqui se escolhe qual serie do ProgressPoint
 * desenhar e como escrever o numero.
 */
export function progressMetric({ usesLoad, tracking }: Measure) {
  if (tracking === 'duration') {
    return {
      key: 'maxDuration' as const,
      title: 'Maior duração',
      caption: 'recorde de tempo',
      format: (value: number) => formatDuration(value),
      // Sempre mm:ss no eixo: formatDuration escreve "45s" para menos de um
      // minuto, e "0s" no meio de "5:00" e "10:00" fica desalinhado
      tick: (value: number) =>
        `${Math.floor(value / 60)}:${String(Math.round(value % 60)).padStart(2, '0')}`,
    }
  }
  if (usesLoad) {
    return {
      key: 'maxWeight' as const,
      title: 'Carga máxima',
      caption: 'recorde de carga',
      format: (value: number) => `${formatNumber(value)} kg`,
      tick: (value: number) => `${formatNumber(value)}kg`,
    }
  }
  return {
    key: 'maxReps' as const,
    title: 'Repetições máximas',
    caption: 'recorde de repetições',
    format: (value: number) => `${formatNumber(value)} reps`,
    // O eixo fica so com o numero: "24 reps" repetido em cada marca quebra
    // em duas linhas e nao acrescenta nada que o titulo ja nao diga
    tick: (value: number) => formatNumber(value),
  }
}
