import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2, Shield, AlertCircle } from "lucide-react";
import { NOT_A_STUDENT_ERROR } from "@/hooks/useStudentAuth";
import { z } from "zod";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Mínimo 6 caracteres");

const Auth = () => {
  const navigate = useNavigate();
  const { error: authError, isAuthenticated } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email o contraseña incorrectos");
        } else {
          toast.error(error.message);
        }
      }
      // Navigation handled by useEffect on isAuthenticated
    } catch {
      toast.error("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Show "not a student" error prominently — user is authenticated but not in students table
  const isNotStudentError = authError === NOT_A_STUDENT_ERROR;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-30" />
      
      <div className="relative z-10 flex-1 flex flex-col px-6 pt-16 pb-8">
        {/* Logo */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black tracking-[0.2em] text-foreground italic">ELEVATE</h1>
          <div className="w-12 h-1 bg-gradient-primary mx-auto mt-2 rounded-full" />
        </motion.div>

        {/* "Not a student" error state */}
        {isNotStudentError && (
          <motion.div
            className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-500 mb-1">Cuenta no vinculada</p>
              <p className="text-xs text-amber-500/80">{NOT_A_STUDENT_ERROR}</p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={`relative rounded-2xl border transition-all duration-300 ${
              focusedField === "email" ? "border-primary glow-primary-sm bg-card" : "border-border/50 bg-card/50"
            }`}>
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: undefined })); }}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="Email"
                className={`pl-12 h-14 rounded-2xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.email ? "text-destructive" : ""}`}
                required
              />
            </div>
            {errors.email && <p className="text-xs text-destructive pl-4">{errors.email}</p>}

            <div className={`relative rounded-2xl border transition-all duration-300 ${
              focusedField === "password" ? "border-primary glow-primary-sm bg-card" : "border-border/50 bg-card/50"
            }`}>
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: undefined })); }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="Contraseña"
                className={`pl-12 h-14 rounded-2xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${errors.password ? "text-destructive" : ""}`}
                required
              />
            </div>
            {errors.password && <p className="text-xs text-destructive pl-4">{errors.password}</p>}

            <button
              type="button"
              onClick={() => navigate("/reset-password")}
              className="text-sm text-muted-foreground text-center w-full hover:text-primary transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-sm tracking-widest glow-primary"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>ENTRAR AL HUB</span><ArrowRight className="w-5 h-5 ml-2" /></>}
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

export default Auth;
