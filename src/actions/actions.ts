'use server'

import prisma from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"

export async function createTraining(formData: FormData) {

  console.log(formData)

  // const menuExercises = Array.from({ length: Number(formData.get('menu-qtd')) })
  //   .map((_, index) => ({
  //     label: formData.get(`menu-label-${index}`) as string,
  //     reps: Number(formData.get(`menu-reps-${index}`) as string),
  //     sets: Number(formData.get(`menu-sets-${index}`) as string)
  //   }))

  // const user = await currentUser()
  // if (!user) return

  // await prisma.training.create({
  //   data: {
  //     userId: user.id,
  //     label: formData.get('label') as string,
  //     trainingDay: formData.get('training-day') as string,
  //     trainingMenu: {
  //       createMany: {
  //         data: menuExercises
  //       }
  //     }
  //   }
  // })
}

export async function deleteTraining(formData: FormData) {
  await prisma.training.delete({
    where: {
      id: formData.get('id') as string
    }
  })
}

export async function createUser() {
  const user = await currentUser()
  if (!user) return
  await prisma.user.create({
    data: {
      id: user.id,
      first_name: user.firstName as string,
      last_name: user.lastName || ' '
    }
  })
}