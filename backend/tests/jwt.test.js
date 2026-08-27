jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
    verify: jest.fn()
}));

jest.mock("crypto", () => ({
    randomUUID: jest.fn()
}));

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken
} = require("../src/utils/jwt");

beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "access-secret";
    process.env.JWT_REFRESH_SECRET = "refresh-secret";
});

test("genera access token con claims y expiracion de una hora", () => {
    jwt.sign.mockReturnValue("access-token");

    const result = generateAccessToken({
        id: "user1",
        email: "test@test.com"
    });

    expect(result).toBe("access-token");
    expect(jwt.sign).toHaveBeenCalledWith(
        { id: "user1", email: "test@test.com" },
        "access-secret",
        { expiresIn: "1h" }
    );
});

test("genera refresh token con jti y expiracion de siete dias", () => {
    crypto.randomUUID.mockReturnValue("uuid-1");
    jwt.sign.mockReturnValue("refresh-token");

    const result = generateRefreshToken({ id: "user1" });

    expect(result).toBe("refresh-token");
    expect(jwt.sign).toHaveBeenCalledWith(
        { id: "user1", jti: "uuid-1" },
        "refresh-secret",
        { expiresIn: "7d" }
    );
});

test("verifica access token con JWT_SECRET", () => {
    jwt.verify.mockReturnValue({ id: "user1" });

    expect(verifyToken("access-token")).toEqual({ id: "user1" });
    expect(jwt.verify).toHaveBeenCalledWith(
        "access-token",
        "access-secret"
    );
});

test("verifica refresh token con JWT_REFRESH_SECRET", () => {
    jwt.verify.mockReturnValue({ id: "user1", jti: "uuid-1" });

    expect(verifyRefreshToken("refresh-token")).toEqual({
        id: "user1",
        jti: "uuid-1"
    });
    expect(jwt.verify).toHaveBeenCalledWith(
        "refresh-token",
        "refresh-secret"
    );
});
