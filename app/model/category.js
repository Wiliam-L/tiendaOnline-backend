import sequelize from "../config/db.js";
import { DataTypes } from "@sequelize/core";
import User from "../model/user.js";
import State from "../model/states.js";

const Category = sequelize.define(
  "Category",
  {
    idCategoriaProductos: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuarios_idusuarios: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "idusuarios",
      },
      onDelete: "NO ACTION",
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
    estados_idestados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: State,
        key: "idestados",
      },
    },
    fecha_creacion: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  },
  { tableName: "CategoriaProductos", timestamps: false }
);

Category.belongsTo(User, { foreignKey: "usuarios_idusuarios" });
User.hasMany(Category, { foreignKey: "usuarios_idusuarios" });
Category.belongsTo(State, { foreignKey: "estados_idestados" });
State.hasMany(Category, { foreignKey: "estados_idestados" });

export default Category;
