import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Loader2 } from "lucide-react";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [mustChange, setMustChange] = useState(false);
  const [checking, setChecking] = useState(true);

  // Dos formas legítimas de llegar acá:
  //  1. el link de "recuperar contraseña" del email (evento PASSWORD_RECOVERY)
  //  2. el primer login con la contraseña temporal que le dio el coach
  //     (flag must_change_password en el user_metadata)
  // Cualquier otra cosa se rebota.
  useEffect(() => {
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoverySession(true);
        setChecking(false);
      }
    });

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (data.user?.user_metadata?.must_change_password) {
        setMustChange(true);
        setIsRecoverySession(true);
        setChecking(false);
      }
      // Si no da acceso NO cortamos el chequeo: dejamos que decida el timer,
      // así no le ganamos de mano al evento PASSWORD_RECOVERY.
    });

    // Si en 1,5s no se habilitó por ninguna de las dos vías, salimos.
    const timer = setTimeout(() => setChecking(false), 1500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!checking && !isRecoverySession) {
      toast.error("Acceso inválido. Usá el link del email para cambiar tu contraseña.");
      navigate("/reset-password", { replace: true });
    }
  }, [checking, isRecoverySession, navigate]);

  // Mientras el alumno no elija su propia contraseña, el guard de las rutas lo
  // sigue trayendo acá, así que no hay forma de saltear el paso.

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      // Bajamos el flag en el mismo request: si quedara prendido, el guard lo
      // volvería a mandar acá para siempre.
      const { error } = await supabase.auth.updateUser({
        password,
        data: { must_change_password: false },
      });

      if (error) throw error;

      // Refrescamos la sesión ANTES de navegar: si el contexto todavía tuviera
      // el flag viejo, el guard nos rebotaría de vuelta a esta pantalla.
      await supabase.auth.refreshSession();

      toast.success("Contraseña actualizada correctamente");
      navigate("/", { replace: true });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {mustChange ? "Elegí tu contraseña" : "Nueva contraseña"}
        </h1>
        <p className="text-foreground/70 text-base mb-8">
          {mustChange
            ? "Tu coach te dio una contraseña temporal. Poné una tuya para terminar de activar la cuenta."
            : "Ingresá tu nueva contraseña."}
        </p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="relative rounded-2xl border border-border/50 bg-card/50">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="pl-12 h-14 rounded-2xl bg-transparent border-0 focus-visible:ring-0"
              required
            />
          </div>
          <div className="relative rounded-2xl border border-border/50 bg-card/50">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              className="pl-12 h-14 rounded-2xl bg-transparent border-0 focus-visible:ring-0"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Actualizar contraseña"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdatePassword;
