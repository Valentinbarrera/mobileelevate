/**
 * Bloques reutilizables para mostrar la PRESCRIPCIÓN del coach en el ejercicio:
 * Series · Reps · Descanso · RIR · Tempo + método (biserie/superserie/dropset),
 * y la TÉCNICA / EJECUCIÓN + el paso a paso (posición/instrucciones).
 *
 * Los datos ya vienen de routine_exercises (rir, tempo, training_method, type)
 * y de exercises (description, instructions). El coach los carga desde la PC.
 */
import { Layers, Timer, Target, Gauge, Repeat2 } from "lucide-react";

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

// Métodos que NO son "serie normal" → merecen badge
const isSpecialMethod = (m?: string | null) => {
  if (!m) return false;
  const v = m.toLowerCase();
  return !["normal", "standard", "estandar", "estándar", "simple", "recta"].includes(v);
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
    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
    <span className="text-xs font-black text-foreground tabular-nums">{value}</span>
  </div>
);

/** Tira de chips con la prescripción. Solo muestra lo que el coach cargó. */
export const PrescriptionStrip = ({ data }: { data: PrescriptionData }) => {
  const special = isSpecialMethod(data.method);
  return (
    <div className="flex flex-wrap gap-1.5">
      <Chip icon={Repeat2} label="Series" value={`${data.sets} × ${data.reps}`} />
      {data.restSeconds != null && data.restSeconds > 0 && (
        <Chip icon={Timer} label="Descanso" value={fmtRest(data.restSeconds)} />
      )}
      {data.rir != null && <Chip icon={Target} label="RIR" value={String(data.rir)} />}
      {data.tempo && <Chip icon={Gauge} label="Tempo" value={data.tempo} />}
      {special && (
        <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-black text-amber-400 capitalize">{data.method}</span>
        </div>
      )}
    </div>
  );
};

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
    <div className="rounded-xl bg-secondary/30 border border-white/[0.06] p-3 space-y-2.5">
      {hasDesc && (
        <div>
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1">Técnica y ejecución</p>
          <p className="text-sm text-foreground/85 leading-relaxed">{description}</p>
        </div>
      )}
      {steps.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-primary uppercase tracking-wider mb-1.5">Paso a paso</p>
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
    </div>
  );
};
