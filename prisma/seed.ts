import { Prisma, PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const initialUser: Prisma.UserCreateInput[] = [
  {
    id: 'user_2qDdXSixSy2rhUudTgMZaQwOaGL',
    first_name: 'Mateus ',
    last_name: 'Gonçalves'
  }
]
async function main() {
  console.log('starting seed...')
  for (const user of initialUser) {
    const newUser = await prisma.user.create({ data: user })
    console.log(`Created user with id: ${newUser.id}`)
  }
  console.log('seed finished.')
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })