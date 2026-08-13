const request = require("supertest");
const bcrypt = require("bcrypt");

const app = require("../src/app");
const prisma = require("../src/config/prisma");

describe("Products and Stock - Integration Tests", () => {

    let accessToken;
    let categoryId;
    let productId;
    let userId;

    const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: "Test123456",
        businessName: "Negocio de pruebas",
        businessType: "Comercio"
    };

    beforeAll(async () => {

        const passwordHash = await bcrypt.hash(
            testUser.password,
            10
        );

        const user = await prisma.user.create({
            data: {
                email: testUser.email,
                passwordHash,
                businessName: testUser.businessName,
                businessType: testUser.businessType
            }
        });

        userId = user.id;

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(loginResponse.status).toBe(200);

        accessToken = loginResponse.body.accessToken;

    });

    afterAll(async () => {

        await prisma.stockAlert.deleteMany({
            where: {
                userId
            }
        });

        await prisma.stockMovement.deleteMany({
            where: {
                userId
            }
        });

        await prisma.saleItem.deleteMany({
            where: {
                sale: {
                    userId
                }
            }
        });

        await prisma.sale.deleteMany({
            where: {
                userId
            }
        });

        await prisma.product.deleteMany({
            where: {
                userId
            }
        });

        await prisma.category.deleteMany({
            where: {
                userId
            }
        });

        await prisma.user.delete({
            where: {
                id: userId
            }
        });

        await prisma.$disconnect();

    });

    test("POST /api/categories debe crear una categoría", async () => {

        const response = await request(app)
            .post("/api/categories")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                name: "Categoría Test"
            });

        expect(response.status).toBe(201);

        expect(response.body.category).toBeDefined();

        expect(response.body.category.name).toBe(
            "Categoría Test"
        );

        categoryId = response.body.category.id;

    });

    test("POST /api/products debe crear un producto", async () => {

        const response = await request(app)
            .post("/api/products")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                name: "Producto Test",
                sku: `SKU-${Date.now()}`,
                categoryId,
                price: 10000,
                stockCurrent: 10,
                stockMinimum: 5
            });

        expect(response.status).toBe(201);

        expect(response.body.product).toBeDefined();

        expect(response.body.product.name).toBe(
            "Producto Test"
        );

        expect(response.body.product.stockCurrent).toBe(10);

        productId = response.body.product.id;

    });

    test("GET /api/products debe listar los productos", async () => {

        const response = await request(app)
            .get("/api/products")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.data).toBeInstanceOf(Array);

        expect(response.body.data.length).toBeGreaterThan(0);

        const product = response.body.data.find(
            product => product.id === productId
        );

        expect(product).toBeDefined();

    });

    test("PUT /api/products/:id debe editar el producto", async () => {

        const response = await request(app)
            .put(`/api/products/${productId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                name: "Producto Test Actualizado"
            });

        expect(response.status).toBe(200);

        expect(response.body.product).toBeDefined();

        expect(response.body.product.name).toBe(
            "Producto Test Actualizado"
        );

    });

    test("POST /api/products/:id/adjustments debe permitir una salida de stock", async () => {

        const response = await request(app)
            .post(`/api/products/${productId}/adjustments`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                quantity: 2,
                reason: "LOSS",
                notes: "Pérdida generada por prueba"
            });

        expect(response.status).toBe(201);

        expect(response.body.adjustment).toBeDefined();

        expect(response.body.adjustment.quantity).toBe(-2);

        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });
        expect(product.stockCurrent).toBe(8);

    });

    test("POST /api/sales debe reducir stock y generar alerta", async () => {

        const response = await request(app)
            .post("/api/sales")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                items: [
                    {
                        productId,
                        quantity: 3,
                        unitPrice: 10000
                    }
                ]
            });

        expect(response.status).toBe(201);

        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });
        expect(product.stockCurrent).toBe(5);

        const alert = await prisma.stockAlert.findFirst({
            where: {
                productId,
                userId,
                isRead: false
            }
        });

        expect(alert).toBeDefined();

        expect(alert.stockAlert).toBe(5);

    });

    test("GET /api/alerts debe retornar las alertas activas no leídas", async () => {

        const response = await request(app)
            .get("/api/alerts")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        expect(response.body).toBeInstanceOf(Array);

        const alert = response.body.find(
            alert => alert.productId === productId
        );

        expect(alert).toBeDefined();

        expect(alert.isRead).toBe(false);

    });

    test("GET /api/products debe permitir buscar productos por nombre", async () => {

        const response = await request(app)
            .get("/api/products")
            .query({
                search: "Producto Test"
            })
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.data).toBeInstanceOf(Array);

        expect(
            response.body.data.some(
                product => product.id === productId
            )
        ).toBe(true);

    });

    test("GET /api/products debe permitir filtrar por categoría", async () => {

        const response = await request(app)
            .get("/api/products")
            .query({
                categoryId
            })
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.data).toBeInstanceOf(Array);

        expect(
            response.body.data.some(
                product => product.id === productId
            )
        ).toBe(true);

    });

    test("PUT /api/products/:id debe retornar error si el producto no existe", async () => {

        const fakeProductId =
            "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
            .put(`/api/products/${fakeProductId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                name: "Producto inexistente"
            });

        expect(response.status).toBeGreaterThanOrEqual(400);

    });

    test("POST /api/products/:id/adjustments debe permitir una corrección de stock", async () => {

        const response = await request(app)
            .post(`/api/products/${productId}/adjustments`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                quantity: 1,
                reason: "CORRECTION",
                direction: "INCREASE",
                notes: "Corrección generada por prueba"
            });

        expect(response.status).toBe(201);

        expect(response.body.adjustment).toBeDefined();

        expect(response.body.adjustment.quantity).toBe(1);

        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });
        expect(product.stockCurrent).toBe(6);

    });

    test("POST /api/products/:id/adjustments no debe permitir stock negativo", async () => {

        const response = await request(app)
            .post(`/api/products/${productId}/adjustments`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({
                quantity: 100,
                reason: "LOSS",
                notes: "Intento de stock negativo"
            });

        expect(response.status).toBe(422);

        expect(response.body.message).toBe(
            "El ajuste de stock no puede resultar en un stock negativo."
        );

        const product = await prisma.product.findUnique({
            where: {
                id: productId
            }
        });

        expect(product.stockCurrent).toBe(6);

    });

    test("GET /api/products/:id/adjustments debe retornar el historial de movimientos", async () => {

        const response = await request(app)
            .get(`/api/products/${productId}/adjustments`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        expect(response.body).toBeDefined();

        const movements = Array.isArray(response.body)
            ? response.body
            : response.body.data;

        expect(movements).toBeInstanceOf(Array);

        expect(movements.length).toBeGreaterThan(0);

    });

    test("GET /api/products/generate-sku debe generar un SKU", async () => {

        const response = await request(app)
            .get("/api/products/generate-sku")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        expect(response.body).toBeDefined();

        expect(
            response.body.sku ||
            response.body.data?.sku
        ).toBeDefined();

    });

});