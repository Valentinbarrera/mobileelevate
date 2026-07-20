/**
 * Detalle de UN programa propio del alumno: el diseño completo (semanas → días →
 * ejercicios), con editar, eliminar, terminar y entrenar un día concreto. SIN IA.
 *
 * "Entrenar" abre la MISMA pantalla que un día del coach, así el alumno tiene una
 * sola experiencia de entreno y la sesión le queda en el historial.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Dumbbell,
  Calendar,
  Pencil,
  Trash2,
  Play,
  Timer,
  Gauge,
  FolderOpen,
  CheckCircle2,
  Flag,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  getMyProgram,
  deleteMyProgram,
  finishProgram,
  reopenProgram,
  groupDaysByWeek,
  programStatus,
  PROGRAM_STATUS_LABEL,
  type ProgramStatus,
} from "@/lib/myPrograms";
import { loadActivePlan, setActivePlan, clearActivePlan, isOwnPlanActive } from "@/lib/activePlan";
import { staggerContainer, fadeUp } from "@/lib/animations";

const LEVEL_STYLES: Record<string, string> = {
  principiante: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  intermedio: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  avanzado: "bg-rose-500/15 text-rose-400 border-rose-500/25",
};

const STATUS_STYLES: Record<ProgramStatus, string> = {
  en_curso: "bg-primary/15 text-primary border-primary/25",
  guardado: "bg-secondary/60 text-muted-foreground border-white/[0.06]",
  terminado: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
};

export default function MyProgramDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");

  // El programa vive en localStorage: para que terminar/reabrir se vea al toque
  // (sin recargar) se relee con un contador de refresco en las deps del useMemo.
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((n) => n + 1);

  const program = useMemo(
    () => (id ? getMyProgram(sid, id) : null),
    // refreshKey es el disparador: fuerza releer el storage tras terminar/reabrir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sid, id, refreshKey]
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [plan, setPlan] = useState(() => loadActivePlan(sid));
  const isActive = !!program && isOwnPlanActive(plan, program.id);
  // El estado es DERIVADO (no se guarda): "en curso" = es el plan activo. Así el
  // badge y el plan activo no pueden contradecirse nunca.
  const status = program ? programStatus(program, isActive) : "guardado";
  const isFinished = status === "terminado";

  // Días agrupados por semana. Los programas viejos (sin `week`) caen todos en
  // la semana 1 → un solo grupo, y ahí el encabezado sería ruido: no se muestra.
  const weekGroups = useMemo(() => (program ? groupDaysByWeek(program) : []), [program]);
  const showWeekHeaders = weekGroups.length > 1;

  const handleActivate = () => {
    if (!program) return;
    setActivePlan(sid, { type: "own", programId: program.id });
    setPlan({ type: "own", programId: program.id });
    toast.success(`"${program.name}" es tu plan activo`, {
      description: "Es el que vas a ver en Inicio. Tu coach no se entera de este cambio.",
    });
  };

  const handleDeactivate = () => {
    clearActivePlan(sid);
    setPlan({ type: "coach" });
    toast.success("Volviste al plan de tu coach");
  };

  /**
   * Terminar ARCHIVA el programa (guarda `completedAt`), no lo borra: el alumno
   * conserva el diseño y su historial, y puede reabrirlo cuando quiera.
   */
  const handleFinish = () => {
    if (!program) return;
    finishProgram(sid, program.id);
    // Un programa terminado no puede seguir siendo el plan activo: sería decirle
    // "entrená esto" a algo que el alumno acaba de cerrar.
    if (isActive) {
      clearActivePlan(sid);
      setPlan({ type: "coach" });
    }
    setConfirmFinish(false);
    refresh();
    toast.success("Programa terminado", {
      description: "Queda archivado, no se borra. Podés reabrirlo cuando quieras.",
    });
  };

  const handleReopen = () => {
    if (!program) return;
    reopenProgram(sid, program.id);
    refresh();
    toast.success("Programa reabierto", {
      description: "Volvió a estar disponible para entrenar.",
    });
  };

  // Empty state — el programa no existe
  if (!program) {
    return (
      <AppShell>
        <PageHeader
          title="Programa"
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
        <div className="max-w-4xl mx-auto px-5 lg:px-8 pt-16">
          <div className="card-hero rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-black text-foreground mb-1">No encontramos este programa</p>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
              Puede que lo hayas eliminado o que el enlace no sea válido.
            </p>
            <button
              onClick={() => navigate("/routines")}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a mis rutinas
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleDelete = () => {
    deleteMyProgram(sid, program.id);
    toast.success("Programa eliminado");
    navigate("/routines");
  };

  /**
   * Entrena el día con la MISMA pantalla que un día del coach: así el alumno
   * tiene una sola experiencia (series, RIR, descanso, cambiar ejercicios) y la
   * sesión queda guardada en el historial. Antes iba a /free-workout, que es
   * otra pantalla y no guardaba nada.
   */
  const trainDay = (day: (typeof program.days)[number]) => {
    navigate(`/programa/${program.id}/dia/${day.id}/entrenar`);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow={
          <>
            <Dumbbell className="w-3.5 h-3.5" />
            Mi programa
          </>
        }
        title={program.name}
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
          {/* Resumen del programa */}
          <motion.div variants={fadeUp} className="card-hero rounded-2xl p-4">
            <div className="mb-3">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLES[status]}`}
              >
                {PROGRAM_STATUS_LABEL[status]}
              </span>
            </div>
            {program.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {program.description}
              </p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              {program.level && (
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    LEVEL_STYLES[program.level] ??
                    "bg-secondary/60 text-muted-foreground border-white/[0.06]"
                  }`}
                >
                  {program.level}
                </span>
              )}
              {program.daysPerWeek != null && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {program.daysPerWeek} días/sem
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <Dumbbell className="w-3.5 h-3.5 text-primary" />
                {program.days.length} {program.days.length === 1 ? "día" : "días"}
              </span>
            </div>

            {/* Activar como plan: define qué te toca entrenar en Inicio. Solo uno
                a la vez, así no hay dos respuestas a "¿qué hago hoy?". */}
            {isFinished ? (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-3">
                <p className="text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                  Terminado el{" "}
                  {new Date(program.completedAt as string).toLocaleDateString("es-AR")}
                </p>
                <button
                  type="button"
                  onClick={handleReopen}
                  aria-label="Reabrir programa"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reabrir
                </button>
              </div>
            ) : isActive ? (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-primary/10 border border-primary/25 px-3.5 py-3">
                <p className="text-xs font-bold text-primary">
                  <CheckCircle2 className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                  Es tu plan activo
                </p>
                <button
                  onClick={handleDeactivate}
                  className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  Volver al de mi coach
                </button>
              </div>
            ) : (
              <button
                onClick={handleActivate}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold active:scale-[0.99] transition-transform"
              >
                <CheckCircle2 className="w-4 h-4" /> Usar como mi plan
              </button>
            )}

            {/* Acciones globales */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => navigate(`/programa/${program.id}/editar`)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary/60 border border-white/[0.06] text-sm font-bold text-foreground active:scale-[0.99] hover:bg-secondary transition-all"
              >
                <Pencil className="w-4 h-4 text-primary" /> Editar
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/25 text-sm font-bold text-destructive active:scale-[0.99] transition-transform"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </div>

            {/* Terminar: cierra el mesociclo sin perder nada (se archiva). */}
            {!isFinished && (
              <button
                type="button"
                onClick={() => setConfirmFinish(true)}
                aria-label="Terminar programa"
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary/40 border border-white/[0.06] text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
              >
                <Flag className="w-3.5 h-3.5" /> Terminar programa
              </button>
            )}
          </motion.div>

          {/* Días, agrupados por semana */}
          {weekGroups.map((group) => (
            <div key={group.week} className="space-y-4">
              {showWeekHeaders && (
                <div className="flex items-center gap-2 px-0.5">
                  <span className="accent-bar" />
                  <h3 className="text-sm font-black text-foreground tracking-tight">
                    Semana {group.week}
                  </h3>
                </div>
              )}
              <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 lg:items-start space-y-4">
            {group.days.map((day) => (
              <motion.div
                key={day.id}
                variants={fadeUp}
                className="card-elevated rounded-2xl overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <h3 className="flex-1 text-sm font-black text-foreground tracking-tight truncate">
                    {day.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {day.exercises.length} {day.exercises.length === 1 ? "ejercicio" : "ejercicios"}
                  </span>
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {day.exercises.map((e, ei) => (
                    <div key={ei} className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {e.name}
                          </p>
                          {e.muscleGroup && (
                            <p className="text-[11px] text-muted-foreground">{e.muscleGroup}</p>
                          )}
                        </div>
                        <span className="text-sm font-black text-foreground tabular-nums shrink-0">
                          {e.sets}×{e.reps}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px] font-semibold text-muted-foreground tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {e.restSeconds}s descanso
                        </span>
                        {e.rir != null && (
                          <span className="inline-flex items-center gap-1">
                            <Gauge className="w-3 h-3" />
                            RIR {e.rir}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {day.exercises.length === 0 && (
                    <p className="px-4 py-3 text-xs text-muted-foreground">Sin ejercicios todavía</p>
                  )}
                </div>

                {/* Entrenar este día */}
                <div className="p-3">
                  <button
                    onClick={() => trainDay(day)}
                    disabled={day.exercises.length === 0}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold active:scale-[0.99] transition-transform disabled:opacity-40 disabled:active:scale-100"
                  >
                    <Play className="w-4 h-4" /> Entrenar {day.name}
                  </button>
                </div>
              </motion.div>
            ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <ConfirmDialog
        open={confirmDelete}
        title="¿Eliminar programa?"
        message={`"${program.name}" se borrará de tus programas. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        destructive
        icon={<Trash2 className="w-7 h-7" />}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        open={confirmFinish}
        title="¿Terminar programa?"
        message={`"${program.name}" se archiva: no se borra nada y lo podés reabrir cuando quieras.`}
        confirmLabel="Terminar"
        cancelLabel="Cancelar"
        icon={<Flag className="w-7 h-7" />}
        onConfirm={handleFinish}
        onCancel={() => setConfirmFinish(false)}
      />
    </AppShell>
  );
}
