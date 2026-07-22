const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

jest.mock("../src/config/prisma", () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn()
    }
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

    const result = await authService.login({
        email: "test@test.com",
        password: "12345678"
    });

    expect(jwt.sign).toHaveBeenCalledTimes(2);

    expect(result).toEqual({
        accessToken: "accessToken",
        refreshToken: "refreshToken"
    });

    });


});