import {
  listUsers,
  promoteToAdmin,
  demoteToCliente,
  createAdminUser,
  updateProfile,
  changePassword,
  listMyAddresses,
  addMyAddress,
  updateMyAddress,
  removeMyAddress,
} from "../services/user.service.js";

export const list = async (req, res) => {
  try {
    const { rol } = req.query;
    const users = await listUsers(rol ? { rol } : {});
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const promote = async (req, res) => {
  try {
    const user = await promoteToAdmin(req.params.id);
    res.status(200).json({ message: "Usuario promovido a ADMIN", data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const demote = async (req, res) => {
  try {
    const user = await demoteToCliente(req.params.id, req.user.id);
    res.status(200).json({ message: "Usuario degradado a CLIENTE", data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMe = async (req, res) => {
  try {
    const updated = await updateProfile(req.user.id, req.body);
    res.status(200).json({ message: "Perfil actualizado", data: updated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({ message: "Contraseña actualizada" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const myAddresses = async (req, res) => {
  try {
    const data = await listMyAddresses(req.user.id);
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMyAddress = async (req, res) => {
  try {
    const data = await addMyAddress(req.user.id, req.body);
    res.status(201).json({ message: "Dirección agregada", data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMyAddressById = async (req, res) => {
  try {
    const data = await updateMyAddress(req.user.id, req.params.id, req.body);
    res.status(200).json({ message: "Dirección actualizada", data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMyAddress = async (req, res) => {
  try {
    await removeMyAddress(req.user.id, req.params.id);
    res.status(200).json({ message: "Dirección eliminada" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const user = await createAdminUser(req.body);
    res.status(201).json({ message: "Admin creado correctamente", data: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
