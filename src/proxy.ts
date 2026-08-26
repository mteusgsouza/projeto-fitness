import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { GUEST_COOKIE, isGuestId } from '@/lib/guest-cookie'

const isProtectedRoute = createRouteMatcher(['/', '/training(.*)', '/history(.*)', '/workout(.*)', '/exercises(.*)', '/settings(.*)', '/profile(.*)'])

// Next 16 substituiu a convenção `middleware.ts` por `proxy.ts`.
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const guestId = req.cookies.get(GUEST_COOKIE)?.value

  // Visitante que criou conta: as duas sessões coexistem por uma navegação, e
  // é essa a janela para levar os dados do teste junto. Só em GET — desviar um
  // POST (server action) quebraria a ação no meio.
  if (userId && isGuestId(guestId) && req.method === 'GET' && !req.nextUrl.pathname.startsWith('/api/guest')) {
    const claim = new URL('/api/guest/claim', req.url)
    claim.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(claim)
  }

  // O visitante entra nas mesmas rotas de quem tem conta; o que muda é o id
  // que identifica os dados dele, resolvido em getSessionUser().
  if (isProtectedRoute(req) && !userId && !isGuestId(guestId)) await auth.protect()
})

export const config = {
  matcher: [
    // Ignora internos do Next e arquivos estáticos, exceto quando em search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Sempre roda em rotas de API
    '/(api|trpc)(.*)',
  ],
}
