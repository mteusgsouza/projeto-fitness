import { z } from "zod";

export const TrainingFormSchema = z.object({
  label: z.string().min(2, { message: 'Treino precisa ter pelo menos 2 letras' }),
  trainingDay: z.string().nonempty({ message: 'Dia do treino é obrigatorio' }),
  trainingMenu: z.array(z.object({
    label: z.string().min(2, { message: 'Exercicio precisa ter pelo menos 2 letras' }),
    reps: z.string().or(z.number()).transform(Number).refine((value) => value > 0, { message: 'Repetições precisa ser maior que 0' }),
    sets: z.string().or(z.number()).transform(Number).refine((value) => value > 0, { message: 'Séries precisa ser maior que 0' })
  })).min(1)
})

export type FormTrainingType = z.infer<typeof TrainingFormSchema>