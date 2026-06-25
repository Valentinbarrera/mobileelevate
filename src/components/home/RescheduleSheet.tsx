/**
 * Bottom-sheet para reprogramar / intercambiar el día de hoy.
 * - Hacer otro día del plan hoy (swap)
 * - Pasar el entreno de hoy a mañana (reprogramar)
 * - Marcar hoy como descanso
 * - Volver al plan del coach (reset)
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, Dumbbell, Check, Moon, CalendarClock, RotateCcw } from "lucide-react";
import type { TodayRoutineDay } from "@/hooks/useCoachHomeData";

interface RescheduleSheetProps {
  open: boolean;
  onClose: () => void;
  days: TodayRoutineDay[];
  todayId: string | null;
  hasToday: boolean;
  onSwap: (dayId: string) => void;
  onRest: () => void;
  onReset: () => void;
  onMoveTomorrow: () => void;
}

const RescheduleSheet = ({
  open,
  onClose,
  days,
  todayId,
  hasToday,
  onSwap,
  onRest,
  onReset,
  onMoveTomorrow,
}: RescheduleSheetProps) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-md card-elevated rounded-t-3xl sm:rounded-3xl p-6 max-h-[88vh] overflow-y-auto"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-foreground">Cambiar el día de hoy</h2>
              <p className="text-sm text-muted-foreground">Acomodá el plan a tu día.</p>
            </div>
            <button onClick={onClose} aria-label="Cerrar" className="text-muted-foreground p-1 -mr-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Hacer otro día hoy (swap) */}
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Hacé otro día hoy
          </p>
          <div className="space-y-2 mb-5">
            {days.map((d) => {
              const isToday = d.id === todayId;
              const muscles = [...new Set(d.exercises.map((e) => e.muscleGroup).filter(Boolean))]
                .slice(0, 2)
                .join(" · ");
              return (
                <button
                  key={d.id}
                  onClick={() => onSwap(d.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl p-3 text-left border transition-colors ${
                    isToday ? "border-primary/40 bg-primary/10" : "border-white/[0.06] bg-secondary/40"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isToday ? "bg-primary/20" : "bg-secondary"}`}>
                    <Dumbbell className={`w-4 h-4 ${isToday ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      Día {d.dayNumber} · {d.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground capitalize truncate">
                      {muscles || `${d.totalExercises} ejercicios`}
                    </p>
                  </div>
                  {isToday && <Check className="w-5 h-5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Acciones */}
          <div className="space-y-2">
            {hasToday && (
              <>
                <button
                  onClick={onMoveTomorrow}
                  className="w-full flex items-center gap-3 rounded-2xl p-3 bg-secondary/40 border border-white/[0.06] active:scale-[0.99] transition-transform"
                >
                  <CalendarClock className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-bold text-foreground">Pasar el entreno de hoy a mañana</span>
                </button>
                <button
                  onClick={onRest}
                  className="w-full flex items-center gap-3 rounded-2xl p-3 bg-secondary/40 border border-white/[0.06] active:scale-[0.99] transition-transform"
                >
                  <Moon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-bold text-foreground">Marcar hoy como descanso</span>
                </button>
              </>
            )}
            <button
              onClick={onReset}
              className="w-full flex items-center gap-3 rounded-2xl p-3 active:scale-[0.99] transition-transform"
            >
              <RotateCcw className="w-5 h-5 text-muted-foreground shrink-0" />
              <span className="text-sm font-semibold text-muted-foreground">Volver al plan del coach</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default RescheduleSheet;
