import { Capacitor } from "@capacitor/core";

/**
 * URL pública donde vive la app web.
 *
 * Los links que Supabase manda por mail (recuperar contraseña) tienen que
 * volver a una URL http(s) real. En iOS nativo `window.location.origin` es
 * `capacitor://localhost`: ni el mail puede abrirlo ni Supabase lo acepta como
 * redirect, así que el "olvidé mi contraseña" quedaba roto en el teléfono.
 */
const PROD_APP_URL = "https://mobileelevate-theta.vercel.app";

export function getAppOrigin(): string {
  const configured = import.meta.env.VITE_APP_URL as string | undefined;
  if (configured) return configured.replace(/\/$/, "");

  // En nativo el origin no sirve como destino de un mail.
  if (Capacitor.isNativePlatform()) return PROD_APP_URL;

  if (typeof window !== "undefined" && window.location.origin.startsWith("http")) {
    return window.location.origin;
  }

  return PROD_APP_URL;
}
