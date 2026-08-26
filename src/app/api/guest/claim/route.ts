import { NextResponse, type NextRequest } from 'next/server'
import { GUEST_COOKIE, isGuestId } from '@/lib/guest-cookie'
import { claimGuestData } from '@/lib/guest-demo'
import { ensureUser } from '@/lib/user'

/** Só caminho interno: o destino vem da URL, e é para lá que o navegador vai. */
function safePath(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

/**
 * Visitante que acabou de criar conta. O proxy manda para cá na primeira
 * navegação em que as duas sessões coexistem; aqui os dados do teste passam
 * para a conta nova e o cookie de visitante morre.
 */
export async function GET(request: NextRequest) {
  const guestId = request.cookies.get(GUEST_COOKIE)?.value

  const response = NextResponse.redirect(
    new URL(safePath(request.nextUrl.searchParams.get('redirect')), request.url),
    303,
  )
  // Antes de qualquer trabalho: se a migração falhar, o cookie ainda assim
  // some — mantê-lo faria o proxy redirecionar para cá de novo, em laço.
  response.cookies.delete(GUEST_COOKIE)

  if (isGuestId(guestId)) {
    try {
      // Cria a linha User da conta nova: as fichas do visitante só podem
      // apontar para ela depois que a foreign key tem destino.
      const user = await ensureUser()
      if (user && !user.isGuest) await claimGuestData(guestId, user.id)
    } catch {
      // Dado de teste: perder o que foi montado no modo visitante não é
      // motivo para travar a entrada na conta recém-criada.
    }
  }

  return response
}
