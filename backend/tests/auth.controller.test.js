const express = require("express");
const request = require("supertest");

jest.mock("../src/services/auth.service", () => ({
    register: jest.fn()
}));

const authService = require("../src/services/auth.service");
const authController = require("../src/controllers/auth.controller");

function response() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

test("register devuelve el usuario sin passwordHash ni contraseña", async () => {
    const originalPassword = "12345678";

    authService.register.mockResolvedValue({
        id: "1",
        email: "test@test.com",
        passwordHash: "hashedPassword",
        businessName: "Store",
        businessType: "Retail"
    });

    const app = express();
    app.use(express.json());
    app.post("/api/auth/register", authController.register);

    const response = await request(app)
        .post("/api/auth/register")
        .send({
            email: "test@test.com",
            password: originalPassword,
            businessName: "Store",
            businessType: "Retail"
        });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
        id: "1",
        email: "test@test.com",
        businessName: "Store",
        businessType: "Retail"
    });

    expect(response.body).not.toHaveProperty("passwordHash");
    expect(response.body).not.toHaveProperty("password");
    expect(JSON.stringify(response.body)).not.toContain(originalPassword);
});
