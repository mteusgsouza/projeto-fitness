'use server'

import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { ensureUser } from '@/lib/user'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

type ActionResult = { ok: boolean; message: string; sessionId?: string }

const SetSchema = z.object({
  reps: z.number().int().positive(),
  weight: z.number().min(0),
  rpe: z.number().int().min(1).max(10).nullable(),
})

const SessionSchema = z.object({
  trainingId: z.string().nonempty(),
  performedAt: z.string().datetime().optional(),
  notes: z.string().max(500).nullable().optional(),
  entries: z.array(z.object({
    exerciseId: z.string().nonempty(),
    sets: z.array(SetSchema),
  })).min(1),
})

export type SessionInput = z.infer<typeof SessionSchema>

export async function createWorkoutSession(input: SessionInput): Promise<ActionResult> {
  // Escrita: precisa da linha User por causa da foreign key
  const user = await ensureUser()
  if (!user) return { ok: false, message: 'Usuário não autenticado' }

  const parsed = SessionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: 'Dados do treino inválidos' }
  const data = parsed.data

  const training = await prisma.training.findFirst({
    where: { id: data.trainingId, userId: user.id },
    select: { id: true, label: true },
  })
  if (!training) return { ok: false, message: 'Treino não encontrado' }

  // Só aceita exercícios do catálogo global ou do próprio usuário.
  const exerciseIds = [...new Set(data.entries.map((entry) => entry.exerciseId))]
  const allowed = await prisma.exercise.count({
    where: { id: { in: exerciseIds }, OR: [{ userId: null }, { userId: user.id }] },
  })
  if (allowed !== exerciseIds.length) {
    return { ok: false, message: 'Algum exercício não pertence ao seu catálogo' }
  }

  const setLogs = data.entries.flatMap((entry) =>
    entry.sets.map((set, index) => ({
      exerciseId: entry.exerciseId,
      setNumber: index + 1,
      reps: set.reps,
      weight: set.weight,
      rpe: set.rpe,
    }))
  )

  if (!setLogs.length) {
    return { ok: false, message: 'Registre pelo menos uma série' }
  }

  const session = await prisma.workoutSession.create({
    data: {
      userId: user.id,
      trainingId: training.id,
      // Snapshot: preserva o nome mesmo se a ficha for apagada depois
      trainingLabel: training.label,
      performedAt: data.performedAt ? new Date(data.performedAt) : new Date(),
      notes: data.notes ?? null,
      setLogs: { createMany: { data: setLogs } },
    },
    select: { id: true },
  })

  revalidatePath('/history')
  revalidatePath('/')
  return { ok: true, message: 'Treino registrado', sessionId: session.id }
}

export async function deleteWorkoutSession(id: string): Promise<ActionResult> {
  const user = await currentUser()
  if (!user) return { ok: false, message: 'Usuário não autenticado' }

  // SetLog cai por cascade
  const { count } = await prisma.workoutSession.deleteMany({
    where: { id, userId: user.id },
  })
  if (!count) return { ok: false, message: 'Sessão não encontrada' }

  revalidatePath('/history')
  revalidatePath('/')
  return { ok: true, message: 'Sessão removida do histórico' }
}

/**
 * Atualiza a carga alvo da ficha a partir do que foi realmente executado.
 * É o "agora seu treino é 12kg?" oferecido no fim da sessão.
 */
export async function syncPrescriptionWeights(
  trainingId: string,
  updates: { exerciseId: string; targetWeight: number }[]
): Promise<ActionResult> {
  const user = await currentUser()
  if (!user) return { ok: false, message: 'Usuário não autenticado' }

  const training = await prisma.training.findFirst({
    where: { id: trainingId, userId: user.id },
    select: { id: true },
  })
  if (!training) return { ok: false, message: 'Treino não encontrado' }

  await prisma.$transaction(
    updates.map((update) =>
      prisma.trainingExercise.updateMany({
        where: { trainingId: training.id, exerciseId: update.exerciseId },
        data: { targetWeight: update.targetWeight },
      })
    )
  )

  revalidatePath('/training')
  return { ok: true, message: 'Ficha atualizada com as cargas do treino' }
}
