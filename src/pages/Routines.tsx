import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Plus } from "lucide-react";
import PageLoading from "@/components/ui/page-loading";
import AppShell from "@/components/layout/AppShell";
import RoutinesHeaderSlim from "@/components/routines/RoutinesHeaderSlim";
import WeekProgram from "@/components/routines/WeekProgram";
import AlumnoRoutineCard from "@/components/routines/AlumnoRoutineCard";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAlumnoRoutines } from "@/hooks/useAlumnoRoutines";
import { useIsDesktop } from "@/hooks/use-media-query";
import { localISODate, getWeekDays, type SessionInfo } from "@/lib/routineSession";

type View = "today" | "completed";

const Routines = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [view, setView] = useState<View>("today");
  const { student } = useAuthContext();

  const { data: routines, isLoading, error } = useAlumnoRoutines({
    studentId: student?.id || null,
    status: view === "completed" ? "completed" : "active",
  });

  const today = localISODate();
  const assignments = useMemo(() => routines || [], [routines]);

  const weekDays = useMemo(
    () => (view === "today" ? getWeekDays(assignments, today) : []),
    [assignments, today, view]
  );
  const weeklyCount = weekDays.filter((d) => d.hasSession).length;

  const startSession = (session: SessionInfo) => {
    navigate(`/workout/${session.day.id}`, {
      state: { routineDayId: session.day.id, routineId: session.assignment.routine.id },
    });
  };
  const viewRoutine = (routineId: string) => navigate(`/routine/${routineId}`);

  // ─── Sin coach vinculado ───────────────────────────────────────────────────
  if (!student) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background pb-28 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Dumbbell className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Sin coach asignado</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Pedile a tu entrenador que te agregue como alumno para ver tus rutinas
            personalizadas.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <RoutinesHeaderSlim fullName={student.full_name} weeklyCount={weeklyCount} />

      <motion.div
        className="min-h-screen bg-background pb-32 lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-2xl lg:max-w-6xl mx-auto px-5 lg:px-8 pt-5 space-y-6">
          {/* Fila superior: toggle + entreno libre (en desktop conviven en una línea) */}
          <div className="lg:flex lg:items-center lg:gap-3 space-y-3 lg:space-y-0">
            {/* Toggle Hoy / Completadas */}
            <div className="flex gap-2 p-1 rounded-2xl bg-secondary/40 border border-border/50 lg:flex-1 lg:max-w-md">
              {(["today", "completed"] as View[]).map((v) => {
                const active = view === v;
                return (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`relative flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="routinesViewToggle"
                        className="absolute inset-0 bg-gradient-primary rounded-xl"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">
                      {v === "today" ? "Hoy" : "Completadas"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Entreno libre — armar tu propio entrenamiento fuera del plan */}
            <motion.button
              variants={fadeUp}
              onClick={() => navigate("/free-workout")}
              whileTap={{ scale: 0.99 }}
              className="w-full lg:w-auto flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 py-3 lg:px-6 text-primary font-bold text-sm active:scale-[0.99] hover:bg-primary/15 transition-all whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Entreno libre
            </motion.button>
          </div>

          {isLoading && <PageLoading message="Cargando rutinas..." />}

          {error && (
            <div className="px-5 py-12 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center">
                <Dumbbell className="w-7 h-7 text-destructive" />
              </div>
              <p className="text-destructive text-sm">Error al cargar rutinas</p>
              <p className="text-muted-foreground text-xs mt-1">{(error as Error).message}</p>
            </div>
          )}

          {/* ─── Vista HOY ───────────────────────────────────────────────── */}
          {!isLoading && !error && view === "today" && (() => {
            if (assignments.length === 0) {
              return (
                <div className="rounded-3xl card-elevated p-8 text-center">
                  <Dumbbell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">Sin rutinas todavía</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Tu coach aún no te asignó una rutina.
                  </p>
                </div>
              );
            }

            const program = (
              <WeekProgram assignments={assignments} onStart={startSession} onView={viewRoutine} />
            );

            const programasSection = (
              <motion.div variants={fadeUp} className="space-y-2.5">
                <div className="flex items-center gap-2 px-0.5">
                  <span className="accent-bar" />
                  <h3 className="text-sm font-black text-foreground tracking-tight">Mis programas</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {assignments.map((assignment, index) => (
                    <AlumnoRoutineCard key={assignment.id} assignment={assignment} index={index} />
                  ))}
                </div>
              </motion.div>
            );

            // Desktop: programa (calendario + ejercicios) a la izquierda, programas al rail.
            if (isDesktop) {
              return (
                <div className="grid grid-cols-12 gap-6 items-start">
                  <div className="col-span-12 xl:col-span-7">{program}</div>
                  <div className="col-span-12 xl:col-span-5">{programasSection}</div>
                </div>
              );
            }

            return (
              <div className="space-y-6">
                {program}
                {programasSection}
              </div>
            );
          })()}

          {/* ─── Vista COMPLETADAS ───────────────────────────────────────── */}
          {!isLoading && !error && view === "completed" && (
            <>
              {assignments.length === 0 ? (
                <div className="rounded-3xl card-elevated p-8 text-center">
                  <Dumbbell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">Sin rutinas completadas</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cuando termines una rutina, va a aparecer acá.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {assignments.map((assignment, index) => (
                    <AlumnoRoutineCard key={assignment.id} assignment={assignment} index={index} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AppShell>
  );
};

export default Routines;
