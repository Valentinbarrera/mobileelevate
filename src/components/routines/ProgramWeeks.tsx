/**
 * ProgramWeeks — vista "Semanas" del programa. Agrupa las sesiones agendadas
 * (planned_sessions) por semana relativa a start_date y las muestra en un
 * acordeón "Semana N" con el estado de cada día (hecho / pendiente).
 *
 * Si el coach todavía no agendó fechas, cae en un fallback elegante + la lista
 * plana de días del plan (que le pasa RoutineDetail).
 */
import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, CalendarDays, Check, ChevronDown, Play } from "lucide-react";
import DayExerciseList from "./DayExerciseList";
import {
  dayTitle,
  estimateSessionMinutes,
  exerciseCount,
  groupSessionsByWeek,
  type SessionInfo,
} from "@/lib/routineSession";
import type { AlumnoRoutineWithDetails, RoutineExercise } from "@/types/coach";

interface ProgramWeeksProps {
  assignment: AlumnoRoutineWithDetails;
  doneDates: Set<string>;
  /** semana actual (1-based) para abrir por defecto */
  currentWeek: number;
  todayISO: string;
  onStart: (session: SessionInfo) => void;
  /** lista de días del plan, para el fallback sin agenda */
  fallback: ReactNode;
}

const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

/* ── Un día agendado dentro de una semana (colapsable) ── */
const WeekSessionCard = ({
  session,
  done,
  isToday,
  onStart,
}: {
  session: SessionInfo;
  done: boolean;
  isToday: boolean;
  onStart: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const { day, date } = session;
  const exercises = (day.routine_exercises || []) as RoutineExercise[];

  return (
    <div className="rounded-xl bg-secondary/30 border border-white/[0.05] overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-3.5 py-3 text-left">
        <span
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
            done
              ? "bg-emerald-500/90 text-white"
              : isToday
                ? "bg-gradient-primary text-primary-foreground"
                : "bg-primary/10 text-primary"
          }`}
        >
          {done ? <Check className="w-4 h-4" strokeWidth={3} /> : exercises.length}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{dayTitle(day)}</p>
          <p className="text-[11px] text-muted-foreground capitalize">
            {date ? fmtDate(date) : `${exercises.length} ejercicios`}
            {isToday && <span className="text-primary font-bold"> · Hoy</span>}
          </p>
        </div>

        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-muted-foreground tabular-nums">
          ~{estimateSessionMinutes(day)}′
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/[0.05]">
              <DayExerciseList exercises={exercises} />
            </div>
            {exercises.length > 0 && (
              <div className="p-3">
                <button
                  onClick={onStart}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-bold active:scale-[0.99] transition-transform"
                >
                  <Play className="w-4 h-4 fill-current" /> Empezar este día
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Acordeón de una semana ── */
const WeekAccordion = ({
  week,
  sessions,
  doneDates,
  isCurrent,
  defaultOpen,
  todayISO,
  onStart,
}: {
  week: number;
  sessions: SessionInfo[];
  doneDates: Set<string>;
  isCurrent: boolean;
  defaultOpen: boolean;
  todayISO: string;
  onStart: (s: SessionInfo) => void;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const doneCount = sessions.filter((s) => s.date && doneDates.has(s.date)).length;
  const total = sessions.length;

  return (
    <div className="card-elevated rounded-2xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-black text-foreground">Semana {week}</p>
            {isCurrent && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                En curso
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
            {doneCount}/{total} sesiones hechas
          </p>
        </div>

        {/* mini progreso de la semana */}
        <div className="w-16 h-1.5 rounded-full bg-secondary/60 overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-primary rounded-full"
            style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
          />
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 space-y-2 border-t border-white/[0.05]">
              {sessions.map((s) => (
                <WeekSessionCard
                  key={(s.date ?? "") + s.day.id}
                  session={s}
                  done={!!s.date && doneDates.has(s.date)}
                  isToday={s.date === todayISO}
                  onStart={() => onStart(s)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProgramWeeks = ({
  assignment,
  doneDates,
  currentWeek,
  todayISO,
  onStart,
  fallback,
}: ProgramWeeksProps) => {
  const weeks = groupSessionsByWeek(assignment);

  if (weeks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="card-elevated rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <CalendarClock className="w-6 h-6 text-primary" />
          </div>
          <p className="font-bold text-foreground">Tu coach todavía no agendó fechas</p>
          <p className="text-sm text-muted-foreground mt-1">
            Cuando arme tu calendario vas a ver el programa semana por semana. Mientras tanto, mirá los días del plan.
          </p>
        </div>
        {fallback}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <CalendarDays className="w-3.5 h-3.5 text-primary" />
        <span className="font-semibold">{weeks.length} semanas agendadas</span>
      </div>
      {weeks.map((w) => (
        <WeekAccordion
          key={w.week}
          week={w.week}
          sessions={w.sessions}
          doneDates={doneDates}
          isCurrent={w.week === currentWeek}
          defaultOpen={w.week === currentWeek}
          todayISO={todayISO}
          onStart={onStart}
        />
      ))}
    </div>
  );
};

export default ProgramWeeks;
