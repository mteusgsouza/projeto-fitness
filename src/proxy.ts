import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/', '/training(.*)', '/history(.*)', '/workout(.*)', '/exercises(.*)', '/settings(.*)'])

// Next 16 substituiu a convenção `middleware.ts` por `proxy.ts`.
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    // Ignora internos do Next e arquivos estáticos, exceto quando em search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Sempre roda em rotas de API
    '/(api|trpc)(.*)',
  ],
}
