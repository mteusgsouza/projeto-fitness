export const TRAINING_DAYS = [
  { value: 'segunda', label: 'Segunda' },
  { value: 'terca', label: 'Terça' },
  { value: 'quarta', label: 'Quarta' },
  { value: 'quinta', label: 'Quinta' },
  { value: 'sexta', label: 'Sexta' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
] as const

const DAY_LABELS = new Map(TRAINING_DAYS.map((day) => [day.value, day.label]))

/** Converte o valor salvo no banco ('terca') para exibição ('Terça'). */
export function trainingDayLabel(value: string) {
  return DAY_LABELS.get(value as (typeof TRAINING_DAYS)[number]['value']) ?? value
}
