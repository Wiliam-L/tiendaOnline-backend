import sequelize from "../config/db.js";
import Category from "./category.js";
import User from "./user.js";
import State from "./states.js";
import { DataTypes } from "@sequelize/core";

const Product = sequelize.define(
  "Product",
  {
    idProductos: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    CategoriaProductos_idCategoriaProductos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category,
        key: "idCategoriaProductos",
      },
      onDelete: "NO ACTION",
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
    },
    marca: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    codigo: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
    stock: {
      type: DataTypes.FLOAT,
      allowNull: false,
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
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    foto: {
      type: DataTypes.BLOB,
      allowNull: false,
    },
  },
  {
    tableName: "Productos",
    timestamps: false,
  }
);

Product.belongsTo(Category, {
  foreignKey: "CategoriaProductos_idCategoriaProductos",
  as: "CategoriaProductos",
});
Category.hasMany(Product, {
  foreignKey: "CategoriaProductos_idCategoriaProductos",
  as: "productos",
});

Product.belongsTo(User, {
  foreignKey: "usuarios_idusuarios",
  as: "usuario",
});
User.hasMany(Product, {
  foreignKey: "usuarios_idusuarios",
  as: "productos",
});

Product.belongsTo(State, {
  foreignKey: "estados_idestados",
  as: "estado",
});
State.hasMany(Product, {
  foreignKey: "estados_idestados",
  as: "productos",
});

export default Product;
