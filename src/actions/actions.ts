'use server'

import prisma from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"

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