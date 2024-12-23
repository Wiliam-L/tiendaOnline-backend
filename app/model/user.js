import sequelize from "../config/db.js";
import { DataTypes } from "@sequelize/core";
import State from "./states.js";
import Rol from "./rol.js";
import Customer from "./customer.js";

const User = sequelize.define(
  "User",
  {
    idusuarios: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rol_idrol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Rol,
        key: "idrol",
      },
      onDelete: "NO ACTION",
    },
    estados_idestados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: State,
        key: "idestados",
      },
      onDelete: "NO ACTION",
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
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    fecha_nacimiento: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_creacion: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    Clientes_idClientes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Customer,
        key: "idClientes",
      },
      onDelete: "NO ACTION",
    },
  },
  { tableName: "usuarios", timestamps: false }
);

User.belongsTo(State, { foreignKey: "estados_idestados" });//N:1
State.hasMany(User, {foreignKey: "estados_idestados"})//1:N

User.belongsTo(Rol, { foreignKey: "rol_idrol" });//N:1
Rol.hasMany(User, {foreignKey: "rol_idrol"})//1:N

User.belongsTo(Customer, { foreignKey: "Clientes_idClientes" });//1:1
Customer.hasOne(User, {foreignKey: "Clientes_idClientes"}) //1:1

export default User;
