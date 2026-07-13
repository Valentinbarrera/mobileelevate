/**
 * Biblioteca de programas (templates) basados en evidencia — SIN IA.
 *
 * Muestra los PROGRAM_TEMPLATES con su diseño (días + ejercicios), el porqué
 * (rationale) y la FUENTE científica citada (requisito App Store 1.4.1). El
 * alumno puede copiar un template a sus programas propios y editarlo/entrenarlo.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Library,
  ChevronDown,
  Dumbbell,
  Calendar,
  Target,
  FlaskConical,
  BookText,
  Info,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  PROGRAM_TEMPLATES,
  templateToProgram,
  type ProgramTemplate,
} from "@/lib/programTemplates";
import { saveMyProgram } from "@/lib/myPrograms";
import { staggerContainer, fadeUp } from "@/lib/animations";

const LEVEL_STYLES: Record<string, string> = {
  principiante: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  intermedio: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  avanzado: "bg-rose-500/15 text-rose-400 border-rose-500/25",
};

const LevelChip = ({ level }: { level: string }) => (
  <span
    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
      LEVEL_STYLES[level] ?? "bg-secondary/60 text-muted-foreground border-white/[0.06]"
    }`}
  >
    {level}
  </span>
);

export default function ProgramTemplates() {
  const navigate = useNavigate();
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");

  const [expanded, setExpanded] = useState<string | null>(null);

  const useTemplate = (t: ProgramTemplate) => {
    const p = templateToProgram(t);
    saveMyProgram(sid, p);
    toast.success(`"${t.name}" agregado a tus programas 💪`);
    navigate("/programa/" + p.id);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow={
          <>
            <Library className="w-3.5 h-3.5" />
            Programas
          </>
        }
        title="Biblioteca de programas"
        maxWidth="max-w-4xl"
        left={
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground -ml-1 p-1"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />

      <motion.div
        className="min-h-screen bg-background pb-nav lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-5 space-y-4">
          {/* Nota general */}
          <motion.div
            variants={fadeUp}
            className="rounded-2xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-start gap-2.5"
          >
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              Estos programas son <span className="font-bold text-primary">orientativos</span> y están
              armados sobre la literatura de entrenamiento de fuerza (frecuencia, volumen y rangos de
              reps/descanso). Podés usarlos como punto de partida, pero no reemplazan el consejo de tu
              coach o de un profesional. Cada uno muestra su fuente.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 lg:items-start space-y-4">
            {PROGRAM_TEMPLATES.map((t) => {
              const isOpen = expanded === t.id;
              return (
                <motion.div
                  key={t.id}
                  variants={fadeUp}
                  className="card-elevated rounded-2xl overflow-hidden"
                >
                  {/* Encabezado tocable */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : t.id)}
                    className="w-full text-left px-4 py-4 active:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <h3 className="text-base font-black text-foreground tracking-tight">
                            {t.name}
                          </h3>
                          <LevelChip level={t.level} />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2.5 text-xs font-semibold text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {t.daysPerWeek} días/sem
                          </span>
                          <span className="inline-flex items-center gap-1.5 min-w-0">
                            <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="truncate">{t.goal}</span>
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground shrink-0 mt-1 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {/* Preview expandible */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3 space-y-4">
                          {/* Días */}
                          <div className="space-y-3">
                            {t.days.map((day, di) => (
                              <div key={di} className="rounded-xl bg-secondary/40 border border-white/[0.06] overflow-hidden">
                                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.06]">
                                  <Dumbbell className="w-3.5 h-3.5 text-primary" />
                                  <span className="text-sm font-bold text-foreground">{day.name}</span>
                                  <span className="ml-auto text-[11px] font-semibold text-muted-foreground">
                                    {day.exercises.length} ejercicios
                                  </span>
                                </div>
                                <div className="divide-y divide-white/[0.04]">
                                  {day.exercises.map((e, ei) => (
                                    <div
                                      key={ei}
                                      className="flex items-center gap-3 px-3 py-2"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">
                                          {e.name}
                                        </p>
                                        {e.muscleGroup && (
                                          <p className="text-[11px] text-muted-foreground">
                                            {e.muscleGroup}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-xs font-bold text-foreground tabular-nums shrink-0">
                                        {e.sets}×{e.reps}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Rationale */}
                          <div className="rounded-xl bg-primary/5 border border-primary/20 px-3.5 py-3">
                            <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <FlaskConical className="w-3.5 h-3.5" />
                              Por qué está armado así
                            </p>
                            <p className="text-xs text-foreground/80 leading-relaxed">
                              {t.rationale}
                            </p>
                          </div>

                          {/* Fuente / citation */}
                          <div className="rounded-xl bg-secondary/40 border border-white/[0.06] px-3.5 py-3">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                              <BookText className="w-3.5 h-3.5" />
                              Fuente
                            </p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {t.citation}
                            </p>
                          </div>

                          {/* Usar este programa */}
                          <button
                            onClick={() => useTemplate(t)}
                            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold active:scale-[0.99] transition-transform"
                          >
                            <Check className="w-4 h-4" /> Usar este programa
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
