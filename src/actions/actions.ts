'use server'

import prisma from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"

export async function createTraining(formData: FormData) {
  const user = await currentUser()
  if (!user) return
  await prisma.training.create({
    data: {
      label: formData.get('label') as string,
      userId: user.id
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
      last_name: user.lastName as string
    }
  })
}