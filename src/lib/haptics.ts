/**
 * Haptics (vibración) de la app.
 * `navigator.vibrate` es NO-OP en iOS/WKWebView, así que usamos
 * `@capacitor/haptics` (nativo) con fallback a `navigator.vibrate` en web.
 */
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/** Fallback web: vibra con `navigator.vibrate` si existe (no-op en iOS). */
function webVibrate(ms: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(ms);
    }
  } catch {
    /* ignorar: la vibración es best-effort */
  }
}

/** Impacto liviano: taps, ticks (ej. serie registrada, navegación). */
export function hapticLight() {
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => webVibrate(12));
}

/** Impacto medio: acciones importantes (ej. arranque de entrenamiento). */
export function hapticMedium() {
  Haptics.impact({ style: ImpactStyle.Medium }).catch(() => webVibrate(24));
}

/** Impacto fuerte: acciones destacadas. */
export function hapticHeavy() {
  Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => webVibrate(40));
}

/** Notificación de éxito: logros (ej. nuevo récord personal / PR). */
export function hapticSuccess() {
  Haptics.notification({ type: NotificationType.Success }).catch(() =>
    webVibrate([30, 40, 70])
  );
}
