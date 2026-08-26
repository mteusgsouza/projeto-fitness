import { NextResponse, type NextRequest } from 'next/server'
import { GUEST_COOKIE, isGuestId } from '@/lib/guest-cookie'
import { endGuestSession } from '@/lib/guest'

/**
 * Sair do modo visitante. Só POST: apaga dado, e não pode acontecer porque
 * alguém (ou um prefetch) passou por um link.
 */
export async function POST(request: NextRequest) {
  const guestId = request.cookies.get(GUEST_COOKIE)?.value
  if (isGuestId(guestId)) await endGuestSession(guestId)

  const response = NextResponse.redirect(new URL('/sign-in', request.url), 303)
  response.cookies.delete(GUEST_COOKIE)

  return response
}
