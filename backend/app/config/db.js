import { Sequelize } from "@sequelize/core";
import { MsSqlDialect } from "@sequelize/mssql";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize({
  dialect: MsSqlDialect,
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_HOSTPORT || 1433, 10),
  database: process.env.DB_NAME_DATABASE,
  authentication: {
    type: process.env.DB_TYPE_AUTHENTICATION,
    options: {
      userName: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    },
  },
  encrypt: process.env.DB_ENCRYPT.toLowerCase() === "true",
});

export default sequelize;
