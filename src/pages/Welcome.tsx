import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Users, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import onboardingHero from "@/assets/onboarding-hero.jpg";

const Welcome = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Sparkles, label: "PLANES ELITE" },
    { icon: Users, label: "COACH 1-A-1" },
    { icon: Utensils, label: "NUTRICIÓN PRO" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-10" />
      
      {/* Hero image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={onboardingHero} 
          alt="Athlete" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-20 flex-1 flex flex-col justify-between px-6 pt-12 pb-8">
        {/* Logo */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl font-black tracking-[0.3em] text-foreground">
            EL<span className="text-primary">E</span>VATE
          </h1>
        </motion.div>

        {/* Main content */}
        <motion.div 
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div>
            <h2 className="text-4xl font-black text-foreground leading-tight">
              ELÉVATE AL
            </h2>
            <h2 className="text-4xl font-black leading-tight">
              <span className="text-gradient-primary">SIGUIENTE</span>
            </h2>
            <h2 className="text-4xl font-black text-foreground leading-tight">
              NIVEL
            </h2>
          </div>

          {/* Feature pills */}
          <motion.div 
            className="flex justify-center gap-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-card/80 backdrop-blur-sm border border-border"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <feature.icon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold text-foreground tracking-wide">
                  {feature.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Actions */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button
            onClick={() => navigate("/onboarding/goal")}
            className="w-full h-14 rounded-2xl bg-gradient-primary text-primary-foreground font-bold text-base glow-primary animate-pulse-glow"
          >
            COMENZAR TRANSFORMACIÓN
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <button
            onClick={() => navigate("/auth")}
            className="w-full text-center text-sm text-muted-foreground"
          >
            ¿Ya tienes cuenta? <span className="font-bold text-foreground">Iniciar Sesión</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
