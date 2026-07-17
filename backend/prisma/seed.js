const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando Seed...");

  // USUARIO

  const admin = await prisma.user.create({
    data: {
      email: "admin@inventarios.com",
      passwordHash: "123456",
      businessName: "Tech Store",
      businessType: "Tecnología",
    },
  });

  // CATEGORÍAS
  const tecnologia = await prisma.category.create({
    data: {
      name: "Tecnología",
      userId: admin.id,
    },
  });

  const accesorios = await prisma.category.create({
    data: {
      name: "Accesorios",
      userId: admin.id,
    },
  });

  const oficina = await prisma.category.create({
    data: {
      name: "Oficina",
      userId: admin.id,
    },
  });
  // PRODUCTOS
  const mouse = await prisma.product.create({
    data: {
      userId: admin.id,
      categoryId: tecnologia.id,
      name: "Mouse Gamer Logitech G203",
      sku: "MOU-001",
      price: 120000,
      stockCurrent: 30,
      stockMinimum: 10,
    },
  });

  const teclado = await prisma.product.create({
    data: {
      userId: admin.id,
      categoryId: tecnologia.id,
      name: "Teclado Mecánico Redragon Kumara",
      sku: "KEY-001",
      price: 240000,
      stockCurrent: 15,
      stockMinimum: 5,
    },
  });

  const monitor = await prisma.product.create({
    data: {
      userId: admin.id,
      categoryId: tecnologia.id,
      name: 'Monitor Samsung 24"',
      sku: "MON-001",
      price: 890000,
      stockCurrent: 8,
      stockMinimum: 3,
    },
  });

  const silla = await prisma.product.create({
    data: {
      userId: admin.id,
      categoryId: oficina.id,
      name: "Silla Ergonómica",
      sku: "OFF-001",
      price: 650000,
      stockCurrent: 4,
      stockMinimum: 2,
    },
  });

  const audifonos = await prisma.product.create({
    data: {
      userId: admin.id,
      categoryId: accesorios.id,
      name: "Audífonos HyperX Cloud",
      sku: "ACC-001",
      price: 320000,
      stockCurrent: 12,
      stockMinimum: 5,
    },
  });
  // VENTA
  const venta = await prisma.sale.create({
    data: {
      userId: admin.id,
      total: 360000,
    },
  });
  // DETALLE DE VENTA

  await prisma.saleItem.createMany({
    data: [
      {
        saleId: venta.id,
        productId: mouse.id,
        quantity: 1,
        unitPrice: 120000,
        subtotal: 120000,
      },
      {
        saleId: venta.id,
        productId: teclado.id,
        quantity: 1,
        unitPrice: 240000,
        subtotal: 240000,
      },
    ],
  });

  // MOVIMIENTOS DE INVENTARIO

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: mouse.id,
        userId: admin.id,
        quantity: 30,
        reason: "Inventario inicial",
        notes: "Carga inicial del sistema",
      },
      {
        productId: teclado.id,
        userId: admin.id,
        quantity: 15,
        reason: "Inventario inicial",
        notes: "Carga inicial del sistema",
      },
      {
        productId: monitor.id,
        userId: admin.id,
        quantity: 8,
        reason: "Inventario inicial",
        notes: "Carga inicial del sistema",
      },
      {
        productId: silla.id,
        userId: admin.id,
        quantity: 4,
        reason: "Inventario inicial",
        notes: "Carga inicial del sistema",
      },
      {
        productId: audifonos.id,
        userId: admin.id,
        quantity: 12,
        reason: "Inventario inicial",
        notes: "Carga inicial del sistema",
      },
    ],
  });
  // ALERTAS DE STOCK

  await prisma.stockAlert.createMany({
    data: [
      {
        userId: admin.id,
        productId: silla.id,
        stockAlert: 2,
        isRead: false,
      },
      {
        userId: admin.id,
        productId: monitor.id,
        stockAlert: 3,
        isRead: false,
      },
    ],
  });

  console.log("Seed ejecutado correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });