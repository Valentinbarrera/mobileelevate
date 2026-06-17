import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, Users, Utensils, Zap } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import heroImg from "@/assets/onboarding-hero.jpg";

const features = [
  { icon: Star,     label: "PLANES ÉLITE" },
  { icon: Users,    label: "COACH 1-A-1" },
  { icon: Utensils, label: "NUTRICIÓN PRO" },
];

const Welcome = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  // Already logged in → skip welcome
  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col">

      {/* ── Hero image ── */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Athlete"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.55 }}
        />
        {/* gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col flex-1 px-6 pt-14 pb-10 max-w-sm mx-auto w-full">

        {/* Logo */}
        <motion.div
          className="text-center mb-auto"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm font-black tracking-[0.35em] text-white/90 italic">
            E L E V A T E
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          className="text-center my-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55 }}
        >
          <h1 className="text-[2.75rem] leading-[1.05] font-black tracking-tight text-white italic uppercase">
            ELEVATE AL<br />
            <span className="text-primary">SIGUIENTE</span><br />
            NIVEL
          </h1>

          {/* decorative lines */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-10 bg-primary/60" />
            <div className="h-px w-10 bg-primary/60" />
          </div>
        </motion.div>

        {/* Feature badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-10"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
        >
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm"
            >
              <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
              <span className="text-[11px] font-bold tracking-wider text-white/85">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.45 }}
          className="space-y-4"
        >
          <button
            onClick={() => navigate("/auth")}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-sm tracking-[0.15em] text-white"
            style={{
              background: "linear-gradient(135deg, hsl(18 100% 58%), hsl(22 100% 44%))",
              boxShadow: "0 8px 32px hsl(18 100% 55% / 0.45)",
            }}
          >
            <Zap className="w-5 h-5" strokeWidth={2.5} />
            COMENZAR TRANSFORMACIÓN
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </button>

          <p className="text-center text-sm text-white/50">
            ¿Ya tienes cuenta?{" "}
            <button
              onClick={() => navigate("/auth")}
              className="text-white/80 font-bold underline underline-offset-2 hover:text-primary transition-colors"
            >
              Iniciar Sesión
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
