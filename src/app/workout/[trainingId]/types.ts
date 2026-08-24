export type WorkoutExercise = {
  exerciseId: string
  name: string
  equipment: string | null
  prescribedSets: number
  prescribedReps: number
  targetWeight: number | null
  /** Falso para peso corporal e cardio: a coluna de carga nem aparece. */
  usesLoad: boolean
  previousSets: { reps: number; weight: number; rpe: number | null }[]
}

/** Uma linha da grade de execução. Guarda string porque vem direto do input. */
export type SetRow = { reps: string; weight: string; rpe: string }
