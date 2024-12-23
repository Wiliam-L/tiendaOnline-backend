import sequelize from "../config/db.js";
import { DataTypes } from "@sequelize/core";

const State = sequelize.define(
  "State",
  {
    idestados: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(45),
      unique: true,
      allowNull: false,
    },
  },
  {
    tableName: "estados",
    timestamps: false,
  }
);

export default State;
