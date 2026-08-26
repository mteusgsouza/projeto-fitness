import { cookies } from 'next/headers'
import prisma from '@/lib/db'
import { GUEST_COOKIE, GUEST_MAX_AGE, isGuestId, newGuestId } from '@/lib/guest-cookie'
import { seedGuestData } from '@/lib/guest-demo'

/** Nome exibido no lugar do primeiro nome da conta. */
export const GUEST_FIRST_NAME = 'Visitante'

/** O id do visitante desta requisição, ou null se o cookie não valer. */
export async function getGuestId() {
  const value = (await cookies()).get(GUEST_COOKIE)?.value
  return isGuestId(value) ? value : null
}

/**
 * Abre (ou retoma) a sessão de visitante e devolve o id a ser gravado no
 * cookie. Retomar depende da linha User existir: o cookie pode ter sobrevivido
 * a um "sair", que apaga os dados, e aí o certo é começar de novo.
 */
export async function startGuestSession(existing: string | null | undefined) {
  if (isGuestId(existing)) {
    const alive = await prisma.user.findUnique({ where: { id: existing }, select: { id: true } })
    if (alive) return existing
  }

  await purgeExpiredGuests()

  const guestId = newGuestId()
  await prisma.user.create({
    data: { id: guestId, first_name: GUEST_FIRST_NAME, last_name: '' },
  })
  await seedGuestData(guestId)

  return guestId
}

/**
 * Varre os visitantes cujo cookie já expirou — sem ele não há como voltar aos
 * dados, então o que sobra é lixo acumulando ficha e série no banco. Roda só
 * quando um visitante novo entra, e falhar aqui não pode impedir a entrada.
 */
async function purgeExpiredGuests() {
  try {
    await prisma.user.deleteMany({
      where: {
        id: { startsWith: 'guest_' },
        createdAt: { lt: new Date(Date.now() - GUEST_MAX_AGE * 1000) },
      },
    })
  } catch {
    // limpeza é oportunista: a próxima entrada tenta de novo
  }
}

/** Sair do modo visitante: os dados são de teste e vão embora com ele. */
export async function endGuestSession(guestId: string) {
  // Fichas, sessões e séries caem por cascade.
  await prisma.user.deleteMany({ where: { id: guestId } })
}
