import { DataTypes } from "@sequelize/core";
import sequelize from "../config/db.js";

const Customer = sequelize.define(
  "Customer",
  {
    idClientes: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    razon_social: {
      type: DataTypes.STRING(245),
      allowNull: false,
    },
    nombre_comercial: {
      type: DataTypes.STRING(345),
      allowNull: false,
    },
    direccion_entrega: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    correo_electronico: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
  },
  { tableName: "Clientes", timestamps: false }
);

export default Customer;
