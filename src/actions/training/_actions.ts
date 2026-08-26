'use server'

import { ensureUser, getSessionUser } from '@/lib/user'
import type { FormTrainingType } from "./_schema"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { trainingDayLabel } from "@/lib/training-day"

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

/**
 * Carrega usesLoad dos exercicios da ficha e, de quebra, confirma que todos
 * pertencem ao catalogo global ou ao proprio usuario.
 * Retorna null quando algum id nao e acessivel.
 */
async function loadUsage(formData: FormTrainingType, userId: string) {
  const ids = [...new Set(formData.exercises.map((exercise) => exercise.exerciseId))]
  const found = await prisma.exercise.findMany({
    where: { id: { in: ids }, OR: [{ userId: null }, { userId }] },
    select: { id: true, name: true, usesLoad: true, tracking: true },
  })
  if (found.length !== ids.length) return null
  return new Map(found.map((exercise) => [exercise.id, exercise]))
}

type Usage = Map<string, { name: string; usesLoad: boolean; tracking: string }>

/**
 * Monta a prescricao respeitando como o exercicio e medido.
 *
 * - carga alvo some em quem nao usa carga: a interface ja esconde o campo,
 *   mas trocar o exercicio de uma linha podia deixar o valor do anterior
 * - reps e duracao sao mutuamente exclusivos, conforme o tracking. Guardar
 *   os dois deixaria o dado ambiguo.
 *
 * Devolve o nome do exercicio que faltou preencher, se houver.
 */
function toPrescription(formData: FormTrainingType, usage: Usage) {
  const faltando: string[] = []

  const linhas = formData.exercises.map((exercise, index) => {
    const info = usage.get(exercise.exerciseId)!
    const porDuracao = info.tracking === 'duration'
    const duracao = (Number(exercise.durationMin) || 0) * 60 + (Number(exercise.durationSec) || 0)
    const reps = Number(exercise.reps) || 0

    if (porDuracao && duracao <= 0) faltando.push(info.name)
    if (!porDuracao && reps <= 0) faltando.push(info.name)

    return {
      exerciseId: exercise.exerciseId,
      order: index,
      sets: Number(exercise.sets),
      reps: porDuracao ? null : reps,
      durationSeconds: porDuracao ? duracao : null,
      targetWeight: info.usesLoad ? toNumberOrNull(exercise.targetWeight) : null,
    }
  })

  return { linhas, faltando }
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

  const usage = await loadUsage(formData, user.id)
  if (!usage) return { ok: false, message: 'Algum exercício não pertence ao seu catálogo' }

  const prescricao = toPrescription(formData, usage)
  if (prescricao.faltando.length) {
    return {
      ok: false,
      message: `Preencha séries e ${prescricao.faltando.length === 1 ? 'a medida' : 'as medidas'} de: ${[...new Set(prescricao.faltando)].join(', ')}`,
    }
  }

  await prisma.training.create({
    data: {
      userId: user.id,
      label: formData.label,
      trainingDay: formData.trainingDay,
      exercises: { createMany: { data: prescricao.linhas } },
    },
  })

  revalidateAll()
  return { ok: true, message: 'Treino cadastrado' }
}

export async function updateTraining(id: string, formData: FormTrainingType): Promise<ActionResult> {
  const user = await getSessionUser()
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

  const usage = await loadUsage(formData, user.id)
  if (!usage) return { ok: false, message: 'Algum exercício não pertence ao seu catálogo' }

  // Recriar a prescrição é seguro: o histórico de execução vive em SetLog e
  // aponta para Exercise, não para estas linhas.
  const prescricao = toPrescription(formData, usage)
  if (prescricao.faltando.length) {
    return {
      ok: false,
      message: `Preencha séries e ${prescricao.faltando.length === 1 ? 'a medida' : 'as medidas'} de: ${[...new Set(prescricao.faltando)].join(', ')}`,
    }
  }

  await prisma.$transaction([
    prisma.trainingExercise.deleteMany({ where: { trainingId: id } }),
    prisma.training.update({
      where: { id },
      data: {
        label: formData.label,
        trainingDay: formData.trainingDay,
        exercises: { createMany: { data: prescricao.linhas } },
      },
    }),
  ])

  revalidateAll()
  return { ok: true, message: 'Treino atualizado' }
}

export async function deleteTraining(id: string): Promise<ActionResult> {
  const user = await getSessionUser()
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
