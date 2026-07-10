/**
 * Hub de cuestionarios: lanza el intake de entrenamiento y (a futuro) otros
 * cuestionarios. Pedido por el coach ("ver opción de hacer otros cuestionarios").
 */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ClipboardList, ChevronRight, Check, HeartPulse, CalendarCheck, ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useAuthContext } from "@/contexts/AuthContext";
import { isOnboardingComplete } from "@/lib/onboarding";

const Questionnaires = () => {
  const navigate = useNavigate();
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");
  const intakeDone = isOnboardingComplete(sid);

  return (
    <AppShell>
      <motion.div
        className="min-h-screen bg-background pb-nav lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.header variants={fadeUp} className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
          {/* header-safe-lg suma el env(safe-area-inset-top) (antes py-3 quedaba bajo la isla) */}
          <div className="max-w-3xl mx-auto flex items-center gap-3 px-5 pb-3 header-safe-lg">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-card/60 border border-border/40 flex items-center justify-center">
              <ArrowLeft className="w-4.5 h-4.5 text-foreground" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Cuestionarios</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-foreground">Tus cuestionarios</h1>
            </div>
          </div>
        </motion.header>

        <div className="max-w-3xl mx-auto px-5 pt-5 space-y-3">
          {/* Intake de entrenamiento (activo) */}
          <motion.button
            variants={fadeUp}
            onClick={() => navigate("/onboarding")}
            className="w-full text-left rounded-2xl card-hero p-4 flex items-center gap-3.5 active:scale-[0.99] transition-transform"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-foreground">Perfil de entrenamiento</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {intakeDone ? "Completo · tocá para editar" : "Contale a tu coach quién sos y qué buscás"}
              </p>
            </div>
            {intakeDone ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 shrink-0">
                <Check className="w-4 h-4" /> Listo
              </span>
            ) : (
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2 py-1 rounded-md bg-primary/10 border border-primary/20 shrink-0">
                Pendiente
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </motion.button>

          {/* Próximos cuestionarios (placeholder) */}
          {[
            { icon: HeartPulse, title: "Chequeo de bienestar", desc: "Sueño, energía, estrés y recuperación" },
            { icon: CalendarCheck, title: "Re-evaluación mensual", desc: "Actualizá tu progreso y objetivos" },
          ].map((q) => (
            <motion.div
              key={q.title}
              variants={fadeUp}
              className="w-full rounded-2xl border border-dashed border-border bg-secondary/20 p-4 flex items-center gap-3.5 opacity-80"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                <q.icon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{q.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{q.desc}</p>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1 rounded-md bg-secondary border border-white/[0.06] shrink-0">
                Próximamente
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppShell>
  );
};

export default Questionnaires;
