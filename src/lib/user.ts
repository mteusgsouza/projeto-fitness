import { currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/db'

/**
 * Garante que o usuário do Clerk exista na tabela User.
 *
 * Antes isso rodava no layout raiz, ou seja, um upsert a cada navegação —
 * ~120ms de latência do Neon somados a toda página, inclusive nas de leitura.
 * As consultas de leitura filtram pelo id do Clerk e não dependem dessa linha;
 * só as escritas dependem, por causa da foreign key. Então o custo passou a
 * ficar onde ele é de fato necessário.
 *
 * O upsert é idempotente e resolve a corrida entre duas escritas simultâneas
 * de um usuário novo, que antes podia estourar P2002.
 */
export async function ensureUser() {
  const user = await currentUser()
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
