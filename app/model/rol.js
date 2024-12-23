import sequelize from "../config/db.js";
import { DataTypes } from "@sequelize/core";

const Rol = sequelize.define(
  "Rol",
  {
    idrol: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: "rol",
    timestamps: false,
  }
);

export default Rol;
