import { cache } from 'react'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'
import { GUEST_FIRST_NAME, getGuestId } from '@/lib/guest'

export type SessionUser = {
  id: string
  firstName: string | null
  lastName: string | null
  fullName: string | null
  email: string | null
  /** Conta de teste, sem login: os dados vivem só neste navegador. */
  isGuest: boolean
}

/**
 * Quem está usando o app — conta do Clerk ou visitante.
 *
 * Tudo que lê ou escreve dado filtra por `id`, então o resto do app não
 * precisa saber de qual dos dois veio. O id do visitante é o próprio valor do
 * cookie (`guest_...`), num espaço de nomes que nunca colide com o do Clerk.
 *
 * A conta autenticada vem primeiro de propósito: um cookie de visitante
 * esquecido no navegador não pode esconder a conta de verdade. `auth()` só lê
 * o token da requisição, então essa checagem não custa ida ao Clerk.
 *
 * Memoizado por requisição: `currentUser()` é uma chamada à API do Clerk e não
 * tem cache próprio, e a mesma página costuma perguntar quem é o usuário em
 * quatro ou cinco lugares (header, cards da home, actions de estatística).
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const { userId } = await auth()

  if (userId) {
    const user = await currentUser()
    if (user) {
      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.primaryEmailAddress?.emailAddress ?? null,
        isGuest: false,
      }
    }
  }

  const guestId = await getGuestId()
  if (!guestId) return null

  return {
    id: guestId,
    firstName: GUEST_FIRST_NAME,
    lastName: null,
    fullName: GUEST_FIRST_NAME,
    email: null,
    isGuest: true,
  }
})

/**
 * Garante que o usuário exista na tabela User.
 *
 * Antes isso rodava no layout raiz, ou seja, um upsert a cada navegação —
 * ~120ms de latência do Neon somados a toda página, inclusive nas de leitura.
 * As consultas de leitura filtram pelo id da sessão e não dependem dessa linha;
 * só as escritas dependem, por causa da foreign key. Então o custo passou a
 * ficar onde ele é de fato necessário.
 *
 * O upsert é idempotente e resolve a corrida entre duas escritas simultâneas
 * de um usuário novo, que antes podia estourar P2002.
 */
export async function ensureUser() {
  const user = await getSessionUser()
  if (!user) return null

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      first_name: user.firstName ?? '',
      last_name: user.lastName ?? '',
    },
  })

  return user
}
