const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {

  const categoria = await prisma.category.create({
    data: {
      name: 'Tecnología',
      description: 'Productos tecnológicos'
    }
  })

  await prisma.product.create({
    data: {
      name: 'Mouse Gamer',
      description: 'RGB',
      price: 120000,
      stock: 20,
      categoryId: categoria.id
    }
  })

  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@test.com',
      password: '123456',
      role: 'ADMIN'
    }
  })

}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
