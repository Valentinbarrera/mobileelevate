/**
 * Bloques reutilizables para mostrar la PRESCRIPCIÓN del coach en el ejercicio:
 * Series · Reps · Descanso · RIR · Tempo + método (biserie/superserie/dropset),
 * y la TÉCNICA / EJECUCIÓN + el paso a paso (posición/instrucciones).
 *
 * Los datos ya vienen de routine_exercises (rir, tempo, training_method, type)
 * y de exercises (description, instructions). El coach los carga desde la PC.
 */
import { useState } from "react";
import { Layers, Timer, Target, Gauge, Repeat2, Pencil } from "lucide-react";

export interface PrescriptionData {
  sets: number;
  reps: string;
  restSeconds?: number | null;
  rir?: number | null;
  tempo?: string | null;
  method?: string | null; // training_method o type
}

const fmtRest = (s: number) =>
  s >= 60 ? `${Math.floor(s / 60)}′${s % 60 ? String(s % 60).padStart(2, "0") + "″" : ""}` : `${s}″`;

// Métodos que NO son "serie normal" → merecen badge / agrupado (biserie, superserie…)
export const isSpecialMethod = (m?: string | null) => {
  if (!m) return false;
  const v = m.trim().toLowerCase();
  return v !== "" && !["normal", "standard", "estandar", "estándar", "simple", "recta", "directa"].includes(v);
};

const Chip = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Timer;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-1.5 rounded-lg bg-secondary/60 border border-white/[0.06] px-2 py-1.5">
    <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
    <span className="text-sm font-black text-foreground tabular-nums">{value}</span>
  </div>
);

/** Lo que el alumno puede ajustar de la prescripción para la sesión de hoy. */
export type PrescriptionEdit = Pick<PrescriptionData, "sets" | "reps" | "restSeconds" | "rir" | "tempo">;

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-1">
    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
    {children}
  </label>
);

const inputCls =
  "w-full min-h-11 rounded-lg bg-background border border-white/10 px-3 text-base font-bold text-foreground tabular-nums focus:border-primary/60 focus:outline-none";

/**
 * Editor de la prescripción para HOY.
 *
 * No pisa lo que armó el coach: el cambio vive en la sesión en curso y se
 * pierde al salir. Sirve para el dia real —llegaste con menos tiempo, te duele
 * algo, la barra esta ocupada— sin romper la progresion que el coach planifico
 * ni dejarlo sin saber que prescribio. Lo que el alumno efectivamente hizo ya
 * se registra aparte, serie por serie.
 */
const PrescriptionEditor = ({
  data,
  minSets = 1,
  onChange,
  onDone,
}: {
  data: PrescriptionData;
  minSets?: number;
  onChange: (next: PrescriptionEdit) => void;
  onDone: () => void;
}) => {
  const patch = (p: Partial<PrescriptionEdit>) =>
    onChange({
      sets: data.sets,
      reps: data.reps,
      restSeconds: data.restSeconds ?? null,
      rir: data.rir ?? null,
      tempo: data.tempo ?? null,
      ...p,
    });

  return (
    <div className="rounded-xl bg-secondary/40 border border-white/[0.06] p-3 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Series">
          <input
            type="number"
            inputMode="numeric"
            min={minSets}
            max={20}
            value={data.sets}
            onChange={(e) => patch({ sets: Math.max(minSets, Math.min(20, Number(e.target.value) || minSets)) })}
            className={inputCls}
          />
        </Field>
        <Field label="Reps">
          <input
            type="text"
            value={data.reps}
            onChange={(e) => patch({ reps: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Descanso (seg)">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={600}
            step={15}
            value={data.restSeconds ?? 0}
            onChange={(e) => patch({ restSeconds: Math.max(0, Math.min(600, Number(e.target.value) || 0)) })}
            className={inputCls}
          />
        </Field>
        <Field label="RIR">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={10}
            value={data.rir ?? 0}
            onChange={(e) => patch({ rir: Math.max(0, Math.min(10, Number(e.target.value) || 0)) })}
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Tempo">
        <input
          type="text"
          placeholder="3-1-1-0"
          value={data.tempo ?? ""}
          onChange={(e) => patch({ tempo: e.target.value || null })}
          className={inputCls}
        />
      </Field>
      <button
        type="button"
        onClick={onDone}
        className="w-full min-h-11 rounded-lg bg-primary/15 border border-primary/30 text-sm font-black text-primary active:scale-[0.98] transition-transform"
      >
        Listo
      </button>
    </div>
  );
};

/**
 * Tira de chips con la prescripción del coach.
 * Con `editable`, el alumno puede ajustarla para la sesión de hoy.
 */
export const PrescriptionStrip = ({
  data,
  editable = false,
  edited = false,
  minSets,
  onChange,
  onReset,
}: {
  data: PrescriptionData;
  editable?: boolean;
  edited?: boolean;
  /** Piso de series: las que el alumno ya completó en esta sesión. */
  minSets?: number;
  onChange?: (next: PrescriptionEdit) => void;
  onReset?: () => void;
}) => {
  const [editing, setEditing] = useState(false);
  const special = isSpecialMethod(data.method);

  if (editing && onChange) {
    return (
      <PrescriptionEditor
        data={data}
        minSets={minSets}
        onChange={onChange}
        onDone={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Chip icon={Repeat2} label="Series" value={`${data.sets} × ${data.reps}`} />
        {data.restSeconds != null && data.restSeconds > 0 && (
          <Chip icon={Timer} label="Descanso" value={fmtRest(data.restSeconds)} />
        )}
        {data.rir != null && <Chip icon={Target} label="RIR" value={String(data.rir)} />}
        {data.tempo && <Chip icon={Gauge} label="Tempo" value={data.tempo} />}
        {special && (
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-sm font-black text-amber-400 capitalize">{data.method}</span>
          </div>
        )}
        {editable && onChange && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Ajustar la prescripción para hoy"
            className="min-h-11 w-11 -my-1 flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>

      {edited && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Ajustado para hoy</span>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="min-h-11 -my-3 text-[11px] font-bold text-muted-foreground underline underline-offset-2"
            >
              Volver a lo del coach
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/** Chip de bloque (biserie/superserie): "Superserie A" + posición A1/2. */
export const SupersetTag = ({
  type,
  letter,
  position,
  size,
}: {
  type: string;
  letter: string;
  position: number;
  size: number;
}) => (
  <div className="flex items-center gap-1.5">
    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-[11px] font-black text-amber-400 uppercase tracking-wider">
      <Layers className="w-3 h-3 inline-block -mt-0.5 mr-1" />
      <span className="capitalize">{type}</span> {letter}
    </span>
    <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
      {letter}
      {position}
      <span className="text-muted-foreground/50"> · {position}/{size}</span>
    </span>
  </div>
);

/** Técnica / ejecución (description) + paso a paso (instructions). */
export const TechniqueBlock = ({
  description,
  instructions,
}: {
  description?: string | null;
  instructions?: string[] | null;
}) => {
  const hasDesc = !!description?.trim();
  const steps = (instructions || []).filter((s) => s?.trim());
  if (!hasDesc && steps.length === 0) return null;

  return (
    /* La posición inicial va PRIMERO: es lo que hacés antes de la primera
       repetición. La técnica describe el movimiento, que viene después. Estaba
       al revés y se leía fuera de secuencia. */
    <div className="rounded-xl bg-secondary/30 border border-white/[0.06] p-3 space-y-3">
      {steps.length > 0 && (
        <div>
          <p className="text-[13px] font-bold text-primary uppercase tracking-wider mb-2">Posición inicial</p>
          <ol className="space-y-1.5">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground/85 leading-relaxed">
                <span className="shrink-0 w-5 h-5 rounded-md bg-primary/15 text-primary text-[11px] font-black flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {hasDesc && (
        <div>
          <p className="text-[13px] font-bold text-primary uppercase tracking-wider mb-1.5">Técnica y ejecución</p>
          <p className="text-sm text-foreground/85 leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  );
};
