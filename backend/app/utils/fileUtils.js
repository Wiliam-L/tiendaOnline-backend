import { readFile, writeFile } from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "app", "config", "config.txt");

export const getCreateAtomatic = async () => {
  try {
    const data = await readFile(filePath, "utf-8");
    return data.split("=")[1];
  } catch (error) {
    return false;
  }
};

export const updateData = async (data) => {
  try {
    await writeFile(filePath, data, "utf-8");
    return true;
  } catch (error) {
    return false;
  }
};
