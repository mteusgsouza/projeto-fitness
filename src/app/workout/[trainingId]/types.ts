export type WorkoutExercise = {
  exerciseId: string
  name: string
  equipment: string | null
  prescribedSets: number
  prescribedReps: number | null
  prescribedDuration: number | null
  targetWeight: number | null
  /** Falso para peso corporal e cardio: a coluna de carga nem aparece. */
  usesLoad: boolean
  /** "reps" ou "duration": decide se a grade pede repetições ou tempo. */
  tracking: string
  usesDistance: boolean
  previousSets: {
    reps: number | null
    durationSeconds: number | null
    distanceKm: number | null
    weight: number
    rpe: number | null
  }[]
}

/** Uma linha da grade de execução. Guarda string porque vem direto do input. */
export type SetRow = {
  reps: string
  /** Dois campos separados: 45s e 30min sem digitação estranha */
  min: string
  sec: string
  km: string
  weight: string
  rpe: string
}
