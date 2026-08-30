const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const errorMilddleware = require("./middlewares/error.middleware");
const cookieParser = require("cookie-parser");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

const app = express();

const allowedOrigin =
    process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));

app.use(cookieParser());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api", routes);

const openApiPath = path.join(
    __dirname,
    "..",
    "..",
    "docs",
    "api",
    "openapi.yaml"
);

app.get("/api-docs/openapi.yaml", (req, res, next) => {
    res.sendFile(openApiPath, (error) => {
        if (error) {
            next(error);
        }
    });
});

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(null, {
        swaggerOptions: {
            url: "/api-docs/openapi.yaml"
        }
    })
);

app.use(errorMilddleware)

module.exports = app;