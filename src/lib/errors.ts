type ErrorWithMessage = {
  message?: string;
  code?: string;
};

export const getUserErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const e = (error || {}) as ErrorWithMessage;
  const message = (e.message || "").toLowerCase();

  if (message.includes("failed to fetch") || message.includes("network")) {
    return "No se pudo conectar a internet. Intentá nuevamente.";
  }

  if (e.code === "401" || message.includes("unauthorized")) {
    return "Tu sesión venció. Volvé a iniciar sesión.";
  }

  if (e.code === "403" || message.includes("permission") || message.includes("forbidden")) {
    return "No tenés permisos para realizar esta acción.";
  }

  if (e.code === "PGRST116" || message.includes("not found")) {
    return "No se encontraron datos para esta operación.";
  }

  if (message.includes("duplicate key") || message.includes("unique")) {
    return "Ya existe un registro con esos datos.";
  }

  return fallback;
};
