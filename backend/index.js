require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});
