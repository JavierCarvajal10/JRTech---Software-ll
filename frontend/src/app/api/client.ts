const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

export class ApiError extends Error {
  status?: number;
  code?: string;
  isNetworkError: boolean;

  constructor(message: string, opts: { status?: number; code?: string; isNetworkError?: boolean } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.isNetworkError = opts.isNetworkError ?? false;
  }
}

const NETWORK_ERROR_MESSAGE = "No pudimos conectarnos al servidor. Revisa tu conexión o inténtalo más tarde.";
const SERVER_ERROR_MESSAGE = "Algo salió mal en nuestro servidor. Inténtalo más tarde.";

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      // Envía y recibe la cookie httpOnly del backend (cross-site).
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE, {
      code: "NETWORK_ERROR",
      isNetworkError: true,
    });
  }

  if (!response.ok) {
    let serverMessage: string | undefined;
    let code: string | undefined;
    try {
      const data = await response.json();
      serverMessage = typeof data.message === "string" ? data.message : undefined;
      code = data.code;
    } catch {
      // body no es JSON
    }

    const isServerSide = response.status >= 500;
    const message =
      serverMessage && !isServerSide
        ? serverMessage
        : isServerSide
        ? SERVER_ERROR_MESSAGE
        : serverMessage ?? `Error ${response.status}`;

    throw new ApiError(message, { status: response.status, code });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Devuelve un mensaje listo para mostrar al usuario a partir de cualquier error.
 */
export function friendlyErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) {
    if (err.message === "Failed to fetch" || err.message.includes("NetworkError")) {
      return NETWORK_ERROR_MESSAGE;
    }
    return err.message;
  }
  return "Algo salió mal. Inténtalo más tarde.";
}
