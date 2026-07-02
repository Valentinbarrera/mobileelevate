import { useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { initPushNotifications } from "@/lib/pushNotifications";

/**
 * Inicializa las push notifications nativas una vez que hay un alumno real
 * logueado (no en modo admin/demo). No renderiza nada. En web es un no-op.
 */
export default function PushInit() {
  const { isAuthenticated, isAdminMode } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated && !isAdminMode) {
      void initPushNotifications();
    }
  }, [isAuthenticated, isAdminMode]);

  return null;
}
