import { z } from "zod";

export const TrainingFormSchema = z.object({
  label: z.string().min(2),
  trainingDay: z.string().nonempty({ message: 'Training day is required' }),
  trainingMenu: z.array(z.object({
    label: z.string().min(2),
    reps: z.string().transform(Number).refine((value) => value > 0, { message: 'Sets must be greater than 0' }),
    sets: z.string().transform(Number).refine((value) => value > 0, { message: 'Sets must be greater than 0' })
  })).min(1)
})

export type FormTrainingType = z.infer<typeof TrainingFormSchema>