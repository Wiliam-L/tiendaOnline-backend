import { DataTypes } from "@sequelize/core";
import sequelize from "../config/db";

const Usuario = sequelize.define(
  "Usuario",
  {
    idusuarios: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estados_idestados: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correo_electronico: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
    nombre_completo: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    Clientes_idClientes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "usuarios",
    timestamps: false,
  }
);

export default Usuario;
