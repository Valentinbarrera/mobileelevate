import { Capacitor } from "@capacitor/core";
import { PushNotifications, type Token } from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";

/**
 * Notificaciones push nativas (iOS/Android vía Capacitor).
 *
 * Solo corre en dispositivo real: en la web el plugin no existe, así que
 * `initPushNotifications()` es un no-op y no rompe el build ni el preview.
 *
 * Flujo: pide permiso → registra en APNs/FCM → recibe el device token →
 * lo guarda en la tabla `device_tokens` (vinculada por email, igual que el
 * resto del modelo). Con ese token el backend del coach puede enviar avisos
 * (nueva rutina, feedback, mensaje).
 *
 * Requiere correr una vez `scripts/setup-push-tokens.sql` en Supabase.
 */

let initialized = false;

export async function initPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  if (initialized) return;
  initialized = true;

  try {
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== "granted") return;

    // Idempotente: limpiamos listeners viejos antes de registrar de nuevo.
    await PushNotifications.removeAllListeners();

    await PushNotifications.addListener("registration", (token: Token) => {
      void saveDeviceToken(token.value);
    });
    await PushNotifications.addListener("registrationError", (err) => {
      console.warn("[push] registrationError", err);
    });

    await PushNotifications.register();
  } catch (e) {
    console.warn("[push] init failed", e);
  }
}

async function saveDeviceToken(token: string): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (!email) return;

    // `device_tokens` no está en los tipos generados → cliente casteado.
    const client = supabase as unknown as {
      from: (t: string) => {
        upsert: (
          v: Record<string, unknown>,
          o?: { onConflict?: string }
        ) => Promise<{ error: { message: string } | null }>;
      };
    };

    await client
      .from("device_tokens")
      .upsert(
        { token, email, platform: Capacitor.getPlatform() },
        { onConflict: "token" }
      );
  } catch (e) {
    console.warn("[push] saveDeviceToken failed", e);
  }
}
