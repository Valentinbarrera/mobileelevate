import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, ArrowLeft, Loader2, Shield, CheckCircle } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Email inválido");

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    
    setLoading(true);
    setError(undefined);

    try {
      const redirectUrl = `${window.location.origin}/update-password`;
      
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        toast.error(resetError.message);
        return;
      }

      setEmailSent(true);
      toast.success("Email enviado. Revisá tu bandeja de entrada.");
    } catch (error) {
      toast.error("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-30" />
        
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-3">
              Revisa tu Email
            </h1>
            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
              Enviamos un enlace de recuperación a <span className="text-foreground font-medium">{email}</span>
            </p>
            <Button
              onClick={() => navigate("/auth")}
              variant="outline"
              className="rounded-2xl h-12 px-8"
            >
              Volver a Login
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Atmospheric gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-30" />
      
      <div className="relative z-10 flex-1 flex flex-col px-6 pt-6 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate("/auth")}
            className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        </motion.div>

        {/* Title */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black text-foreground leading-tight">
            RECUPERAR
          </h1>
          <h1 className="text-3xl font-black leading-tight">
            <span className="text-gradient-primary italic">CONTRASEÑA</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={`relative rounded-2xl border transition-all duration-300 ${
              focusedField === "email" 
                ? "border-primary glow-primary-sm bg-card" 
                : "border-border/50 bg-card/50"
            }`}>
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(undefined);
                }}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="Email"
                className={`pl-12 h-14 rounded-2xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                  error ? "text-destructive" : ""
                }`}
                required
              />
            </div>
            {error && (
              <p className="text-xs text-destructive pl-4">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-sm tracking-widest glow-primary"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "ENVIAR ENLACE"
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <button
            onClick={() => navigate("/auth")}
            className="w-full text-center text-sm text-muted-foreground mt-6"
          >
            ¿Recordás tu contraseña? <span className="font-bold text-foreground">Iniciar sesión</span>
          </button>
        </motion.div>

        {/* Security Badge */}
        <motion.div 
          className="flex items-center justify-center gap-2 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground tracking-wider">ENLACE SEGURO</span>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
