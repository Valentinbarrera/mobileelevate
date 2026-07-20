/**
 * Wizard de programas PROPIOS del alumno — 3 pasos:
 *   1. Configurar  → nombre + semanas + días/semana
 *   2. Elegir split → plantilla que arma el esqueleto de días (o "desde cero")
 *   3. Ejercicios   → por cada día: grupo muscular → ejercicio → series/reps/RIR
 *
 * Guardado LOCAL (src/lib/myPrograms). Sin IA. Se monta en "/programas/nuevo"
 * (crear) y "/programa/:id/editar" (editar → arranca en el paso de ejercicios).
 */
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  X,
  Search,
  Dumbbell,
  Save,
  Calendar,
  Check,
  LayoutGrid,
  BookMarked,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
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
  groupDaysByWeek,
  programWeekCount,
  type MyProgram,
  type ProgramDay,
  type ProgramExercise,
} from "@/lib/myPrograms";
import {
  presetsForDays,
  daysFromPreset,
  blankDays,
  type SplitPreset,
} from "@/lib/splitPresets";
import { MUSCLE_GROUPS, exerciseMatchesGroup, type MuscleGroup } from "@/lib/muscleGroups";
import {
  loadDayTemplates,
  saveDayTemplate,
  deleteDayTemplate,
  type DayTemplate,
} from "@/lib/dayTemplates";
import { staggerContainer, fadeUp } from "@/lib/animations";

type Step = "config" | "split" | "exercises";

const WEEK_OPTIONS = [4, 6, 8, 12];
const DAY_OPTIONS = [1, 2, 3, 4, 5, 6];

/**
 * Semana de un día, tolerante con programas viejos: sin `week` (o inválida)
 * cuenta como semana 1, igual que en groupDaysByWeek.
 */
const weekOf = (d: ProgramDay) => (d.week && d.week > 0 ? d.week : 1);

/* ── Tile de opción (chip grande tipo la referencia) ── */
const OptionTile = ({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub?: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex-1 min-w-0 rounded-2xl border py-4 px-2 flex flex-col items-center justify-center gap-0.5 transition-all active:scale-[0.97] ${
      active
        ? "bg-primary/15 border-primary text-primary"
        : "bg-secondary/50 border-white/[0.06] text-foreground hover:border-primary/30"
    }`}
  >
    <span className="text-xl font-black tabular-nums">{label}</span>
    {sub && <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{sub}</span>}
  </button>
);

/* ── Selector de ejercicio por grupo muscular (con ilustración) ── */
const MuscleExercisePicker = ({
  library,
  libraryLoading,
  suggested,
  onPick,
  onClose,
}: {
  library: LibraryExercise[];
  libraryLoading: boolean;
  suggested: string[];
  onPick: (ex: ProgramExercise) => void;
  onClose: () => void;
}) => {
  const [group, setGroup] = useState<MuscleGroup | null>(null);
  const [term, setTerm] = useState("");

  // Grupos sugeridos primero (según el foco del día)
  const groups = useMemo(() => {
    const rank = (g: MuscleGroup) => (suggested.includes(g.id) ? 0 : 1);
    return [...MUSCLE_GROUPS].sort((a, b) => rank(a) - rank(b));
  }, [suggested]);

  const results = useMemo(() => {
    if (!group) return [];
    const q = term.trim().toLowerCase();
    return library
      .filter((e) => exerciseMatchesGroup(e.muscle, group))
      .filter((e) => !q || e.name.toLowerCase().includes(q))
      .slice(0, 30);
  }, [library, group, term]);

  const addLibrary = (lib: LibraryExercise) => {
    onPick({
      name: lib.name,
      sets: 3,
      reps: "8-12",
      restSeconds: 90,
      rir: 2,
      muscleGroup: group?.label ?? lib.muscle ?? null,
      exerciseId: lib.id,
    });
    toast.success(`${lib.name} agregado`);
  };

  const addFreeText = () => {
    const name = term.trim();
    if (!name) return;
    onPick({
      name,
      sets: 3,
      reps: "8-12",
      restSeconds: 90,
      rir: 2,
      muscleGroup: group?.label ?? null,
      exerciseId: null,
    });
    setTerm("");
    toast.success(`${name} agregado`);
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-secondary/30 p-3">
      {/* Header del picker */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5" />
          {group ? group.label : "Elegí grupo muscular"}
        </p>
        <button onClick={onClose} aria-label="Cerrar" className="text-muted-foreground p-1 active:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {!group ? (
        /* Grilla de grupos musculares con ilustración */
        <div className="grid grid-cols-3 gap-2">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroup(g)}
              className="rounded-xl border border-white/[0.06] bg-secondary/50 p-2.5 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              style={suggested.includes(g.id) ? { borderColor: `hsl(${g.hue} / 0.4)` } : undefined}
            >
              <span
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                style={{ background: `hsl(${g.hue} / 0.16)`, border: `1px solid hsl(${g.hue} / 0.3)` }}
              >
                {g.emoji}
              </span>
              <span className="text-[11px] font-bold text-foreground leading-none text-center">{g.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <>
          {/* Volver a grupos + buscador */}
          <div className="flex items-center gap-2 mb-2.5">
            <button
              onClick={() => setGroup(null)}
              className="shrink-0 flex items-center gap-1 text-xs font-bold text-primary px-2 py-1.5 rounded-lg bg-primary/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Grupos
            </button>
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (results[0] ? addLibrary(results[0]) : addFreeText())}
                enterKeyHint="done"
                placeholder={`Buscar en ${group.label}…`}
                className="w-full min-w-0 h-10 pl-10 pr-3 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto scrollbar-hide">
            {results.map((ex) => (
              <button
                key={ex.id}
                onClick={() => addLibrary(ex)}
                className="flex items-center gap-2.5 w-full rounded-xl bg-secondary/60 border border-white/[0.06] p-2 text-left active:opacity-70"
              >
                <div className="w-9 h-9 rounded-lg bg-secondary overflow-hidden shrink-0 flex items-center justify-center">
                  {ex.thumbnailUrl ? (
                    <img src={ex.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Dumbbell className="w-4 h-4 text-muted-foreground/40" />
                  )}
                </div>
                <p className="text-sm font-bold text-foreground truncate flex-1 min-w-0">{ex.name}</p>
                <Plus className="w-4 h-4 text-primary shrink-0" />
              </button>
            ))}

            {libraryLoading && results.length === 0 && (
              <p className="text-xs text-muted-foreground px-1 py-2">Cargando biblioteca…</p>
            )}

            {!libraryLoading && results.length === 0 && !term && (
              <p className="text-xs text-muted-foreground px-1 py-2">
                No hay ejercicios de {group.label} en la biblioteca. Escribí uno abajo.
              </p>
            )}

            {/* Fallback texto libre */}
            {term.trim() && (
              <button
                onClick={addFreeText}
                className="flex items-center gap-2.5 w-full rounded-xl border border-dashed border-primary/40 p-2 text-left active:opacity-70"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground truncate">Agregar “{term.trim()}”</p>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/* ── Fila de un ejercicio: nombre + Series / Reps / RIR + descanso ── */
const ExerciseRow = ({
  ex,
  onChange,
  onRemove,
}: {
  ex: ProgramExercise;
  onChange: (patch: Partial<ProgramExercise>) => void;
  onRemove: () => void;
}) => (
  <div className="rounded-xl bg-secondary/40 border border-white/[0.06] p-3">
    <div className="flex items-center justify-between gap-2 mb-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
          <Dumbbell className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{ex.name}</p>
          {ex.muscleGroup && (
            <p className="text-[11px] font-semibold text-primary capitalize truncate">{ex.muscleGroup}</p>
          )}
        </div>
      </div>
      <button onClick={onRemove} aria-label="Quitar ejercicio" className="text-muted-foreground/50 hover:text-destructive p-1 shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>

    <div className="grid grid-cols-3 gap-2">
      <label className="flex flex-col gap-1 min-w-0">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-0.5">Series</span>
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
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-0.5">Reps</span>
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
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-0.5">RIR (0-5)</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={5}
          value={ex.rir ?? ""}
          onChange={(e) => {
            const v = e.target.value === "" ? null : Math.max(0, Math.min(5, parseInt(e.target.value, 10) || 0));
            onChange({ rir: v });
          }}
          onFocus={(e) => e.target.select()}
          placeholder="2"
          className="w-full min-w-0 h-10 rounded-lg bg-secondary border border-border text-center text-sm font-bold text-foreground focus:border-primary focus:outline-none"
        />
      </label>
    </div>

    <div className="mt-2 flex items-center justify-center gap-2">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Descanso</span>
      <input
        type="number"
        inputMode="numeric"
        value={ex.restSeconds || ""}
        onChange={(e) => onChange({ restSeconds: parseInt(e.target.value, 10) || 0 })}
        onFocus={(e) => e.target.select()}
        placeholder="90"
        className="w-16 h-8 rounded-lg bg-secondary border border-border text-center text-xs font-bold text-foreground focus:border-primary focus:outline-none"
      />
      <span className="text-[10px] font-semibold text-muted-foreground">seg</span>
    </div>
  </div>
);

/* ── Indicador de pasos ── */
const StepDots = ({ step }: { step: Step }) => {
  const order: Step[] = ["config", "split", "exercises"];
  const idx = order.indexOf(step);
  return (
    <div className="flex items-center justify-center gap-2 mb-1">
      {order.map((s, i) => (
        <div
          key={s}
          className={`h-1.5 rounded-full transition-all ${
            i <= idx ? "bg-primary w-6" : "bg-secondary w-2.5"
          }`}
        />
      ))}
    </div>
  );
};

export default function MyProgramBuilder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");
  const { exercises: library, loading: libraryLoading } = useExerciseLibrary();

  const existing = useMemo(() => (id ? getMyProgram(sid, id) : null), [id, sid]);
  const isEditing = !!existing;

  const [program, setProgram] = useState<MyProgram>(() => existing ?? { ...emptyProgram(), weeks: 8, days: [] });
  const [step, setStep] = useState<Step>(isEditing ? "exercises" : "config");
  // Los días/semana se cuentan sobre la semana 1: en un programa con varias
  // semanas, program.days.length es el TOTAL, no los días semanales.
  const [daysPerWeek, setDaysPerWeek] = useState<number>(
    existing ? existing.days.filter((d) => weekOf(d) === 1).length : 0
  );
  // Identificamos el día activo por id y no por índice: con las semanas la lista
  // visible se filtra y un índice apuntaría al día equivocado.
  const [activeDayId, setActiveDayId] = useState<string>(existing?.days[0]?.id ?? "");
  const [activeWeek, setActiveWeek] = useState<number>(existing?.days[0] ? weekOf(existing.days[0]) : 1);
  const [weekMenuOpen, setWeekMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dayTemplates, setDayTemplates] = useState<DayTemplate[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    setDayTemplates(loadDayTemplates(sid));
  }, [sid]);

  const totalExercises = program.days.reduce((a, d) => a + d.exercises.length, 0);

  /* ── Mutadores ── */
  const patchProgram = (patch: Partial<MyProgram>) => setProgram((p) => ({ ...p, ...patch }));

  const patchDay = (dayId: string, patch: Partial<ProgramDay>) =>
    setProgram((p) => ({ ...p, days: p.days.map((d) => (d.id === dayId ? { ...d, ...patch } : d)) }));

  const addExercise = (dayId: string, ex: ProgramExercise) =>
    setProgram((p) => ({
      ...p,
      days: p.days.map((d) => (d.id === dayId ? { ...d, exercises: [...d.exercises, ex] } : d)),
    }));

  const patchExercise = (dayId: string, index: number, patch: Partial<ProgramExercise>) =>
    setProgram((p) => ({
      ...p,
      days: p.days.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.map((e, i) => (i === index ? { ...e, ...patch } : e)) }
          : d
      ),
    }));

  const removeExercise = (dayId: string, index: number) =>
    setProgram((p) => ({
      ...p,
      days: p.days.map((d) =>
        d.id === dayId ? { ...d, exercises: d.exercises.filter((_, i) => i !== index) } : d
      ),
    }));

  /** El día nuevo nace en la semana que se está viendo (cero fricción). */
  const addExtraDay = () =>
    setProgram((p) => {
      const day: ProgramDay = {
        id: newId(),
        name: `Día ${p.days.filter((d) => weekOf(d) === activeWeek).length + 1}`,
        exercises: [],
        week: activeWeek,
      };
      setActiveDayId(day.id);
      return { ...p, days: [...p.days, day] };
    });

  /**
   * Agrega la semana siguiente. Duplicando, copia la estructura de la última
   * semana (el caso real del mesociclo: misma rutina, más carga) con ids NUEVOS
   * para que los días no se pisen entre sí.
   */
  const addWeek = (duplicate: boolean) => {
    setProgram((p) => {
      const nextWeek = programWeekCount(p) + 1;
      const source = duplicate ? p.days.filter((d) => weekOf(d) === nextWeek - 1) : [];
      const days: ProgramDay[] = source.map((d) => ({
        id: newId(),
        name: d.name,
        week: nextWeek,
        exercises: d.exercises.map((e) => ({ ...e })),
      }));
      if (!days.length) days.push({ id: newId(), name: "Día 1", exercises: [], week: nextWeek });
      setActiveWeek(nextWeek);
      setActiveDayId(days[0].id);
      // La duración declarada nunca puede quedar por debajo del diseño real.
      return { ...p, days: [...p.days, ...days], weeks: Math.max(p.weeks ?? 0, nextWeek) };
    });
    setWeekMenuOpen(false);
    setPickerOpen(false);
  };

  /** Mueve un día de semana (respetando el mínimo de 1). */
  const moveDayToWeek = (dayId: string, week: number) => {
    if (week < 1) return;
    patchDay(dayId, { week });
    setActiveWeek(week);
  };

  const removeDay = (dayId: string) =>
    setProgram((p) => {
      if (p.days.length <= 1) {
        toast.error("El programa necesita al menos un día");
        return p;
      }
      const days = p.days.filter((d) => d.id !== dayId);
      if (activeDayId === dayId) {
        const fallback = days.find((d) => weekOf(d) === activeWeek) ?? days[0];
        setActiveDayId(fallback.id);
        setActiveWeek(weekOf(fallback));
      }
      return { ...p, days };
    });

  /* ── Paso 1 → 2 ── */
  const goToSplit = () => {
    if (!program.name.trim()) return toast.error("Ponele un nombre a tu programa");
    if (!daysPerWeek) return toast.error("Elegí cuántos días por semana");
    setStep("split");
  };

  /* ── Paso 2: elegir split o desde cero ── */
  // El esqueleto inicial siempre es la semana 1; después se agregan más semanas.
  const startWithDays = (days: ProgramDay[], splitId?: string) => {
    const week1 = days.map((d) => ({ ...d, week: 1 }));
    setProgram((p) => ({ ...p, days: week1, splitId, daysPerWeek }));
    setActiveDayId(week1[0]?.id ?? "");
    setActiveWeek(1);
    setPickerOpen(false);
    setStep("exercises");
  };
  const chooseSplit = (preset: SplitPreset) => startWithDays(daysFromPreset(preset), preset.id);
  const chooseBlank = () => startWithDays(blankDays(daysPerWeek), undefined);

  /* ── Guardar ── */
  const persist = (opts: { silent?: boolean } = {}) => {
    if (!program.name.trim()) {
      toast.error("Ponele un nombre a tu programa");
      return false;
    }
    // `days` (con su `week`) se guarda entero, así que la semana persiste sola.
    // daysPerWeek se calcula sobre la semana 1 para no contar el mesociclo entero
    // (en programas viejos, sin semanas, da exactamente lo mismo que antes).
    const toSave: MyProgram = {
      ...program,
      name: program.name.trim(),
      daysPerWeek: program.days.filter((d) => weekOf(d) === 1).length || program.days.length,
    };
    saveMyProgram(sid, toSave);
    if (!opts.silent) toast.success("Programa guardado 💪");
    return toSave;
  };

  const finishAndSave = () => {
    if (totalExercises === 0) return toast.error("Agregá al menos un ejercicio");
    const saved = persist();
    if (saved) navigate(`/programa/${saved.id}`);
  };

  const saveAndExit = () => {
    const saved = persist({ silent: true });
    if (saved) {
      toast.success("Guardado. Podés seguir después.");
      navigate(`/programa/${saved.id}`);
    }
  };

  const availablePresets = useMemo(() => presetsForDays(daysPerWeek), [daysPerWeek]);

  /* ── Semanas ── */
  const weekGroups = useMemo(() => groupDaysByWeek(program), [program]);
  // Fallback defensivo: si la semana activa quedó vacía (borré su último día),
  // caemos a la primera que tenga días, así nunca se ve una pantalla en blanco.
  const currentGroup = weekGroups.find((g) => g.week === activeWeek) ?? weekGroups[0];
  const weekDays = currentGroup?.days ?? [];
  const activeDay = weekDays.find((d) => d.id === activeDayId) ?? weekDays[0];
  const activeDayIdx = activeDay ? weekDays.findIndex((d) => d.id === activeDay.id) : -1;
  const isLastDay = activeDayIdx >= weekDays.length - 1;

  /* ── Plantillas de día (guardar / usar) ── */
  const saveDayAsTemplate = () => {
    if (!activeDay) return;
    if (activeDay.exercises.length === 0) {
      toast.error("Agregá ejercicios antes de guardar la plantilla");
      return;
    }
    setDayTemplates(saveDayTemplate(sid, activeDay.name, activeDay.exercises));
    toast.success(`Plantilla "${activeDay.name}" guardada`);
  };
  const applyDayTemplate = (t: DayTemplate) => {
    if (!activeDay) return;
    patchDay(activeDay.id, { exercises: t.exercises.map((e) => ({ ...e })) });
    setShowTemplates(false);
    toast.success(`"${t.name}" aplicada a ${activeDay.name}`);
  };
  const removeDayTemplateById = (t: DayTemplate) => {
    setDayTemplates(deleteDayTemplate(sid, t.id));
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow={
          <>
            <Dumbbell className="w-3.5 h-3.5" />
            {step === "config" ? "Configurar" : step === "split" ? "Elegí tu split" : "Ejercicios"}
          </>
        }
        title={isEditing ? "Editar programa" : "Nuevo programa"}
        maxWidth="max-w-2xl lg:max-w-3xl"
        left={
          <button
            onClick={() => (step === "exercises" && !isEditing ? setStep("split") : step === "split" ? setStep("config") : navigate(-1))}
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
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-5 lg:px-8 pt-3 space-y-4">
          {!isEditing && <StepDots step={step} />}

          {/* ─────────── PASO 1: CONFIGURAR ─────────── */}
          {step === "config" && (
            <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-4 space-y-5">
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  ¿Cómo se llama tu programa?
                </span>
                <input
                  value={program.name}
                  onChange={(e) => patchProgram({ name: e.target.value })}
                  placeholder="Ej: Hipertrofia 4 días"
                  autoFocus
                  className="mt-1.5 w-full min-w-0 h-12 rounded-xl bg-secondary border border-border px-3.5 text-base font-bold text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  ¿De cuántas semanas?
                </span>
                <div className="mt-1.5 flex gap-2">
                  {WEEK_OPTIONS.map((w) => (
                    <OptionTile
                      key={w}
                      label={String(w)}
                      sub="sem"
                      active={program.weeks === w}
                      onClick={() => patchProgram({ weeks: w })}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  ¿Cuántos días por semana?
                </span>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {DAY_OPTIONS.map((d) => (
                    <OptionTile
                      key={d}
                      label={String(d)}
                      sub={d === 1 ? "día" : "días"}
                      active={daysPerWeek === d}
                      onClick={() => setDaysPerWeek(d)}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ─────────── PASO 2: ELEGIR SPLIT ─────────── */}
          {step === "split" && (
            <motion.div variants={fadeUp} className="space-y-3">
              <p className="text-sm text-muted-foreground px-1">
                Elegí una estructura de {daysPerWeek} {daysPerWeek === 1 ? "día" : "días"} para empezar. Después la
                editás como quieras.
              </p>

              {availablePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => chooseSplit(preset)}
                  className="w-full text-left card-elevated rounded-2xl p-4 active:scale-[0.99] hover:border-primary/40 border border-transparent transition-all"
                >
                  <h3 className="text-base font-black text-foreground tracking-tight mb-2">{preset.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {preset.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold text-primary bg-primary/12 border border-primary/25 rounded-full px-2 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{preset.description}</p>
                </button>
              ))}

              <button
                onClick={chooseBlank}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 text-sm font-bold text-foreground transition-colors"
              >
                <Plus className="w-4 h-4 text-primary" /> Empezar de cero ({daysPerWeek} {daysPerWeek === 1 ? "día" : "días"} vacíos)
              </button>
            </motion.div>
          )}

          {/* ─────────── PASO 3: EJERCICIOS POR DÍA ─────────── */}
          {step === "exercises" && activeDay && (
            <motion.div variants={fadeUp} className="space-y-4">
              {/* Pestañas de semana: el mesociclo se navega semana por semana */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
                {weekGroups.map((g) => {
                  const active = g.week === (currentGroup?.week ?? 1);
                  return (
                    <button
                      key={g.week}
                      type="button"
                      onClick={() => {
                        setActiveWeek(g.week);
                        setActiveDayId(g.days[0]?.id ?? "");
                        setPickerOpen(false);
                        setWeekMenuOpen(false);
                      }}
                      className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-colors ${
                        active
                          ? "bg-primary/15 text-primary border-primary/40"
                          : "bg-secondary/50 text-muted-foreground border-white/[0.06]"
                      }`}
                    >
                      Semana {g.week}
                      <span className="ml-1.5 opacity-60 tabular-nums">{g.days.length}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setWeekMenuOpen((v) => !v)}
                  aria-label="Agregar semana"
                  className="shrink-0 w-9 h-9 rounded-xl border border-dashed border-white/15 flex items-center justify-center text-primary active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cómo nace la semana nueva: vacía o clonando la anterior */}
              {weekMenuOpen && (
                <div className="rounded-2xl border border-primary/25 bg-secondary/30 p-3 space-y-2">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    Nueva semana {programWeekCount(program) + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => addWeek(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary/60 border border-white/[0.06] text-sm font-bold text-foreground active:scale-[0.99] transition-transform"
                  >
                    <Copy className="w-4 h-4 text-primary" /> Duplicar semana {programWeekCount(program)}
                  </button>
                  <button
                    type="button"
                    onClick={() => addWeek(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-white/10 text-sm font-bold text-foreground active:scale-[0.99] transition-transform"
                  >
                    <Plus className="w-4 h-4 text-primary" /> Empezar vacía
                  </button>
                </div>
              )}

              {/* Tabs de días (solo los de la semana activa) */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
                {weekDays.map((d) => {
                  const active = d.id === activeDay.id;
                  const count = d.exercises.length;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setActiveDayId(d.id);
                        setPickerOpen(false);
                      }}
                      className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                        active
                          ? "bg-primary/15 text-primary border-primary/40"
                          : "bg-secondary/50 text-muted-foreground border-white/[0.06]"
                      }`}
                    >
                      {d.name}
                      <span className="ml-1.5 opacity-60 tabular-nums">{count}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={addExtraDay}
                  aria-label="Agregar día"
                  className="shrink-0 w-9 h-9 rounded-xl border border-dashed border-white/15 flex items-center justify-center text-primary active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Editor del día activo */}
              <div className="card-elevated rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <input
                    value={activeDay.name}
                    onChange={(e) => patchDay(activeDay.id, { name: e.target.value })}
                    placeholder={`Día ${activeDayIdx + 1}`}
                    className="flex-1 min-w-0 bg-transparent text-sm font-black text-foreground tracking-tight focus:outline-none placeholder:text-muted-foreground/60"
                  />
                  {/* Stepper de semana al lado del nombre: mover el día sin salir del editor */}
                  <div className="flex items-center gap-0.5 shrink-0 rounded-lg bg-secondary/60 border border-white/[0.06] px-1 py-0.5">
                    <button
                      type="button"
                      onClick={() => moveDayToWeek(activeDay.id, weekOf(activeDay) - 1)}
                      disabled={weekOf(activeDay) <= 1}
                      aria-label="Mover el día a la semana anterior"
                      className="text-muted-foreground p-0.5 disabled:opacity-30 active:text-foreground"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider tabular-nums px-0.5">
                      Sem {weekOf(activeDay)}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveDayToWeek(activeDay.id, weekOf(activeDay) + 1)}
                      aria-label="Mover el día a la semana siguiente"
                      className="text-muted-foreground p-0.5 active:text-foreground"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDay(activeDay.id)}
                    aria-label="Eliminar día"
                    className="text-muted-foreground/50 hover:text-destructive p-1 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 space-y-2">
                  <AnimatePresence initial={false}>
                    {activeDay.exercises.map((ex, i) => (
                      <motion.div
                        key={`${activeDay.id}-${i}-${ex.name}`}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        <ExerciseRow
                          ex={ex}
                          onChange={(patch) => patchExercise(activeDay.id, i, patch)}
                          onRemove={() => removeExercise(activeDay.id, i)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {activeDay.exercises.length === 0 && !pickerOpen && (
                    <p className="text-xs text-muted-foreground px-1 py-2">Sin ejercicios todavía en {activeDay.name}.</p>
                  )}

                  {pickerOpen ? (
                    <MuscleExercisePicker
                      library={library}
                      libraryLoading={libraryLoading}
                      suggested={[]}
                      onPick={(ex) => addExercise(activeDay.id, ex)}
                      onClose={() => setPickerOpen(false)}
                    />
                  ) : (
                    <button
                      onClick={() => setPickerOpen(true)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 text-sm font-bold text-foreground transition-colors"
                    >
                      <Plus className="w-4 h-4 text-primary" /> Agregar ejercicio
                    </button>
                  )}

                  {/* Plantillas de día: guardar el día actual / reusar uno guardado */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveDayAsTemplate}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary/60 border border-white/[0.06] text-xs font-bold text-foreground active:scale-95 transition-transform"
                    >
                      <BookMarked className="w-3.5 h-3.5 text-primary" /> Guardar plantilla
                    </button>
                    <button
                      onClick={() => setShowTemplates((v) => !v)}
                      disabled={dayTemplates.length === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary/60 border border-white/[0.06] text-xs font-bold text-foreground active:scale-95 transition-transform disabled:opacity-40"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-primary" /> Usar plantilla
                    </button>
                  </div>

                  {showTemplates && dayTemplates.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {dayTemplates.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-2 rounded-xl bg-secondary/40 border border-white/[0.06] p-2"
                        >
                          <button onClick={() => applyDayTemplate(t)} className="flex-1 min-w-0 text-left active:opacity-70">
                            <p className="text-sm font-bold text-foreground truncate">{t.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {t.exercises.length} {t.exercises.length === 1 ? "ejercicio" : "ejercicios"}
                            </p>
                          </button>
                          <button
                            onClick={() => removeDayTemplateById(t)}
                            aria-label="Borrar plantilla"
                            className="text-muted-foreground/50 hover:text-destructive p-1 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Navegación entre días */}
              {!isLastDay ? (
                <button
                  type="button"
                  onClick={() => {
                    const next = weekDays[activeDayIdx + 1];
                    if (next) setActiveDayId(next.id);
                    setPickerOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-secondary/60 border border-white/[0.06] text-sm font-bold text-foreground active:scale-[0.99] transition-transform"
                >
                  Guardar día y siguiente
                  <ArrowRight className="w-4 h-4 text-primary" />
                </button>
              ) : null}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ── CTA fijo por paso ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 px-5 pt-10 bg-gradient-to-t from-background via-background to-transparent pointer-events-none"
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="max-w-2xl lg:max-w-3xl mx-auto pointer-events-auto space-y-2">
          {step === "config" && (
            <motion.button
              onClick={goToSplit}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-black uppercase tracking-wide shadow-lg glow-primary flex items-center justify-center gap-2"
            >
              Siguiente <ArrowRight className="w-5 h-5" />
            </motion.button>
          )}

          {step === "exercises" && (
            <>
              <motion.button
                onClick={finishAndSave}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl bg-gradient-primary text-primary-foreground font-black uppercase tracking-wide shadow-lg glow-primary flex items-center justify-center gap-2"
              >
                {isLastDay ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                Guardar programa
              </motion.button>
              <button
                onClick={saveAndExit}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-muted-foreground active:text-foreground"
              >
                Guardar y salir (continuar después)
              </button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
