import sequelize from "./db.js";
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("conectado");
    return true;
  } catch (error) {
    console.log("error al conectar: ", error);
    return false;
  }
};

testConnection();
