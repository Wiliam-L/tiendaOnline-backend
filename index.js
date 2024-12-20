import sequelize from "./app/config/db.js";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import registerUser from "./app/routers/registerRoutes.js";
import createProducts from "./app/routers/productRoutes.js";
import login from "./app/routers/loginRoutes.js";
import getNewToken from "./app/routers/refreshTokenRoutes.js";
import {
  createOperatorAutomatic,
  createRolesAutomatic,
  createStateAutomatic,
} from "./app/controller/autoCreationController.js";
import { getCreateAtomatic, updateData } from "./app/utils/fileUtils.js";
import { createRol } from "./app/controller/rolController.js";
import errorHandler from "./app/middleware/errorHandle.js";

const app = express();
dotenv.config();

sequelize
  .authenticate()
  .then(() => {
    console.log("Conexión exitosa con la base de datos");
  })
  .catch((error) => {
    console.log("Error al conectar con la base de datos", error);
  });

//Middleware para parsear JSON
app.use(express.json());
app.use(cookieParser());

//usar puerto desde .env o uno por defecto
const PORT = process.env.PORT || 3000;

/**
 * Al iniciar el servidor el operador se creará
 * automáticamente si CREATE_AUTOMATIC es TRUE en el archivo .env
 *
 * Operador para acceder al sistema
 *
 */
const status = await getCreateAtomatic();
if (status === "TRUE") {
  (async () => {
    try {
      const role = await createRolesAutomatic(status);
      const state = await createStateAutomatic(status);
      const operator = await createOperatorAutomatic(status);
      await updateData("CREATE_AUTOMATIC=FALSE");
    } catch (error) {
      console.error(
        "Error al crear datos iniciales: (operador, rol, estados)",
        error
      );
    }
  })();
}

//Endpoints para usuario
app.use("/api", registerUser);
app.use("/api", login);
app.use("/api", getNewToken);

//Enpoints para rol
app.use("/api", createRol);

//Enpoints productos
app.use("/api", createProducts);

app.patch("/update/products/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
});

//Enpoints para categorias
app.post("/create/categories/", (req, res) => {
  const data = req.body;
});

app.patch("/update/categories/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
});

//Enpoint para rol
app.post("/create/rol/", (req, res) => {
  const { id } = req.params;
  const data = req.body;
});

app.post("/update/rol/:id", (req, res) => {
  const data = req.body;
});

app.patch("/update/users/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
});

//Enpoints para estados
app.post("/create/states/", (req, res) => {
  const data = req.body;
});

app.patch("/update/states/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
});

//Enpoints para Orden
app.post("/create/orders/", (req, res) => {
  const data = req.body;
});

app.patch("/update/orders/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
});

//Enpoints para ordenDetalle
app.post("/create/order-details/", (req, res) => {
  const data = req.body;
});

app.patch("/update/order-details/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
});

//Enpoints para clientes
app.post("/create/clients/", (req, res) => {
  const data = req.body;
});

app.patch("/update/clients/:id", (req, res) => {
  const { id } = req.params;
  const data = req.body;
});

//middleware para errores
app.use(errorHandler);

//iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en el Puerto ${PORT}`);
});

// Cerrar conexión al finalizar
process.on("SIGINT", async () => {
  await sequelize.close();
  console.log("Conexión a la base de datos cerrada");
  process.exit(0);
});
