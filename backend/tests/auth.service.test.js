const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

jest.mock("../src/config/prisma", () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn()
    },

    refreshToken: {
        create: jest.fn(),
        findFirst: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn()
    },

    $transaction: jest.fn()
}));

const prisma = require("../src/config/prisma");
const authService = require("../src/services/auth.service");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("register", () => {

    // Register test number 3
    test("should throw an error if password is shorter than 8 characters", async () => {

        await expect(
            authService.register({
                email: "test@test.com",
                password: "123",
                businessName: "Store",
                businessType: "Retail"
            })
        ).rejects.toThrow(
            "La contraseña debe tener mínimo 8 caracteres"
        );

    });

    // Resgister test number 2
    test("should throw an error if email already exists", async () => {

        prisma.user.findUnique.mockResolvedValue({
            id: "1",
            email: "test@test.com"
        });

        await expect(
            authService.register({
                email: "test@test.com",
                password: "12345678",
                businessName: "Store",
                businessType: "Retail"
            })
        ).rejects.toThrow(
            "El email ya está registrado"
        );

    });

    // Register test number 3
    test("should register a new user successfully", async () => {

        prisma.user.findUnique.mockResolvedValue(null);

        bcrypt.hash.mockResolvedValue("hashedPassword");

        prisma.user.create.mockResolvedValue({
            id: "1",
            email: "test@test.com",
            passwordHash: "hashedPassword",
            businessName: "Store",
            businessType: "Retail"
        });

        const result = await authService.register({
            email: "test@test.com",
            password: "12345678",
            businessName: "Store",
            businessType: "Retail"
        });

        expect(bcrypt.hash).toHaveBeenCalledWith("12345678", 10);

        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                email: "test@test.com",
                passwordHash: "hashedPassword",
                businessName: "Store",
                businessType: "Retail"
            }
        });

        expect(result).toEqual({
            id: "1",
            email: "test@test.com",
            passwordHash: "hashedPassword",
            businessName: "Store",
            businessType: "Retail"
        });

    });

});

describe("getCurrentUser", () => {

    test("devuelve los campos públicos del usuario", async () => {
        const user = {
            id: "1",
            email: "test@test.com",
            businessName: "Store",
            businessType: "Retail"
        };
        prisma.user.findUnique.mockResolvedValue(user);

        await expect(
            authService.getCurrentUser("1")
        ).resolves.toEqual(user);

        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: "1" },
            select: {
                id: true,
                email: true,
                fullName: true,
                businessName: true,
                businessType: true,
                address: true,
                profileImage: true
            }
        });
    });

    test("lanza error si el usuario no existe", async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        await expect(
            authService.getCurrentUser("missing")
        ).rejects.toThrow("Usuario no encontrado.");
    });
});

describe("refreshSession", () => {

    test("rechaza refresh token ausente", async () => {
        await expect(
            authService.refreshSession()
        ).rejects.toThrow("Refresh token no proporcionado");
    });

    test("rechaza refresh token con firma invalida", async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        await expect(
            authService.refreshSession("invalid-token")
        ).rejects.toThrow("Refresh token inválido o expirado");
    });

    test("rechaza refresh token no almacenado o revocado", async () => {
        jwt.verify.mockReturnValue({ id: "1" });
        prisma.refreshToken.findFirst.mockResolvedValue(null);

        await expect(
            authService.refreshSession("refresh-token")
        ).rejects.toThrow("Refresh token inválido o revocado");
    });

    test("rechaza refresh token expirado en la base de datos", async () => {
        jwt.verify.mockReturnValue({ id: "1" });
        prisma.refreshToken.findFirst.mockResolvedValue({
            id: "stored-token",
            expiresAt: new Date(Date.now() - 1000)
        });

        await expect(
            authService.refreshSession("refresh-token")
        ).rejects.toThrow("Refresh token expirado");
    });

    test("rota refresh token y devuelve nuevo access token", async () => {
        jwt.verify.mockReturnValue({ id: "1" });
        prisma.refreshToken.findFirst.mockResolvedValue({
            id: "stored-token",
            expiresAt: new Date(Date.now() + 10000)
        });
        prisma.user.findUnique.mockResolvedValue({
            id: "1",
            email: "test@test.com",
            passwordHash: "hash"
        });
        jwt.sign
            .mockReturnValueOnce("new-access-token")
            .mockReturnValueOnce("new-refresh-token");
        jwt.decode.mockReturnValue({
            exp: Math.floor(Date.now() / 1000) + 1000
        });
        prisma.$transaction.mockResolvedValue([]);

        await expect(
            authService.refreshSession("refresh-token")
        ).resolves.toEqual({
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token"
        });
        expect(prisma.$transaction).toHaveBeenCalled();
    });

    test("rechaza si el usuario del refresh no existe", async () => {
        jwt.verify.mockReturnValue({ id: "missing" });
        prisma.refreshToken.findFirst.mockResolvedValue({
            id: "stored-token",
            expiresAt: new Date(Date.now() + 10000)
        });
        prisma.user.findUnique.mockResolvedValue(null);

        await expect(
            authService.refreshSession("refresh-token")
        ).rejects.toThrow("Usuario no encontrado");
    });
});

describe("logout", () => {

    test("no hace nada si no recibe refresh token", async () => {
        await authService.logout();

        expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
    });

    test("revoca refresh token activo por su hash", async () => {
        await authService.logout("refresh-token");

        expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
            where: {
                tokenHash: expect.any(String),
                revokedAt: null
            },
            data: {
                revokedAt: expect.any(Date)
            }
        });
    });
});


describe("login", () => {

    // Login test number 1
    test("should throw an error if user does not exist", async () => {

        prisma.user.findUnique.mockResolvedValue(null);

        await expect(
            authService.login({
                email: "test@test.com",
                password: "12345678"
            })
        ).rejects.toThrow("Credenciales inválidas");

    });

    // Login test number 2
    test("should throw an error if password is incorrect", async () => {

        prisma.user.findUnique.mockResolvedValue({
            id: "1",
            email: "test@test.com",
            passwordHash: "hashedPassword"
        });

        bcrypt.compare.mockResolvedValue(false);

        await expect(
            authService.login({
                email: "test@test.com",
                password: "wrongPassword"
            })
        ).rejects.toThrow("Credenciales inválidas");

    });

    // Login test number 3
    test("should login successfully and return access and refresh tokens", async () => {

        prisma.user.findUnique.mockResolvedValue({
            id: "1",
            email: "test@test.com",
            passwordHash: "hashedPassword"
        });

        bcrypt.compare.mockResolvedValue(true);

        jwt.sign
            .mockReturnValueOnce("accessToken")
            .mockReturnValueOnce("refreshToken");

        jwt.decode.mockReturnValue({
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
        });

        const result = await authService.login({
            email: "test@test.com",
            password: "12345678"
        });

        expect(jwt.sign).toHaveBeenCalledTimes(2);

        expect(prisma.refreshToken.create).toHaveBeenCalled();

        expect(result).toEqual({
            accessToken: "accessToken",
            refreshToken: "refreshToken"
        });

    });


});