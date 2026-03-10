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
  const [checking, setChecking] = useState(true);

  // Only allow this page when arrived via a password recovery email link
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoverySession(true);
      }
      setChecking(false);
    });
    // If no PASSWORD_RECOVERY event fires within 1s, redirect away
    const timer = setTimeout(() => {
      setChecking(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!checking && !isRecoverySession) {
      toast.error("Acceso inválido. Usá el link del email para cambiar tu contraseña.");
      navigate("/reset-password", { replace: true });
    }
  }, [checking, isRecoverySession, navigate]);

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
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast.success("Contraseña actualizada correctamente");
      navigate("/");
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
        <h1 className="text-2xl font-bold text-foreground mb-2">Nueva contraseña</h1>
        <p className="text-muted-foreground text-sm mb-8">Ingresá tu nueva contraseña.</p>

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
