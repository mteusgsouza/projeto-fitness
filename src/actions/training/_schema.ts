import { z } from "zod";

const positiveInt = (field: string) =>
  z.string().or(z.number())
    .transform(Number)
    .refine((value) => Number.isFinite(value) && value > 0, { message: `${field} precisa ser maior que 0` })

/** Campo numérico que pode vir vazio: vira null em vez de 0. */
const optionalNumber = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? null : Number(value)),
  z.number().nonnegative().nullable(),
)

export const TrainingFormSchema = z.object({
  label: z.string().min(2, { message: 'Treino precisa ter pelo menos 2 letras' }),
  trainingDay: z.string().nonempty({ message: 'Dia do treino é obrigatorio' }),
  exercises: z.array(z.object({
    exerciseId: z.string().nonempty({ message: 'Selecione o exercício' }),
    sets: positiveInt('Séries'),
    /**
     * reps e duração são opcionais aqui de propósito: qual dos dois é
     * obrigatório depende do `tracking` do exercício, que só o servidor
     * conhece. A action carrega isso do catálogo e recusa o que faltar.
     */
    reps: optionalNumber,
    durationMin: optionalNumber,
    durationSec: optionalNumber,
    // Carga alvo é opcional: exercícios de peso corporal não têm.
    targetWeight: optionalNumber,
  })).min(1, { message: 'Adicione pelo menos um exercício' })
})

export type FormTrainingType = z.infer<typeof TrainingFormSchema>
export type FormTrainingInput = z.input<typeof TrainingFormSchema>
