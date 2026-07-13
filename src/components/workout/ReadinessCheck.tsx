/**
 * "¿Cómo te sentís hoy?" — chequeo de readiness ANTES de empezar la sesión.
 * 5 preguntas (sueño, energía, recuperación, estrés, motivación) en escala 1-5.
 * Es OMITIBLE. Al confirmar, se guarda y alimenta la "energía diaria". Sin IA.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Zap, HeartPulse, Brain, Flame, Sparkles } from "lucide-react";
import type { ReadinessData } from "@/lib/readiness";

interface Props {
  open: boolean;
  onComplete: (data: ReadinessData) => void;
  onSkip: () => void;
}

type Key = keyof ReadinessData;

const QUESTIONS: { key: Key; icon: typeof Moon; label: string; low: string; high: string }[] = [
  { key: "sleep", icon: Moon, label: "¿Cómo dormiste anoche?", low: "Muy mal", high: "Excelente" },
  { key: "energy", icon: Zap, label: "¿Cómo está tu energía?", low: "Sin energía", high: "A full" },
  { key: "recovery", icon: HeartPulse, label: "¿Qué tan recuperado te sentís?", low: "Muy adolorido", high: "Recuperado" },
  { key: "stress", icon: Brain, label: "¿Cuánto estrés mental cargás?", low: "Muchísimo", high: "Cero estrés" },
  { key: "motivation", icon: Flame, label: "¿Qué tan motivado estás?", low: "Nada", high: "Súper" },
];

const Scale = ({ value, onChange }: { value: number | null; onChange: (n: number) => void }) => (
  <div className="grid grid-cols-5 gap-1.5">
    {[1, 2, 3, 4, 5].map((n) => {
      const active = value === n;
      return (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`h-11 rounded-xl text-sm font-black tabular-nums border transition-all active:scale-95 ${
            active
              ? "bg-primary border-primary text-primary-foreground"
              : "bg-secondary/50 border-white/[0.06] text-muted-foreground"
          }`}
        >
          {n}
        </button>
      );
    })}
  </div>
);

const ReadinessCheck = ({ open, onComplete, onSkip }: Props) => {
  const [answers, setAnswers] = useState<Partial<ReadinessData>>({});

  const set = (k: Key, n: number) => setAnswers((a) => ({ ...a, [k]: n }));
  const answeredCount = QUESTIONS.filter((q) => answers[q.key] != null).length;

  const confirm = () => {
    // Rellena lo no respondido con neutral (3) → el entreno SIEMPRE puede arrancar.
    const data: ReadinessData = {
      sleep: answers.sleep ?? 3,
      energy: answers.energy ?? 3,
      recovery: answers.recovery ?? 3,
      stress: answers.stress ?? 3,
      motivation: answers.motivation ?? 3,
    };
    setAnswers({});
    onComplete(data);
  };

  const skip = () => {
    setAnswers({});
    onSkip();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] bg-background overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="max-w-md mx-auto px-5 pt-8 pb-28">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-[11px] font-bold text-primary uppercase tracking-[0.16em]">Readiness express</p>
              <h1 className="text-2xl font-black text-foreground leading-tight mt-1">¿Cómo te sentís hoy?</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Respondé las 5 preguntas para conocer tu nivel de vitalidad. Podés omitirlo.
              </p>
            </div>

            <div className="space-y-3">
              {QUESTIONS.map((q, i) => {
                const Icon = q.icon;
                return (
                  <motion.div
                    key={q.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="card-elevated rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-2.5">
                      <Icon className="w-4 h-4 text-primary shrink-0" />
                      <p className="text-sm font-bold text-foreground">{q.label}</p>
                    </div>
                    <Scale value={answers[q.key] ?? null} onChange={(n) => set(q.key, n)} />
                    <div className="flex justify-between mt-1.5 px-0.5">
                      <span className="text-[10px] text-muted-foreground">{q.low}</span>
                      <span className="text-[10px] text-muted-foreground">{q.high}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Barra de acción fija */}
          <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-6 px-5">
            <div className="max-w-md mx-auto space-y-2">
              <button
                onClick={confirm}
                className="w-full py-3.5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold active:scale-[0.99] transition-all"
              >
                Comenzar entrenamiento
                {answeredCount > 0 && answeredCount < 5 && (
                  <span className="font-semibold opacity-80"> ({answeredCount}/5)</span>
                )}
              </button>
              <button
                onClick={skip}
                className="w-full py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Omitir y empezar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReadinessCheck;
