/**
 * Diseñador de programas PROPIOS del alumno — arma su propio plan de
 * entrenamiento: nombre + días, y dentro de cada día ejercicios buscados en la
 * biblioteca real (o texto libre como fallback) con sets, reps y descanso.
 * Guardado LOCAL (src/lib/myPrograms). Sin IA.
 *
 * Se monta en dos rutas: "/programas/nuevo" (crear) y "/programa/:id/editar"
 * (editar un programa existente).
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  X,
  Check,
  Search,
  Dumbbell,
  Save,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useAuthContext } from "@/contexts/AuthContext";
import { useExerciseLibrary, type LibraryExercise } from "@/hooks/useExerciseLibrary";
import {
  emptyProgram,
  getMyProgram,
  saveMyProgram,
  newId,
  type MyProgram,
  type ProgramDay,
  type ProgramExercise,
} from "@/lib/myPrograms";
import { staggerContainer, fadeUp } from "@/lib/animations";

const LEVELS = ["principiante", "intermedio", "avanzado"] as const;

/* ── Buscador de ejercicios (biblioteca real + fallback texto libre) ── */
const ExercisePicker = ({
  library,
  libraryLoading,
  onPick,
}: {
  library: LibraryExercise[];
  libraryLoading: boolean;
  onPick: (ex: ProgramExercise) => void;
}) => {
  const [term, setTerm] = useState("");
  const [muscle, setMuscle] = useState<string | null>(null);
  const query = term.trim().toLowerCase();

  // Grupos musculares presentes en la biblioteca (para explorar sin saber el nombre).
  const muscles = useMemo(() => {
    const set = new Set<string>();
    library.forEach((e) => e.muscle && set.add(e.muscle.toLowerCase()));
    return [...set].sort();
  }, [library]);

  const results = useMemo(() => {
    if (!query && !muscle) return [];
    return library
      .filter((e) => {
        const matchQ =
          !query ||
          e.name.toLowerCase().includes(query) ||
          (e.muscle || "").toLowerCase().includes(query);
        const matchM = !muscle || (e.muscle || "").toLowerCase() === muscle;
        return matchQ && matchM;
      })
      .slice(0, 8);
  }, [library, query, muscle]);

  const hasExact = query.length > 0 && library.some((e) => e.name.toLowerCase() === query);

  const pickLibrary = (lib: LibraryExercise) => {
    onPick({
      name: lib.name,
      sets: 3,
      reps: "8-12",
      restSeconds: 90,
      rir: null,
      muscleGroup: lib.muscle,
      exerciseId: lib.id,
    });
    setTerm("");
  };

  const pickFreeText = (raw: string) => {
    const name = raw.trim();
    if (!name) return;
    onPick({
      name,
      sets: 3,
      reps: "8-12",
      restSeconds: 90,
      rir: null,
      muscleGroup: null,
      exerciseId: null,
    });
    setTerm("");
  };

  const submit = () => {
    if (results.length > 0) return pickLibrary(results[0]);
    pickFreeText(term);
  };

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          enterKeyHint="done"
          placeholder="Buscá en la biblioteca…"
          className="w-full min-w-0 h-11 pl-11 pr-10 rounded-xl bg-secondary border border-border text-base font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
        />
        {term && (
          <button
            onClick={() => setTerm("")}
            aria-label="Limpiar"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground active:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtro por músculo — chips scrolleables (activo en naranja) */}
      {muscles.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 mt-2.5">
          <button
            onClick={() => setMuscle(null)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              !muscle
                ? "bg-primary/15 text-primary border-primary/40"
                : "bg-secondary/60 text-muted-foreground border-white/[0.06]"
            }`}
          >
            Todos
          </button>
          {muscles.map((m) => (
            <button
              key={m}
              onClick={() => setMuscle(m === muscle ? null : m)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold capitalize border transition-colors ${
                muscle === m
                  ? "bg-primary/15 text-primary border-primary/40"
                  : "bg-secondary/60 text-muted-foreground border-white/[0.06]"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}

      {(query || muscle) && (
        <div className="mt-3 space-y-1.5">
          {results.map((ex) => (
            <button
              key={ex.id}
              onClick={() => pickLibrary(ex)}
              className="flex items-center gap-2.5 w-full rounded-xl bg-secondary/60 border border-white/[0.06] p-2 text-left active:opacity-70"
            >
              <div className="w-9 h-9 rounded-lg bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                {ex.thumbnailUrl ? (
                  <img src={ex.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Dumbbell className="w-4 h-4 text-muted-foreground/40" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{ex.name}</p>
                {ex.muscle && (
                  <p className="text-[11px] font-semibold text-primary capitalize truncate">
                    {ex.muscle}
                  </p>
                )}
              </div>
            </button>
          ))}

          {libraryLoading && results.length === 0 && (
            <p className="text-xs text-muted-foreground px-1 py-1">Buscando en la biblioteca…</p>
          )}

          {/* Sin resultados al explorar solo por músculo */}
          {!query && muscle && !libraryLoading && results.length === 0 && (
            <p className="text-xs text-muted-foreground px-1 py-1">
              Sin ejercicios de {muscle} en la biblioteca.
            </p>
          )}

          {/* Fallback texto libre */}
          {query && !hasExact && (
            <button
              onClick={() => pickFreeText(term)}
              className="flex items-center gap-2.5 w-full rounded-xl border border-dashed border-border p-2 text-left active:opacity-70"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  Agregar “{term.trim()}”
                </p>
                <p className="text-[11px] font-semibold text-muted-foreground">Ejercicio custom</p>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Card de un ejercicio dentro de un día (edita sets/reps/descanso) ── */
const ExerciseRow = ({
  ex,
  onChange,
  onRemove,
}: {
  ex: ProgramExercise;
  onChange: (patch: Partial<ProgramExercise>) => void;
  onRemove: () => void;
}) => {
  return (
    <div className="rounded-xl bg-secondary/40 border border-white/[0.06] p-3">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
            <Dumbbell className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{ex.name}</p>
            {ex.muscleGroup && (
              <p className="text-[11px] font-semibold text-primary capitalize truncate">
                {ex.muscleGroup}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onRemove}
          aria-label="Quitar ejercicio"
          className="text-muted-foreground/50 hover:text-destructive p-1 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-0.5">
            Series
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={ex.sets || ""}
            onChange={(e) => onChange({ sets: parseInt(e.target.value, 10) || 0 })}
            onFocus={(e) => e.target.select()}
            placeholder="3"
            className="w-full min-w-0 h-10 rounded-lg bg-secondary border border-border text-center text-sm font-bold text-foreground focus:border-primary focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-0.5">
            Reps
          </span>
          <input
            type="text"
            value={ex.reps}
            onChange={(e) => onChange({ reps: e.target.value })}
            onFocus={(e) => e.target.select()}
            placeholder="8-12"
            className="w-full min-w-0 h-10 rounded-lg bg-secondary border border-border text-center text-sm font-bold text-foreground focus:border-primary focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-0.5">
            Descanso (s)
          </span>
          <input
            type="number"
            inputMode="numeric"
            value={ex.restSeconds || ""}
            onChange={(e) => onChange({ restSeconds: parseInt(e.target.value, 10) || 0 })}
            onFocus={(e) => e.target.select()}
            placeholder="90"
            className="w-full min-w-0 h-10 rounded-lg bg-secondary border border-border text-center text-sm font-bold text-foreground focus:border-primary focus:outline-none"
          />
        </label>
      </div>
    </div>
  );
};

export default function MyProgramBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");

  const { exercises: library, loading: libraryLoading } = useExerciseLibrary();

  // Carga inicial: si hay id y existe, edita; si no, programa nuevo vacío.
  const [program, setProgram] = useState<MyProgram>(() => {
    if (id) {
      const existing = getMyProgram(sid, id);
      if (existing) return existing;
    }
    return emptyProgram();
  });

  // Día con el buscador de ejercicios abierto (solo uno a la vez)
  const [pickerDayId, setPickerDayId] = useState<string | null>(null);

  const isEditing = !!(id && getMyProgram(sid, id));

  /* ── Mutadores inmutables ── */
  const patchProgram = (patch: Partial<MyProgram>) =>
    setProgram((p) => ({ ...p, ...patch }));

  const patchDay = (dayId: string, patch: Partial<ProgramDay>) =>
    setProgram((p) => ({
      ...p,
      days: p.days.map((d) => (d.id === dayId ? { ...d, ...patch } : d)),
    }));

  const addDay = () =>
    setProgram((p) => ({
      ...p,
      days: [
        ...p.days,
        { id: newId(), name: `Día ${p.days.length + 1}`, exercises: [] },
      ],
    }));

  const removeDay = (dayId: string) =>
    setProgram((p) => {
      if (p.days.length <= 1) {
        toast.error("El programa necesita al menos un día");
        return p;
      }
      return { ...p, days: p.days.filter((d) => d.id !== dayId) };
    });

  const addExercise = (dayId: string, ex: ProgramExercise) =>
    setProgram((p) => ({
      ...p,
      days: p.days.map((d) =>
        d.id === dayId ? { ...d, exercises: [...d.exercises, ex] } : d
      ),
    }));

  const patchExercise = (dayId: string, index: number, patch: Partial<ProgramExercise>) =>
    setProgram((p) => ({
      ...p,
      days: p.days.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((e, i) => (i === index ? { ...e, ...patch } : e)),
            }
          : d
      ),
    }));

  const removeExercise = (dayId: string, index: number) =>
    setProgram((p) => ({
      ...p,
      days: p.days.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.filter((_, i) => i !== index) }
          : d
      ),
    }));

  const totalExercises = program.days.reduce((a, d) => a + d.exercises.length, 0);

  const save = () => {
    if (!program.name.trim()) {
      toast.error("Ponele un nombre a tu programa");
      return;
    }
    if (totalExercises === 0) {
      toast.error("Agregá al menos un ejercicio");
      return;
    }
    const toSave: MyProgram = {
      ...program,
      name: program.name.trim(),
      daysPerWeek: program.days.length,
    };
    saveMyProgram(sid, toSave);
    toast.success("Programa guardado 💪");
    navigate(`/programa/${toSave.id}`);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow={
          <>
            <Dumbbell className="w-3.5 h-3.5" />
            Programa propio
          </>
        }
        title={isEditing ? "Editar programa" : "Nuevo programa"}
        maxWidth="max-w-2xl lg:max-w-3xl"
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
        className="min-h-screen bg-background pb-44"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-5 lg:px-8 pt-5 space-y-4">
          {/* Datos del programa */}
          <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="accent-bar" />
              <h2 className="text-sm font-black text-foreground tracking-tight">Tu programa</h2>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-0.5">
                Nombre
              </span>
              <input
                value={program.name}
                onChange={(e) => patchProgram({ name: e.target.value })}
                placeholder="Ej: Fuerza 4 días"
                className="w-full min-w-0 h-11 rounded-xl bg-secondary border border-border px-3 text-base font-bold text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-0.5">
                Descripción (opcional)
              </span>
              <textarea
                value={program.description ?? ""}
                onChange={(e) => patchProgram({ description: e.target.value })}
                placeholder="¿De qué trata tu plan?"
                rows={2}
                className="w-full min-w-0 rounded-xl bg-secondary border border-border px-3 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none resize-none"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-0.5">
                Nivel (opcional)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map((lvl) => {
                  const active = program.level === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => patchProgram({ level: active ? undefined : lvl })}
                      className={[
                        "px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-colors",
                        active
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-secondary/60 border-white/[0.06] text-muted-foreground active:text-foreground",
                      ].join(" ")}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Días */}
          {program.days.map((day, dayIdx) => {
            const pickerOpen = pickerDayId === day.id;
            return (
              <motion.div
                key={day.id}
                variants={fadeUp}
                className="card-elevated rounded-2xl overflow-hidden"
              >
                {/* Encabezado del día — nombre editable + eliminar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <input
                    value={day.name}
                    onChange={(e) => patchDay(day.id, { name: e.target.value })}
                    placeholder={`Día ${dayIdx + 1}`}
                    className="flex-1 min-w-0 bg-transparent text-sm font-black text-foreground tracking-tight focus:outline-none placeholder:text-muted-foreground/60"
                  />
                  <span className="text-[11px] font-bold text-muted-foreground tabular-nums shrink-0">
                    {day.exercises.length} ej.
                  </span>
                  <button
                    onClick={() => removeDay(day.id)}
                    aria-label="Eliminar día"
                    className="text-muted-foreground/50 hover:text-destructive p-1 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Ejercicios del día */}
                <div className="p-3 space-y-2">
                  <AnimatePresence initial={false}>
                    {day.exercises.map((ex, i) => (
                      <motion.div
                        key={`${day.id}-${i}-${ex.name}`}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <ExerciseRow
                          ex={ex}
                          onChange={(patch) => patchExercise(day.id, i, patch)}
                          onRemove={() => removeExercise(day.id, i)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {day.exercises.length === 0 && !pickerOpen && (
                    <p className="text-xs text-muted-foreground px-1 py-2">
                      Sin ejercicios todavía
                    </p>
                  )}

                  {/* Buscador de ejercicio (toggle) */}
                  {pickerOpen ? (
                    <div className="rounded-xl border border-dashed border-primary/30 p-3">
                      <ExercisePicker
                        library={library}
                        libraryLoading={libraryLoading}
                        onPick={(ex) => {
                          addExercise(day.id, ex);
                          // mantengo abierto para seguir agregando
                        }}
                      />
                      <button
                        onClick={() => setPickerDayId(null)}
                        className="w-full mt-2.5 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold text-muted-foreground active:text-foreground"
                      >
                        <ChevronDown className="w-4 h-4" /> Listo
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPickerDayId(day.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 text-sm font-bold text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4 text-primary" /> Agregar ejercicio
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Agregar día */}
          <motion.button
            variants={fadeUp}
            onClick={addDay}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 text-sm font-bold text-foreground transition-colors"
          >
            <Plus className="w-4 h-4 text-primary" /> Agregar día
          </motion.button>
        </div>
      </motion.div>

      {/* CTA fijo — Guardar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-5 pt-10 bg-gradient-to-t from-background via-background to-transparent pointer-events-none"
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="max-w-2xl lg:max-w-3xl mx-auto pointer-events-auto">
          <motion.button
            onClick={save}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-black uppercase tracking-wide shadow-lg glow-primary flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Guardar programa
          </motion.button>
        </div>
      </div>
    </AppShell>
  );
}
