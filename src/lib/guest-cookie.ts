/**
 * Identidade do visitante — o modo "entrar sem login".
 *
 * Este arquivo não importa banco nem `next/headers` de propósito: o proxy
 * também precisa dessas regras e roda antes do runtime da aplicação.
 */

export const GUEST_COOKIE = 'pf_guest'

/** 30 dias: tempo de sobra para experimentar sem virar dado permanente. */
export const GUEST_MAX_AGE = 60 * 60 * 24 * 30

/**
 * O id do visitante chega pelo cookie, ou seja, é entrada do usuário. Sem um
 * formato fixo bastaria trocar o valor por um id de conta do Clerk (`user_...`)
 * para ler o treino de outra pessoa. O prefixo mantém os dois espaços de nomes
 * separados, e o resto é UUID — não dá para adivinhar o id de outro visitante.
 */
const GUEST_ID = /^guest_[0-9a-f]{32}$/

export function isGuestId(value: string | null | undefined): value is string {
  return typeof value === 'string' && GUEST_ID.test(value)
}

export function newGuestId() {
  return 'guest_' + crypto.randomUUID().replace(/-/g, '')
}

/**
 * Marca das linhas semeadas como exemplo. Fica no próprio id porque o schema
 * não tem coluna para isso — e assim dá para separar, na hora em que o
 * visitante cria conta, o que ele montou do que já veio pronto.
 */
export const DEMO_PREFIX = 'demo_'

export function demoId() {
  return DEMO_PREFIX + crypto.randomUUID()
}
