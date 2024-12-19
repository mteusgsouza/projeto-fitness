'use server'

import { currentUser } from "@clerk/nextjs/server"
import type { FormTrainingType } from "./_schema"
import prisma from "@/lib/db"

export async function createTraining(formData: FormTrainingType) {
  console.log(formData)

  const user = await currentUser()
  if (!user) return

  const menuExercises = formData.trainingMenu.map((exercise) => ({
    ...exercise,
    reps: Number(exercise.reps),
    sets: Number(exercise.sets)
  }))

  await prisma.training.create({
    data: {
      userId: user.id,
      label: formData.label,
      trainingDay: formData.trainingDay,
      trainingMenu: {
        createMany: {
          data: menuExercises
        }
      }
    }
  })
}