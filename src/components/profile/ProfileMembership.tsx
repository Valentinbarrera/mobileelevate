import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";

interface ProfileMembershipProps {
  plan: string;
  nextRenewal: string;
  isPro: boolean;
}

const ProfileMembership = ({ plan, nextRenewal, isPro }: ProfileMembershipProps) => {
  return (
    <motion.div 
      className="px-5 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border p-5"
        whileHover={{ scale: 1.01 }}
      >
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            {/* Plan Name with Badge */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-black text-foreground">{plan}</h3>
              {isPro && (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4">
              Acceso total a planes de élite y métricas avanzadas.
            </p>

            {/* Renewal Info */}
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Próxima renovación
                </p>
                <p className="text-sm font-bold text-foreground">{nextRenewal}</p>
              </div>

              <motion.button
                className="px-5 py-2.5 rounded-xl bg-secondary border border-border text-sm font-bold text-foreground hover:bg-secondary/80 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                GESTIONAR
              </motion.button>
            </div>
          </div>

          {/* Crown Icon */}
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileMembership;
