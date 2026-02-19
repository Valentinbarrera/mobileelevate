import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Users, Utensils, Zap } from "lucide-react";
import onboardingHero from "@/assets/onboarding-hero.jpg";

const Welcome = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Sparkles, label: "PLANES ÉLITE" },
    { icon: Users, label: "COACH 1-A-1" },
    { icon: Utensils, label: "NUTRICIÓN PRO" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* === ENERGY BOLTS BACKGROUND === */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        {/* Left bolt */}
        <motion.svg
          viewBox="0 0 120 600"
          className="absolute left-0 top-[15%] w-28 opacity-[0.12]"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.path
            d="M60 0 L45 120 L75 140 L30 300 L65 310 L10 500 L50 380 L25 370 L55 220 L30 200 L60 0"
            fill="none"
            stroke="hsl(18 100% 55%)"
            strokeWidth="1.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
          />
        </motion.svg>

        {/* Right bolt */}
        <motion.svg
          viewBox="0 0 120 600"
          className="absolute right-0 top-[10%] w-24 opacity-[0.1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.path
            d="M50 0 L65 100 L35 130 L80 280 L45 300 L100 480 L55 360 L75 340 L40 200 L60 170 L50 0"
            fill="none"
            stroke="hsl(28 100% 60%)"
            strokeWidth="1.2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
          />
        </motion.svg>

        {/* Animated energy particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: `hsl(${18 + i * 5} 100% ${55 + i * 3}%)`,
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              boxShadow: `0 0 8px hsl(18 100% 55% / 0.6)`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0, 1.5, 0],
              y: [0, -40, -80],
            }}
            transition={{
              delay: 2 + i * 0.3,
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 3 + i * 0.5,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* === HERO IMAGE === */}
      <div className="absolute inset-0 z-0">
        <motion.img
          src={onboardingHero}
          alt="Athlete training"
          className="w-full h-full object-cover object-top"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
        {/* Multi-layer gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-transparent" />
        {/* Warm side vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 70%, transparent 40%, hsl(var(--background)) 85%)",
          }}
        />
      </div>

      {/* === CONTENT === */}
      <div className="relative z-20 flex-1 flex flex-col justify-between px-6 pt-14 pb-10">
        {/* Logo */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-xl font-black tracking-[0.4em] text-foreground/90">
            EL<span className="text-primary">E</span>VATE
          </h1>
          {/* Underline accent */}
          <motion.div
            className="mx-auto mt-2 h-[2px] rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
            initial={{ width: 0 }}
            animate={{ width: 80 }}
            transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
          />
        </motion.div>

        {/* Main headline */}
        <motion.div
          className="text-center space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="space-y-1">
            <motion.h2
              className="text-[2.75rem] font-black text-foreground leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              ELEVATE AL
            </motion.h2>
            <motion.h2
              className="text-[2.75rem] font-black leading-[1.1] tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <span className="text-gradient-primary">SIGUIENTE</span>
            </motion.h2>
            <motion.div
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="h-[2px] w-8 bg-gradient-to-r from-transparent to-primary/60 origin-right"
              />
              <h2 className="text-[2.75rem] font-black text-foreground leading-[1.1] tracking-tight">
                NIVEL
              </h2>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="h-[2px] w-8 bg-gradient-to-l from-transparent to-primary/60 origin-left"
              />
            </motion.div>
          </div>

          {/* Feature pills */}
          <motion.div
            className="flex justify-center gap-2.5 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-border/60"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  backdropFilter: "blur(12px)",
                }}
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 1 + index * 0.12,
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
                whileTap={{ scale: 0.95 }}
              >
                <feature.icon className="w-4 h-4 text-primary" strokeWidth={2} />
                <span className="text-[11px] font-bold text-foreground/90 tracking-wider">
                  {feature.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Premium CTA Button */}
          <motion.button
            onClick={() => navigate("/onboarding/goal")}
            className="relative w-full h-[60px] rounded-2xl font-bold text-base tracking-wide text-white overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, hsl(18 100% 52%), hsl(25 100% 48%), hsl(15 100% 45%))",
              boxShadow: "0 8px 32px hsl(18 100% 50% / 0.4), 0 2px 8px hsl(18 100% 50% / 0.3), inset 0 1px 0 hsl(28 100% 70% / 0.3)",
            }}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Shimmer sweep */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                delay: 2,
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut",
              }}
            />
            {/* Top edge highlight */}
            <div
              className="absolute inset-x-4 top-0 h-[1px]"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }}
            />
            {/* Content */}
            <span className="relative z-10 flex items-center justify-center gap-2.5">
              <Zap className="w-5 h-5" strokeWidth={2.5} />
              COMENZAR TRANSFORMACIÓN
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </span>
          </motion.button>

          {/* Login link */}
          <motion.button
            onClick={() => navigate("/auth")}
            className="w-full text-center text-sm text-muted-foreground py-2"
            whileTap={{ scale: 0.98 }}
          >
            ¿Ya tienes cuenta?{" "}
            <span className="font-bold text-foreground underline underline-offset-4 decoration-primary/40">
              Iniciar Sesión
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
