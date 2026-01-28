/**
 * Pantalla de Login para conectarse al proyecto Coach
 * Usa las credenciales del alumno registrado en Elevate Coach
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Loader2, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCoachAuthContext } from "@/contexts/CoachAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CoachLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useCoachAuthContext();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    setIsLoading(false);
    
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email o contraseña incorrectos");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("¡Bienvenido!");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header decorativo */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
        >
          <div className="w-24 h-24 bg-card border-4 border-primary rounded-3xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Dumbbell className="w-10 h-10 text-primary" />
          </div>
        </motion.div>
      </div>

      {/* Contenido */}
      <div className="flex-1 px-6 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-black text-foreground mb-2">
            Elevate <span className="text-primary">Coach</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Ingresá con tu cuenta de alumno
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleLogin}
          className="space-y-4"
        >
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email
            </label>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-secondary/50 border-border focus:border-primary"
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-secondary/50 border-border focus:border-primary pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 bg-primary text-primary-foreground font-bold mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Iniciar Sesión
              </>
            )}
          </Button>
        </motion.form>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-secondary/30 rounded-xl border border-border"
        >
          <p className="text-xs text-muted-foreground text-center">
            Usá las mismas credenciales que te proporcionó tu coach para acceder a tus rutinas personalizadas.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default CoachLogin;
