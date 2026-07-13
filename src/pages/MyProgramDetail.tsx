/**
 * Detalle de UN programa propio del alumno. Muestra el diseño completo (días +
 * ejercicios) y permite editarlo, eliminarlo o entrenar un día concreto. SIN IA.
 *
 * "Entrenar" navega a /free-workout con un `preset` en location.state que la
 * pantalla de entrenamiento libre consume para precargar los ejercicios del día.
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
} from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useAuthContext } from "@/contexts/AuthContext";
import { getMyProgram, deleteMyProgram } from "@/lib/myPrograms";
import { staggerContainer, fadeUp } from "@/lib/animations";

const LEVEL_STYLES: Record<string, string> = {
  principiante: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  intermedio: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  avanzado: "bg-rose-500/15 text-rose-400 border-rose-500/25",
};

export default function MyProgramDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");

  const program = useMemo(() => (id ? getMyProgram(sid, id) : null), [sid, id]);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const trainDay = (day: (typeof program.days)[number]) => {
    navigate("/free-workout", {
      state: {
        preset: {
          name: day.name,
          exercises: day.exercises.map((e) => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            exerciseId: e.exerciseId ?? null,
          })),
        },
      },
    });
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

            {/* Acciones globales */}
            <div className="flex gap-2 mt-4">
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
          </motion.div>

          {/* Días */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0 lg:items-start space-y-4">
            {program.days.map((day) => (
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
                    {day.exercises.length} ejercicios
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
    </AppShell>
  );
}
