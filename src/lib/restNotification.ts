/**
 * Notificación local de "fin de descanso" para que suene/vibre aunque la app
 * esté en segundo plano o con la pantalla bloqueada (el timer JS se suspende
 * en background; esto NO). Usa @capacitor/local-notifications.
 *
 * Se programa al iniciar el descanso y se cancela al saltar/terminar en pantalla
 * (así, si el usuario está mirando la app, el aviso in-app la cancela y no se
 * duplica; si la pantalla está bloqueada, el JS no corre y la notificación sí).
 */
import { LocalNotifications } from "@capacitor/local-notifications";

const REST_NOTIF_ID = 8801;
let permissionAsked = false;

async function ensurePermission(): Promise<boolean> {
  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display === "granted") return true;
    if (status.display === "denied") return false;
    if (permissionAsked) return false;
    permissionAsked = true;
    const req = await LocalNotifications.requestPermissions();
    return req.display === "granted";
  } catch {
    return false; // web u otro entorno sin el plugin
  }
}

/** Programa el aviso de fin de descanso a `seconds` desde ahora. */
export async function scheduleRestEnd(seconds: number) {
  if (!seconds || seconds <= 0) return;
  try {
    if (!(await ensurePermission())) return;
    await LocalNotifications.schedule({
      notifications: [
        {
          id: REST_NOTIF_ID,
          title: "¡Descanso terminado! 💪",
          body: "Es hora de la próxima serie.",
          schedule: { at: new Date(Date.now() + seconds * 1000), allowWhileIdle: true },
        },
      ],
    });
  } catch {
    /* plugin no disponible (web) — no pasa nada */
  }
}

/** Cancela el aviso pendiente (al saltar, terminar o desmontar el timer). */
export async function cancelRestEnd() {
  try {
    await LocalNotifications.cancel({ notifications: [{ id: REST_NOTIF_ID }] });
  } catch {
    /* no-op */
  }
}
