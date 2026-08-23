import React, { Fragment } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

/**
 * Espelha o usuário autenticado do Clerk na tabela User.
 *
 * Usa upsert em vez de "busca e cria": duas navegações simultâneas do mesmo
 * usuário novo chegavam a criar o registro duas vezes, estourando P2002.
 * O `update` vazio evita uma escrita a cada render — só o INSERT inicial grava.
 */
async function UserProvider({ children }: { children: React.ReactNode }) {
  const user = await currentUser()

  if (user) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        first_name: user.firstName ?? '',
        last_name: user.lastName ?? '',
      },
    })
  }

  return <Fragment>{children}</Fragment>
}

export default UserProvider
