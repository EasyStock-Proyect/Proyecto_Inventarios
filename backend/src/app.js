const express = require("express");
const routes = require("./routes");
const cors = require("cors");
const errorMilddleware = require("./middlewares/error.middleware");

const app = express();
app.use(cors())

app.use(express.json());

app.use("/api", routes);

app.use(errorMilddleware)

module.exports = app;