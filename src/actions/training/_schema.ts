import { z } from "zod";

const positiveInt = (field: string) =>
  z.string().or(z.number())
    .transform(Number)
    .refine((value) => Number.isFinite(value) && value > 0, { message: `${field} precisa ser maior que 0` })

export const TrainingFormSchema = z.object({
  label: z.string().min(2, { message: 'Treino precisa ter pelo menos 2 letras' }),
  trainingDay: z.string().nonempty({ message: 'Dia do treino é obrigatorio' }),
  exercises: z.array(z.object({
    exerciseId: z.string().nonempty({ message: 'Selecione o exercício' }),
    reps: positiveInt('Repetições'),
    sets: positiveInt('Séries'),
    // Carga alvo é opcional: exercícios de peso corporal não têm.
    targetWeight: z.preprocess(
      (value) => (value === '' || value === null || value === undefined ? null : Number(value)),
      z.number().positive({ message: 'Carga precisa ser maior que 0' }).nullable()
    ),
  })).min(1, { message: 'Adicione pelo menos um exercício' })
})

export type FormTrainingType = z.infer<typeof TrainingFormSchema>
export type FormTrainingInput = z.input<typeof TrainingFormSchema>
