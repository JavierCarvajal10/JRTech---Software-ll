import { apiRequest } from "./client";

export type ImportStatus =
  | "PENDIENTE"
  | "EN_PROCESO"
  | "COTIZADO"
  | "CERRADO"
  | "CANCELADO";

export const IMPORT_STATUSES: ImportStatus[] = [
  "PENDIENTE",
  "EN_PROCESO",
  "COTIZADO",
  "CERRADO",
  "CANCELADO",
];

export const IMPORT_STATUS_LABELS: Record<ImportStatus, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  COTIZADO: "Cotizado",
  CERRADO: "Cerrado",
  CANCELADO: "Cancelado",
};

export interface ImportProductoRef {
  id: number;
  nombre: string;
  imagenes?: { id: number; url: string }[];
}

export interface ImportRequest {
  id: number;
  nombre: string;
  telefono: string;
  email: string | null;
  producto: string;
  enlaceReferencia: string | null;
  descripcion: string | null;
  cantidad: number | null;
  presupuesto: string | number | null;
  ciudad: string | null;
  comoNosConocio: string | null;
  estado: ImportStatus;
  productoId: number | null;
  productoRef: ImportProductoRef | null;
  fechaCreacion: string;
}

export interface SubmitImportInput {
  nombre: string;
  telefono: string;
  email?: string;
  producto: string;
  enlaceReferencia?: string;
  descripcion?: string;
  cantidad?: number;
  presupuesto?: number;
  ciudad?: string;
  comoNosConocio?: string;
}

export const submitImport = async (input: SubmitImportInput): Promise<ImportRequest> => {
  const res = await apiRequest<{ data: ImportRequest }>("/api/importaciones", {
    method: "POST",
    body: input,
  });
  return res.data;
};

export interface SubmitBuilderInput {
  nombre: string;
  telefono: string;
  email?: string;
  ciudad?: string;
  notas?: string;
  productoIds: number[];
}

export interface BuilderSubmitResult {
  message: string;
  records: ImportRequest[];
}

export const submitImportsFromBuilder = async (
  input: SubmitBuilderInput
): Promise<BuilderSubmitResult> => {
  const res = await apiRequest<{ message: string; data: ImportRequest[] }>(
    "/api/importaciones/from-builder",
    { method: "POST", body: input }
  );
  return { message: res.message, records: res.data };
};

export const listImports = async (estado?: ImportStatus): Promise<ImportRequest[]> => {
  const query = estado ? `?estado=${estado}` : "";
  const res = await apiRequest<{ data: ImportRequest[] }>(`/api/importaciones${query}`);
  return res.data;
};

export const fetchImport = async (id: number): Promise<ImportRequest> => {
  const res = await apiRequest<{ data: ImportRequest }>(`/api/importaciones/${id}`);
  return res.data;
};

export const updateImportStatus = async (
  id: number,
  estado: ImportStatus
): Promise<ImportRequest> => {
  const res = await apiRequest<{ data: ImportRequest }>(
    `/api/importaciones/${id}/estado`,
    {
      method: "PATCH",
      body: { estado },
    }
  );
  return res.data;
};

export const deleteImport = async (id: number): Promise<void> => {
  await apiRequest(`/api/importaciones/${id}`, { method: "DELETE" });
};
