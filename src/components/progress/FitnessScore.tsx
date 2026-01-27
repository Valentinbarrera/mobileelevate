import { motion } from "framer-motion";

interface FitnessScoreProps {
  score: number;
}

const FitnessScore = ({ score }: FitnessScoreProps) => {
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      className="bg-card border border-border rounded-3xl p-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Circular Progress */}
      <div className="relative w-44 h-44 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(24 100% 60%)" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-5xl font-black text-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">
            Score Fitness
          </span>
        </div>
      </div>

      {/* Level badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-xl font-bold text-primary mb-1">¡Excelente nivel!</h3>
        <p className="text-sm text-muted-foreground">
          Estás en el top 5% de tu categoría de edad.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default FitnessScore;
