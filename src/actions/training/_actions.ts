'use server'

import { currentUser } from "@clerk/nextjs/server"
import type { FormTrainingType } from "./_schema"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { trainingDayLabel } from "@/lib/training-day"
import { ensureUser } from "@/lib/user"

type ActionResult = { ok: boolean; message: string }

/**
 * O resolver do formulário roda em modo `raw`, então os campos numéricos chegam
 * como string. A conversão fica aqui para a action valer tanto para dado cru
 * quanto para dado já parseado pelo Zod.
 */
function toNumberOrNull(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function toPrescription(formData: FormTrainingType) {
  return formData.exercises.map((exercise, index) => ({
    exerciseId: exercise.exerciseId,
    order: index,
    sets: Number(exercise.sets),
    reps: Number(exercise.reps),
    targetWeight: toNumberOrNull(exercise.targetWeight),
  }))
}

function revalidateAll() {
  revalidatePath('/training')
  revalidatePath('/history')
  revalidatePath('/')
}

export async function createTraining(formData: FormTrainingType): Promise<ActionResult> {
  // Escrita: precisa da linha User por causa da foreign key
  const user = await ensureUser()
  if (!user) return { ok: false, message: 'Usuário não autenticado' }

  // Um treino por dia da semana: checa antes para dar mensagem clara em vez de
  // deixar estourar a unique constraint [userId, trainingDay].
  const occupied = await prisma.training.findFirst({
    where: { userId: user.id, trainingDay: formData.trainingDay },
    select: { label: true },
  })
  if (occupied) {
    return {
      ok: false,
      message: `${trainingDayLabel(formData.trainingDay)} já tem o treino "${occupied.label}"`,
    }
  }

  await prisma.training.create({
    data: {
      userId: user.id,
      label: formData.label,
      trainingDay: formData.trainingDay,
      exercises: { createMany: { data: toPrescription(formData) } },
    },
  })

  revalidateAll()
  return { ok: true, message: 'Treino cadastrado' }
}

export async function updateTraining(id: string, formData: FormTrainingType): Promise<ActionResult> {
  const user = await currentUser()
  if (!user) return { ok: false, message: 'Usuário não autenticado' }

  const owned = await prisma.training.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })
  if (!owned) return { ok: false, message: 'Treino não encontrado' }

  const occupied = await prisma.training.findFirst({
    where: { userId: user.id, trainingDay: formData.trainingDay, NOT: { id } },
    select: { label: true },
  })
  if (occupied) {
    return {
      ok: false,
      message: `${trainingDayLabel(formData.trainingDay)} já tem o treino "${occupied.label}"`,
    }
  }

  // Recriar a prescrição é seguro: o histórico de execução vive em SetLog e
  // aponta para Exercise, não para estas linhas.
  await prisma.$transaction([
    prisma.trainingExercise.deleteMany({ where: { trainingId: id } }),
    prisma.training.update({
      where: { id },
      data: {
        label: formData.label,
        trainingDay: formData.trainingDay,
        exercises: { createMany: { data: toPrescription(formData) } },
      },
    }),
  ])

  revalidateAll()
  return { ok: true, message: 'Treino atualizado' }
}

export async function deleteTraining(id: string): Promise<ActionResult> {
  const user = await currentUser()
  if (!user) return { ok: false, message: 'Usuário não autenticado' }

  const owned = await prisma.training.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  })
  if (!owned) return { ok: false, message: 'Treino não encontrado' }

  // TrainingExercise cai por cascade; as sessões sobrevivem com trainingId nulo
  // e o nome preservado em trainingLabel.
  await prisma.training.delete({ where: { id } })

  revalidateAll()
  return { ok: true, message: 'Treino excluído' }
}
