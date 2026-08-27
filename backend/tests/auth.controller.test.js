const express = require("express");
const request = require("supertest");

jest.mock("../src/services/auth.service", () => ({
    register: jest.fn(),
    login: jest.fn(),
    getCurrentUser: jest.fn(),
    refreshSession: jest.fn(),
    logout: jest.fn()
}));

const authService = require("../src/services/auth.service");
const authController = require("../src/controllers/auth.controller");

function response() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn().mockReturnThis(),
        clearCookie: jest.fn().mockReturnThis()
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

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

test("login devuelve access token y configura refresh token en cookie", async () => {
    authService.login.mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token"
    });

    const res = response();

    await authController.login(
        { body: { email: "test@test.com", password: "12345678" } },
        res,
        jest.fn()
    );

    expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh-token",
        expect.objectContaining({
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        accessToken: "access-token"
    });
});

test("login delega errores al middleware", async () => {
    const error = new Error("Credenciales inválidas");
    const next = jest.fn();
    authService.login.mockRejectedValue(error);

    await authController.login({ body: {} }, response(), next);

    expect(next).toHaveBeenCalledWith(error);
});

test("getCurrentUser devuelve el usuario autenticado", async () => {
    const user = {
        id: "1",
        email: "test@test.com",
        businessName: "Store",
        businessType: "Retail"
    };
    authService.getCurrentUser.mockResolvedValue(user);
    const res = response();

    await authController.getCurrentUser(
        { user: { id: "1" } },
        res
    );

    expect(res.json).toHaveBeenCalledWith(user);
});

test("getCurrentUser responde 404 cuando el usuario no existe", async () => {
    authService.getCurrentUser.mockRejectedValue(
        new Error("Usuario no encontrado.")
    );
    const res = response();

    await authController.getCurrentUser(
        { user: { id: "missing" } },
        res
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
        message: "Usuario no encontrado."
    });
});

test("refresh responde 401 si no existe la cookie", async () => {
    const res = response();

    await authController.refresh({ cookies: {} }, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
        message: "Sesión no encontrada"
    });
    expect(authService.refreshSession).not.toHaveBeenCalled();
});

test("refresh rota la sesión y devuelve el nuevo access token", async () => {
    authService.refreshSession.mockResolvedValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token"
    });
    const res = response();

    await authController.refresh(
        { cookies: { refreshToken: "old-refresh-token" } },
        res,
        jest.fn()
    );

    expect(authService.refreshSession).toHaveBeenCalledWith(
        "old-refresh-token"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        accessToken: "new-access-token"
    });
});

test("refresh delega errores al middleware", async () => {
    const error = new Error("Refresh token inválido o expirado");
    const next = jest.fn();
    authService.refreshSession.mockRejectedValue(error);

    await authController.refresh(
        { cookies: { refreshToken: "refresh-token" } },
        response(),
        next
    );

    expect(next).toHaveBeenCalledWith(error);
});

test("logout revoca la sesión y limpia la cookie", async () => {
    const res = response();

    await authController.logout(
        { cookies: { refreshToken: "refresh-token" } },
        res,
        jest.fn()
    );

    expect(authService.logout).toHaveBeenCalledWith("refresh-token");
    expect(res.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.objectContaining({ httpOnly: true })
    );
    expect(res.status).toHaveBeenCalledWith(200);
});

test("logout funciona sin cookie", async () => {
    await authController.logout(
        { cookies: {} },
        response(),
        jest.fn()
    );

    expect(authService.logout).toHaveBeenCalledWith(undefined);
});

test("logout delega errores al middleware", async () => {
    const error = new Error("Error");
    const next = jest.fn();
    authService.logout.mockRejectedValue(error);

    await authController.logout({ cookies: {} }, response(), next);

    expect(next).toHaveBeenCalledWith(error);
});
