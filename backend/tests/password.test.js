jest.mock("bcrypt", () => ({
    hash: jest.fn(),
    compare: jest.fn()
}));

const bcrypt = require("bcrypt");
const {
    hashPassword,
    comparePassword
} = require("../src/utils/password");

beforeEach(() => {
    jest.clearAllMocks();
});

test("hashPassword delega el hash con diez rondas", async () => {
    bcrypt.hash.mockResolvedValue("hashed-password");

    await expect(hashPassword("original-password"))
        .resolves.toBe("hashed-password");

    expect(bcrypt.hash).toHaveBeenCalledWith(
        "original-password",
        10
    );
});

test("comparePassword devuelve el resultado de bcrypt", async () => {
    bcrypt.compare.mockResolvedValue(true);

    await expect(
        comparePassword("original-password", "hashed-password")
    ).resolves.toBe(true);

    expect(bcrypt.compare).toHaveBeenCalledWith(
        "original-password",
        "hashed-password"
    );
});
