import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, ArrowLeft, Loader2, Shield, CheckCircle } from "lucide-react";
import { z } from "zod";

const passwordSchema = z.string().min(6, "Mínimo 6 caracteres");

const UpdatePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user came from a password reset email
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");
    
    if (accessToken && type === "recovery") {
      // Token is automatically handled by Supabase client
      supabase.auth.getSession();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    setLoading(true);
    setError(undefined);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        toast.error(updateError.message);
        return;
      }

      setSuccess(true);
      toast.success("Contraseña actualizada correctamente");
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      toast.error("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-black text-foreground mb-3">
              ¡Listo!
            </h1>
            <p className="text-muted-foreground mb-4">
              Tu contraseña fue actualizada correctamente.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirigiendo...
            </p>
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
            NUEVA
          </h1>
          <h1 className="text-3xl font-black leading-tight">
            <span className="text-gradient-primary italic">CONTRASEÑA</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Ingresá tu nueva contraseña. Debe tener al menos 6 caracteres.
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
              focusedField === "password" 
                ? "border-primary glow-primary-sm bg-card" 
                : "border-border/50 bg-card/50"
            }`}>
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(undefined);
                }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="Nueva contraseña"
                className="pl-12 h-14 rounded-2xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                required
              />
            </div>

            <div className={`relative rounded-2xl border transition-all duration-300 ${
              focusedField === "confirm" 
                ? "border-primary glow-primary-sm bg-card" 
                : "border-border/50 bg-card/50"
            }`}>
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(undefined);
                }}
                onFocus={() => setFocusedField("confirm")}
                onBlur={() => setFocusedField(null)}
                placeholder="Confirmar contraseña"
                className="pl-12 h-14 rounded-2xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
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
                "ACTUALIZAR CONTRASEÑA"
              )}
            </Button>
          </form>
        </motion.div>

        {/* Security Badge */}
        <motion.div 
          className="flex items-center justify-center gap-2 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground tracking-wider">AES-256 ENCRYPTED</span>
        </motion.div>
      </div>
    </div>
  );
};

export default UpdatePassword;
