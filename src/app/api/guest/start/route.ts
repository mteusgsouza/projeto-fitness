import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { GUEST_COOKIE, GUEST_MAX_AGE } from '@/lib/guest-cookie'
import { startGuestSession } from '@/lib/guest'

/**
 * "Entrar sem login": abre a sessão de visitante e manda para a home.
 *
 * Responde a GET e POST — o formulário do app usa POST, e o GET existe para
 * que o botão dentro do template do Clerk possa ser um link simples.
 */
async function start(request: NextRequest) {
  const { userId } = await auth()
  // Quem já tem conta não vira visitante
  if (userId) return NextResponse.redirect(new URL('/', request.url), 303)

  const guestId = await startGuestSession(request.cookies.get(GUEST_COOKIE)?.value)

  const response = NextResponse.redirect(new URL('/', request.url), 303)
  response.cookies.set({
    name: GUEST_COOKIE,
    value: guestId,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: GUEST_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}

export const GET = start
export const POST = start
