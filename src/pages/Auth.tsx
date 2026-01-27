import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Loader2, Apple, Shield } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Email inválido");
const passwordSchema = z.string().min(6, "Mínimo 6 caracteres");

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email o contraseña incorrectos");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("¡Bienvenido de vuelta!");
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const onboardingData = localStorage.getItem("onboarding_data");
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              display_name: name,
              onboarding: onboardingData ? JSON.parse(onboardingData) : null,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("Este email ya está registrado. Intentá iniciar sesión.");
          } else {
            toast.error(error.message);
          }
          return;
        }

        toast.success("¡Cuenta creada! Ya podés empezar a entrenar.");
      }
    } catch (error) {
      toast.error("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    // For now, show coming soon message
    toast.info(`Login con ${provider === "google" ? "Google" : "Apple"} próximamente`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Atmospheric gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] opacity-30" />
      
      <div className="relative z-10 flex-1 flex flex-col px-6 pt-16 pb-8">
        {/* Logo */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-black tracking-[0.2em] text-foreground italic">
            ELEVATE
          </h1>
          <div className="w-12 h-1 bg-gradient-primary mx-auto mt-2 rounded-full" />
        </motion.div>

        {/* Form */}
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div 
                className="relative"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
              >
                <div className={`relative rounded-2xl border transition-all duration-300 ${
                  focusedField === "name" 
                    ? "border-primary glow-primary-sm bg-card" 
                    : "border-border/50 bg-card/50"
                }`}>
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Tu nombre"
                    className="pl-12 h-14 rounded-2xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}

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
                  if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                }}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                placeholder="Email"
                className={`pl-12 h-14 rounded-2xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                  errors.email ? "text-destructive" : ""
                }`}
                required
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive pl-4">{errors.email}</p>
            )}

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
                  if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                placeholder="Contraseña"
                className={`pl-12 h-14 rounded-2xl bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                  errors.password ? "text-destructive" : ""
                }`}
                required
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive pl-4">{errors.password}</p>
            )}

            {isLogin && (
              <button 
                type="button" 
                onClick={() => navigate("/reset-password")}
                className="text-sm text-muted-foreground text-center w-full hover:text-primary transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-sm tracking-widest glow-primary"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? "ENTRAR AL HUB" : "CREAR CUENTA"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Social Login Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border/50" />
            <span className="text-xs text-muted-foreground tracking-wider">O ACCEDE CON</span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Social Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleSocialLogin("apple")}
              className="w-14 h-14 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:border-foreground/30 transition-all"
            >
              <Apple className="w-6 h-6 text-foreground" />
            </button>
            <button
              onClick={() => handleSocialLogin("google")}
              className="w-14 h-14 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:border-foreground/30 transition-all"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </button>
          </div>

          {/* Toggle Login/Signup */}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center text-sm text-muted-foreground mt-6"
          >
            {isLogin ? (
              <>¿No eres miembro? <span className="font-bold text-foreground">Crear cuenta</span></>
            ) : (
              <>¿Ya tienes cuenta? <span className="font-bold text-foreground">Iniciar sesión</span></>
            )}
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
          <span className="text-xs text-muted-foreground tracking-wider">AES-256 ENCRYPTED</span>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
