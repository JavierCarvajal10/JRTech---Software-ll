import db from "../config/database.js";


export const findUserByEmail = async (email) => {
  return await db.Usuario.findUnique({
    where: { email },
  });
};

export const createUser = async (data) => {
  return await db.Usuario.create({
    data,
  });
};