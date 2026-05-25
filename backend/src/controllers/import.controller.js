import {
  listImports,
  getImport,
  submitImport,
  submitImportFromBuilder,
  changeImportStatus,
  removeImport,
} from "../services/import.service.js";

export const list = async (req, res) => {
  try {
    const { estado } = req.query;
    const imports = await listImports(estado ? { estado } : {});
    res.status(200).json({ data: imports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const imp = await getImport(req.params.id);
    res.status(200).json({ data: imp });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const submit = async (req, res) => {
  try {
    const imp = await submitImport(req.body);
    res.status(201).json({
      message: "Solicitud de importación enviada correctamente",
      data: imp,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const submitFromBuilder = async (req, res) => {
  try {
    const records = await submitImportFromBuilder(req.body);
    res.status(201).json({
      message: `Generamos ${records.length} solicitud(es) de cotización. Te contactaremos por WhatsApp pronto.`,
      data: records,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const imp = await changeImportStatus(req.params.id, req.body.estado);
    res.status(200).json({
      message: "Estado actualizado",
      data: imp,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    await removeImport(req.params.id);
    res.status(200).json({ message: "Solicitud eliminada" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
