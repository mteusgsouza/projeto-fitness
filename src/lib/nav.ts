/**
 * Destinos da navegação, em uma lista só — a barra inferior e o menu do
 * desktop liam desta mesma ordem, mas cada um tinha sua cópia da regra de
 * "ativo", e elas já haviam divergido.
 */
export const NAV_DESTINATIONS = [
  { href: '/', label: 'Início' },
  { href: '/training', label: 'Treinos' },
  { href: '/history/create', label: 'Treinar' },
  { href: '/history', label: 'Histórico' },
  { href: '/profile', label: 'Perfil' },
] as const

export type NavHref = (typeof NAV_DESTINATIONS)[number]['href']

function matches(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Qual destino está ativo para um caminho — no máximo um.
 *
 * `/history/create` é filho de `/history` na URL, mas são destinos distintos:
 * a regra de prefixo acendia os dois ao mesmo tempo. Resolver pelo destino
 * mais específico corrige esse caso e qualquer outro aninhamento futuro,
 * sem precisar de exceção nomeada.
 */
export function activeNavHref(pathname: string): string | undefined {
  // A execução do treino pertence à ação "Treinar"
  if (pathname.startsWith('/workout/')) return '/history/create'

  return NAV_DESTINATIONS
    .map((destination) => destination.href as string)
    .filter((href) => matches(pathname, href))
    .sort((a, b) => b.length - a.length)[0]
}
