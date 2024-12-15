import { createUser } from '@/actions/actions'
import React, { Fragment } from 'react'
import prisma from "@/lib/db";
import { currentUser } from '@clerk/nextjs/server';

async function UserProvider({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  if (user) {
    const prismaUser = await prisma.user.findUnique({
      where: {
        id: user?.id
      }
    })
    if (!prismaUser && user) {
      console.log('creating user...')
      createUser()
    } else {
      console.log('user already exists...')
    }
  }

  return (
    <Fragment>{children}</Fragment>
  )
}

export default UserProvider