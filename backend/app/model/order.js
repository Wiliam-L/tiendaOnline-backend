import User from "./user.js";
import State from "./states.js";
import Product from "./product.js";
import sequelize from "../config/db.js";
import { DataTypes } from "@sequelize/core";

export const OrdenDetalles = sequelize.define(
  "OrdenDetalles",
  {
    idOrdenDetalles: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Orden_idOrden: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Productos_idProductos: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "OrdenDetalles",
    timestamps: false,
  }
);

export const Orden = sequelize.define(
  "Orden",
  {
    idOrden: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuarios_idusuarios: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    estados_idestados: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    nombre_completo: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING(545),
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    correo_electronico: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    fecha_entrega: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    total_orden: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "Orden",
    timestamps: false,
  }
);

Orden.belongsTo(User, {
  foreignKey: {
    name: "usuarios_idusuarios",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  },
  as: "usuario",
});

Orden.belongsTo(State, {
  foreignKey: {
    name: "estados_idestados",
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  },
  as: "estado",
});

Orden.hasMany(OrdenDetalles, {
  foreignKey: {
    name: "Orden_idOrden",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  as: "detalles",
});

OrdenDetalles.belongsTo(Orden, {
  foreignKey: {
    name: "Orden_idOrden",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  as: "orden",
});

OrdenDetalles.belongsTo(Product, {
  foreignKey: {
    name: "Productos_idProductos",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  as: "producto",
});
