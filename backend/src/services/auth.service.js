import { createUser, findUserByEmail } from "../repositories/auth.repository.js";
import { hashPassword, comparePassword  } from "../utils/hash.js";
import jwt from "jsonwebtoken";

export const registerUser = async (data) => {
  console.log("DATA:", data);

  const { email, password, primerNombre, primerApellido } = data;

  if (!email || !password || !primerNombre || !primerApellido) {
    throw new Error("Campos obligatorios");
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("Usuario ya existe");
  }

  const hashed = await hashPassword(password);

  return await createUser({
    email,
    contraseñaHash: hashed,
    primerNombre,
    primerApellido,
  });
};



export const loginUser = async (data) => {
  const { email, password } = data;

  
  if (!email || !password) {
    throw new Error("Campos obligatorios");
  }

  
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  
  const isValid = await comparePassword(password, user.contraseñaHash);

  if (!isValid) {
    throw new Error("Credenciales inválidas");
  }


  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      rol: user.rol,
    },
    "secretKey", 
    { expiresIn: "1h" }
  );


  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      primerNombre: user.primerNombre,
    },
  };
};