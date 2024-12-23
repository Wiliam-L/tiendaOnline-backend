import sequelize from "./app/config/db.js";
import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./app/routers/userRoutes.js";
import authRoutes from "./app/routers/authRoutes.js";
import createProducts from "./app/routers/productRoutes.js";
import rolRoutes from "./app/routers/rolRoutes.js";
import stateRoutes from "./app/routers/stateRoutes.js";
import categoryRouter from "./app/routers/categoryRouter.js";
import { createSystemData } from "./app/controller/autoCreationController.js";
import { getCreateAtomatic, updateData } from "./app/utils/fileUtils.js";
import errorHandler from "./app/middleware/errorHandle.js";
import orderRouter from "./app/routers/orderRouter.js";

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
  try {
    await createSystemData(status);
  } catch (error) {
    console.log(
      "Error al crear datos iniciales: (operador, rol, estados)",
      error
    );
  }
}

//Endpoints para procesos de autenticación
app.use("/auth", authRoutes);

//Endpoints para usuario
app.use("/user", userRoutes);

//Enpoint para Orden
app.use("/api", orderRouter);

//Enpoints para rol
app.use("/api", rolRoutes);

//Enpoints productos
app.use("/api", createProducts);

//Enpoints para categorias
app.use("/api", categoryRouter);

//Enpoint para rol
app.use("/api", stateRoutes);

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
