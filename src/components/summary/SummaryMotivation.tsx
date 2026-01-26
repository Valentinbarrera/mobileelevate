import { motion } from "framer-motion";

const motivationalQuotes = [
  { emoji: "🔥", text: "¡Cada entrenamiento te acerca más a tu mejor versión!" },
  { emoji: "💪", text: "La constancia es la clave del éxito. ¡Seguí así!" },
  { emoji: "⭐", text: "Hoy diste todo, mañana serás más fuerte." },
  { emoji: "🏆", text: "Champions are made in the gym. ¡Gran trabajo!" },
  { emoji: "🚀", text: "Tu único límite sos vos mismo. ¡Rompelo!" },
];

const SummaryMotivation = () => {
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <motion.div 
      className="px-5 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3 }}
    >
      <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{randomQuote.emoji}</span>
          <div>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {randomQuote.text}
            </p>
            <p className="text-xs text-muted-foreground mt-2">— Tu Profe 💪</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryMotivation;
