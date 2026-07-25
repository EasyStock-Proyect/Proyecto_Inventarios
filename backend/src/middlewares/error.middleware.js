const errorMiddleware = (err, req, res, next) => {

    console.error({
        timestamp: new Date().toISOString(),
        route: req.originalUrl,
        method: req.method,
        userId: req.user?.id || null,
        message: err.message
    });

    let status = err.status || 500;

    if (
        err.message === "Credenciales inválidas" ||
        err.message === "Token inválido." ||
        err.message === "Token expirado o inválido."
    ) {
        status = 401;
    }

    if (
        err.message === "El email ya está registrado" ||
        err.message === "La contraseña debe tener mínimo 8 caracteres"
    ) {
        status = 400;
    }

    res.status(status).json({
        message:
            status === 500
                ? "Error interno del servidor."
                : err.message
    });

};

module.exports = errorMiddleware;