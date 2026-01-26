import { motion } from "framer-motion";
import { useMemo } from "react";

const Confetti = () => {
  const confettiPieces = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: [
        "hsl(var(--primary))",
        "#FFD700",
        "#FF6B6B",
        "#4ECDC4",
        "#A78BFA",
        "#F97316",
      ][Math.floor(Math.random() * 6)],
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 360,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: "-20px",
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
          }}
          initial={{ 
            y: -20, 
            opacity: 1,
            rotate: piece.rotation,
          }}
          animate={{ 
            y: "100vh",
            opacity: [1, 1, 0],
            rotate: piece.rotation + 720,
            x: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 50],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
