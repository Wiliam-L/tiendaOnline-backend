import multer from "multer";

//almacenar en memoria
const storage = multer.memoryStorage();
const getFile = multer({ storage });

export default getFile;
