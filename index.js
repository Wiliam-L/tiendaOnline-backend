import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import registerUser from "./app/routers/registerRoutes.js";
import createProducts from "./app/routers/productRoutes.js";
import login from "./app/routers/loginRoutes.js";
import getNewToken from "./app/routers/refreshTokenRoutes.js";
const app = express();
dotenv.config();

//Middleware para parsear JSON
app.use(express.json());
app.use(cookieParser());

//usar puerto desde .env o uno por defecto
const PORT = process.env.PORT || 3000;

//Endpoints para usuario
app.use("/api", registerUser);
app.use("/api", login);
app.use("/api", getNewToken);

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

app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en el Puerto ${PORT}`);
});
