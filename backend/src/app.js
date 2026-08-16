const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const errorMilddleware = require("./middlewares/error.middleware");
const cookieParser = require("cookie-parser");

const app = express();

const allowedOrigin =
    process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));

app.use(cookieParser());

app.use(express.json());

app.use("/api", routes);

app.use(errorMilddleware)

module.exports = app;