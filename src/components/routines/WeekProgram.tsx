/**
 * Programa — vista unificada y eficiente: calendario de la semana arriba; tocás
 * un día y aparecen sus ejercicios (series × reps, descanso, RIR, biseries) con
 * el botón para empezar. Si el coach no agendó fechas, se eligen los días del
 * plan (Día 1, Día 2…).
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Play, Moon, Clock, Dumbbell, ChevronRight } from "lucide-react";
import DayExerciseList from "./DayExerciseList";
import {
  localISODate,
  getWeekDays,
  findSessionByDate,
  hasAnyPlannedSession,
  dayTitle,
  getMuscleTags,
  exerciseCount,
  totalSets,
  estimateSessionMinutes,
  type SessionInfo,
  type AlumnoDay,
} from "@/lib/routineSession";
import type { AlumnoRoutineWithDetails, RoutineExercise } from "@/types/coach";

interface WeekProgramProps {
  assignments: AlumnoRoutineWithDetails[];
  onStart: (session: SessionInfo) => void;
  onView: (routineId: string) => void;
}

const WEEKDAY = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

const WeekProgram = ({ assignments, onStart, onView }: WeekProgramProps) => {
  const today = localISODate();
  const hasAgenda = hasAnyPlannedSession(assignments);

  const week = useMemo(() => getWeekDays(assignments, today), [assignments, today]);

  // Días del plan (para el modo sin agenda)
  const planDays = useMemo<{ day: AlumnoDay; assignment: AlumnoRoutineWithDetails }[]>(() => {
    const out: { day: AlumnoDay; assignment: AlumnoRoutineWithDetails }[] = [];
    for (const a of assignments) {
      for (const d of (a.routine?.routine_days || []) as AlumnoDay[]) out.push({ day: d, assignment: a });
    }
    return out;
  }, [assignments]);

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedDayId, setSelectedDayId] = useState(planDays[0]?.day.id ?? null);

  // Sesión a mostrar según el modo
  const session: SessionInfo | null = useMemo(() => {
    if (hasAgenda) return findSessionByDate(assignments, selectedDate);
    const found = planDays.find((p) => p.day.id === selectedDayId) ?? planDays[0];
    return found ? { assignment: found.assignment, day: found.day, date: null } : null;
  }, [hasAgenda, assignments, selectedDate, planDays, selectedDayId]);

  const day = session?.day ?? null;

  return (
    <div className="space-y-4">
      {/* ── Selector ── */}
      {hasAgenda ? (
        <div className="card-elevated rounded-2xl p-3">
          <div className="grid grid-cols-7 gap-1.5">
            {week.map((d) => {
              const selected = d.date === selectedDate;
              const isToday = d.date === today;
              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className="flex flex-col items-center gap-1"
                >
                  <span className={`text-[9px] font-bold uppercase ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                    {d.label}
                  </span>
                  <div
                    className={`w-full aspect-square max-w-[2.6rem] rounded-xl flex items-center justify-center text-sm font-black tabular-nums transition-colors ${
                      selected
                        ? "bg-gradient-primary text-primary-foreground"
                        : d.hasSession
                          ? "bg-primary/10 text-foreground border border-primary/20"
                          : "bg-secondary/50 text-muted-foreground"
                    } ${isToday && !selected ? "ring-2 ring-primary/60" : ""}`}
                  >
                    {d.dayNum}
                  </div>
                  <span className={`h-1.5 w-1.5 rounded-full ${d.hasSession ? "bg-primary" : "bg-transparent"}`} />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        planDays.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {planDays.map(({ day: d }, i) => {
              const selected = d.id === selectedDayId;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDayId(d.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-sm font-bold border transition-colors ${
                    selected
                      ? "bg-gradient-primary text-primary-foreground border-transparent"
                      : "bg-secondary/40 text-muted-foreground border-white/[0.06]"
                  }`}
                >
                  D{d.order_index ?? d.day_number ?? i + 1}
                </button>
              );
            })}
          </div>
        )
      )}

      {/* ── Panel del día seleccionado ── */}
      {day ? (
        <motion.div
          key={day.id + selectedDate}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated rounded-2xl overflow-hidden"
        >
          {/* Cabecera del día */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {hasAgenda && (
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-0.5">
                    {selectedDate === today ? "Hoy" : WEEKDAY[new Date(selectedDate + "T00:00:00").getDay()]}
                  </p>
                )}
                <h3 className="text-lg font-black text-foreground truncate">{dayTitle(day)}</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5 text-primary" /> {exerciseCount(day)} ejercicios
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" /> ~{estimateSessionMinutes(day)} min
                  </span>
                  <span className="tabular-nums">{totalSets(day)} series</span>
                </div>
                {getMuscleTags(day).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {getMuscleTags(day).map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded-md bg-secondary/60 border border-white/[0.06] text-[11px] font-semibold text-foreground capitalize"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ejercicios */}
          <div className="border-t border-white/[0.05]">
            <DayExerciseList exercises={(day.routine_exercises || []) as RoutineExercise[]} />
          </div>

          {/* Acciones */}
          <div className="flex gap-2 p-3 border-t border-white/[0.05]">
            <button
              onClick={() => session && onStart(session)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold active:scale-[0.99] transition-transform"
            >
              <Play className="w-4 h-4 fill-current" /> Empezar
            </button>
            <button
              onClick={() => session && onView(session.assignment.routine.id)}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-secondary/60 border border-white/[0.06] text-sm font-bold text-foreground active:scale-[0.99] transition-transform"
            >
              Ver rutina <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ) : (
        // Día sin entreno (descanso)
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-elevated rounded-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
            <Moon className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="font-bold text-foreground">Descanso</p>
          <p className="text-sm text-muted-foreground mt-1">No tenés entreno agendado este día.</p>
        </motion.div>
      )}
    </div>
  );
};

export default WeekProgram;
