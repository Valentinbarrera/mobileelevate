import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setSent(true);
      toast.success("Email enviado. Revisá tu bandeja de entrada.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al enviar el email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-16">
      <button onClick={() => navigate(-1)} className="mb-8 text-muted-foreground">
        <ArrowLeft className="w-5 h-5" />
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground mb-2">Recuperar contraseña</h1>
        <p className="text-muted-foreground text-sm mb-8">
          {sent
            ? "Te enviamos un email con instrucciones para cambiar tu contraseña."
            : "Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña."}
        </p>

        {!sent ? (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="relative rounded-2xl border border-border/50 bg-card/50">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="pl-12 h-14 rounded-2xl bg-transparent border-0 focus-visible:ring-0"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar enlace"}
            </Button>
          </form>
        ) : (
          <Button
            onClick={() => navigate("/auth")}
            className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold"
          >
            Volver a Iniciar Sesión
          </Button>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
