export type ExerciseOption = {
  id: string
  name: string
  muscleGroup: string
  equipment: string | null
  level: string
  /** Falso para peso corporal e cardio: carga não se aplica, não é zero. */
  usesLoad: boolean
  /** "reps" ou "duration" — em que unidade o exercício é medido. */
  tracking: string
  /** Se faz sentido registrar distância (esteira, bike, elíptico, remo). */
  usesDistance: boolean
  userId: string | null
}

export const MUSCLE_GROUPS = [
  { value: 'peito', label: 'Peito' },
  { value: 'costas', label: 'Costas' },
  { value: 'pernas', label: 'Pernas' },
  { value: 'gluteos', label: 'Glúteos' },
  { value: 'ombros', label: 'Ombros' },
  { value: 'biceps', label: 'Bíceps' },
  { value: 'triceps', label: 'Tríceps' },
  { value: 'antebraco', label: 'Antebraço' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
] as const

const MUSCLE_LABELS = new Map(MUSCLE_GROUPS.map((group) => [group.value as string, group.label]))

export function muscleGroupLabel(value: string) {
  return MUSCLE_LABELS.get(value) ?? value
}

export const LEVEL_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

export function levelLabel(value: string) {
  return LEVEL_LABELS[value] ?? value
}

/**
 * Agrupa o catálogo por grupo muscular, na ordem de MUSCLE_GROUPS.
 * Grupos desconhecidos (vindos de exercícios personalizados) vão para o fim.
 */
export function groupByMuscle(exercises: ExerciseOption[]) {
  const buckets = new Map<string, ExerciseOption[]>()

  for (const exercise of exercises) {
    const list = buckets.get(exercise.muscleGroup) ?? []
    list.push(exercise)
    buckets.set(exercise.muscleGroup, list)
  }

  const known = MUSCLE_GROUPS
    .map((group) => ({ value: group.value as string, label: group.label, items: buckets.get(group.value) ?? [] }))
    .filter((group) => group.items.length > 0)

  const unknown = [...buckets.keys()]
    .filter((key) => !MUSCLE_LABELS.has(key))
    .map((key) => ({ value: key, label: muscleGroupLabel(key), items: buckets.get(key) ?? [] }))

  return [...known, ...unknown]
}
