const errorMiddleware =
    require("../src/middlewares/error.middleware");

beforeEach(() => {
    jest.spyOn(console, "error")
        .mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

function response() {

    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

test("debe retornar 500 por defecto", () => {

    const error = new Error("Error desconocido");

    const req = {
        originalUrl: "/api/test",
        method: "GET",
        user: undefined
    };

    const res = response();

    errorMiddleware(error, req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
        message: "Error interno del servidor."
    });
});

test("Credenciales inválidas debe retornar 401", () => {

    const error =
        new Error("Credenciales inválidas");

    const res = response();

    errorMiddleware(
        error,
        {
            originalUrl: "/login",
            method: "POST"
        },
        res,
        jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
        message: "Credenciales inválidas"
    });
});

test("Token inválido debe retornar 401", () => {

    const error =
        new Error("Token inválido.");

    const res = response();

    errorMiddleware(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
});

test("Token expirado debe retornar 401", () => {

    const error =
        new Error("Token expirado o inválido.");

    const res = response();

    errorMiddleware(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
});

test("email duplicado debe retornar 400", () => {

    const error =
        new Error("El email ya está registrado");

    const res = response();

    errorMiddleware(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
});

test("contraseña corta debe retornar 400", () => {

    const error =
        new Error(
            "La contraseña debe tener mínimo 8 caracteres"
        );

    const res = response();

    errorMiddleware(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
});

test("debe respetar status personalizado", () => {

    const error = new Error("Stock negativo");
    error.status = 422;

    const res = response();

    errorMiddleware(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(422);

    expect(res.json).toHaveBeenCalledWith({
        message: "Stock negativo"
    });
});