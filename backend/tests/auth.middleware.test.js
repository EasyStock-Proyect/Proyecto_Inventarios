jest.mock("../src/utils/jwt", () => ({
    veriffyToken: jest.fn()
}));

const { veriffyToken } =
    require("../src/utils/jwt");

const authMiddleware =
    require("../src/middlewares/auth.middleware");

beforeEach(() => {
    jest.clearAllMocks();
});

function response() {

    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

test("debe rechazar si no existe Authorization", () => {

    const req = {
        headers: {}
    };

    const res = response();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
        message: "Token no proporcionado."
    });

    expect(next).not.toHaveBeenCalled();
});

test("debe rechazar Authorization inválido", () => {

    const req = {
        headers: {
            authorization: "Basic abc"
        }
    };

    const res = response();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
        message: "Token inválido."
    });
});

test("debe rechazar Bearer sin token", () => {

    const req = {
        headers: {
            authorization: "Bearer"
        }
    };

    const res = response();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
});

test("debe aceptar token válido", () => {

    const req = {
        headers: {
            authorization: "Bearer token123"
        }
    };

    const res = response();
    const next = jest.fn();

    veriffyToken.mockReturnValue({
        id: "user1"
    });

    authMiddleware(req, res, next);

    expect(req.user).toEqual({
        id: "user1"
    });

    expect(next).toHaveBeenCalled();
});

test("debe rechazar token inválido", () => {

    const req = {
        headers: {
            authorization: "Bearer token123"
        }
    };

    const res = response();
    const next = jest.fn();

    veriffyToken.mockImplementation(() => {
        throw new Error("Invalid token");
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
        message: "Token expirado o inválido."
    });
});
