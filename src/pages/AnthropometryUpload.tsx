/**
 * Subir el informe de antropometría (PDF) y revisar lo que se leyó.
 *
 * Cuatro momentos en una sola pantalla:
 *   1. elegir el archivo
 *   2. procesarlo (lectura del PDF + interpretación)
 *   3. resumen de lo encontrado
 *   4. revisión editable, y recién ahí se guarda
 *
 * El paso de revisión no es un trámite: el informe puede traer una etiqueta
 * rara o un valor que no reconocimos bien, así que TODO es editable antes de
 * guardar y lo dudoso se marca.
 */
import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  X,
  AlertTriangle,
  Calendar,
  Clock,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useEvaluations } from "@/hooks/useEvaluations";
import {
  parseAnthropometryPdf,
  validateMeasurement,
  deriveMissingFields,
  hasAcceptedExtension,
  MAX_FILE_BYTES,
  type ParseResult,
  type ParseStep,
} from "@/lib/anthropometryParser";
import {
  ANTHROPOMETRY_FIELDS,
  FIELDS_BY_ID,
  GROUP_LABELS,
  GROUP_ORDER,
  type FieldGroup,
  type MeasurementValues,
} from "@/types/evaluation";
import { countFilled, formatDate } from "@/lib/anthropometryInsights";

type Stage = "pick" | "processing" | "done" | "review";

const STEPS: { id: ParseStep; title: string; detail: string }[] = [
  { id: "received", title: "Archivo recibido", detail: "" },
  { id: "reading", title: "Leyendo información", detail: "Detectando valores y métricas" },
  { id: "interpreting", title: "Interpretando datos", detail: "Analizando composición corporal" },
  { id: "finishing", title: "Finalizando", detail: "Generando tu resumen" },
];

const prettySize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const AnthropometryUpload = () => {
  const navigate = useNavigate();
  const { save } = useEvaluations();
  const inputRef = useRef<HTMLInputElement>(null);

  const [stage, setStage] = useState<Stage>("pick");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<ParseResult | null>(null);

  // Valores de la revisión: siempre como texto, para poder escribir cómodo.
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  const pickFile = (picked: File | null) => {
    if (!picked) return;
    if (!hasAcceptedExtension(picked.name)) {
      toast.error("Tiene que ser un PDF.");
      return;
    }
    if (picked.size > MAX_FILE_BYTES) {
      toast.error("El archivo pesa más de 20 MB.");
      return;
    }
    setFile(picked);
  };

  const process = useCallback(async () => {
    if (!file) return;
    setStage("processing");
    setStepIndex(0);

    try {
      const parsed = await parseAnthropometryPdf(file, (step) => {
        const index = STEPS.findIndex((s) => s.id === step);
        if (index >= 0) setStepIndex(index);
      });

      // Completamos lo que se puede deducir (IMC, % de grasa) marcándolo.
      const values: MeasurementValues = { ...parsed.values };
      for (const derived of deriveMissingFields(values)) {
        values[derived.fieldId] = derived.value;
      }

      setResult({ ...parsed, values });
      setDate(parsed.measurementDate);
      // Los informes traen precisión de cálculo (24,645 kg de masa muscular);
      // se muestra con los decimales con los que se reporta cada variable.
      setDraft(
        Object.fromEntries(
          Object.entries(values).map(([id, value]) => {
            if (value === null || value === "") return [id, ""];
            const field = FIELDS_BY_ID[id];
            if (typeof value !== "number" || !field || field.type === "text") {
              return [id, String(value)];
            }
            return [id, value.toFixed(field.decimals ?? 1)];
          })
        )
      );
      setStepIndex(STEPS.length);
      setStage("done");
    } catch (error) {
      setStage("pick");
      toast.error(error instanceof Error ? error.message : "No pudimos leer el archivo.");
    }
  }, [file]);

  const reset = () => {
    setFile(null);
    setResult(null);
    setDraft({});
    setStage("pick");
    if (inputRef.current) inputRef.current.value = "";
  };

  const submit = async () => {
    if (saving || !result) return;
    setSaving(true);

    const values: MeasurementValues = {};
    for (const [id, raw] of Object.entries(draft)) {
      const text = raw.trim();
      if (!text) continue;
      const field = FIELDS_BY_ID[id];
      if (field?.type === "text") {
        values[id] = text;
        continue;
      }
      const num = Number(text.replace(",", "."));
      if (Number.isFinite(num)) values[id] = num;
    }

    if (Object.keys(values).length === 0) {
      setSaving(false);
      toast.error("Cargá al menos un valor para guardar la evaluación.");
      return;
    }

    try {
      save({ date, values, sourceFileName: result.fileName });
      toast.success("Evaluación guardada");
      navigate("/antropometria", { replace: true });
    } finally {
      setSaving(false);
    }
  };

  // --- Datos derivados de la revisión ---
  const detectedIds = new Set(result?.detected.map((d) => d.fieldId) ?? []);
  const lowConfidence = new Set(
    result?.detected.filter((d) => d.confidence === "low").map((d) => d.fieldId) ?? []
  );
  const found = result ? countFilled(result.values) : 0;
  const highConfidence = result
    ? result.detected.filter((d) => d.confidence === "high").length
    : 0;
  const accuracy = result && result.detected.length
    ? Math.round((highConfidence / result.detected.length) * 100)
    : 0;

  const groupsWithValues: FieldGroup[] = GROUP_ORDER.filter((group) =>
    ANTHROPOMETRY_FIELDS.some((f) => f.group === group && draft[f.id] !== undefined)
  );

  const warnings = result
    ? validateMeasurement(
        Object.fromEntries(
          Object.entries(draft)
            .map(([id, raw]) => [id, Number(raw.replace(",", "."))])
            .filter(([, v]) => Number.isFinite(v as number))
        ) as MeasurementValues
      )
    : [];

  return (
    <AppShell>
      <PageHeader
        title={stage === "review" ? "Revisar datos" : "Antropometría"}
        left={
          <button
            onClick={() => (stage === "review" ? setStage("done") : navigate(-1))}
            aria-label="Volver"
            className="text-muted-foreground w-11 h-11 -ml-2 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        }
      />

      <div className="min-h-screen bg-background pb-nav">
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-5 lg:px-8 pt-6">
          <AnimatePresence mode="wait">
            {stage === "pick" && (
              <motion.div
                key="pick"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-7">
                  <h2 className="text-2xl font-black tracking-tight text-foreground mb-2">
                    Antropometría
                  </h2>
                  <p className="text-base text-foreground/70 max-w-sm mx-auto">
                    Subí el informe de tu evaluación física en PDF y generamos tus datos
                    automáticamente.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    pickFile(e.dataTransfer.files?.[0] ?? null);
                  }}
                  className={`w-full rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                    dragging ? "border-primary bg-primary/10" : "border-primary/40 bg-primary/[0.04]"
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <p className="font-black text-lg text-foreground">Elegí tu PDF</p>
                  <p className="text-sm text-foreground/60 mt-1">o arrastralo hasta acá</p>
                  <p className="text-xs text-muted-foreground mt-3">Formato PDF · Máx. 20 MB</p>
                </button>

                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                />

                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-elevated rounded-2xl p-3.5 mt-4 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{prettySize(file.size)}</p>
                    </div>
                    <button
                      onClick={reset}
                      aria-label="Quitar archivo"
                      className="w-9 h-9 flex items-center justify-center text-muted-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                <button
                  onClick={process}
                  disabled={!file}
                  className="w-full mt-5 min-h-[52px] rounded-2xl bg-gradient-primary text-primary-foreground font-black text-base active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
                >
                  Subir y procesar
                </button>

                <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-6">
                  <Lock className="w-3.5 h-3.5" />
                  Tus datos están protegidos y solo vos y tu coach pueden verlos.
                </p>
              </motion.div>
            )}

            {stage === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <ProgressRing value={((stepIndex + 1) / (STEPS.length + 1)) * 100} />

                <h2 className="text-xl font-black tracking-tight text-foreground mt-6 mb-1">
                  Procesando tu informe…
                </h2>
                <p className="text-sm text-foreground/70 mb-7">
                  Estamos leyendo tu PDF y extrayendo los datos.
                </p>

                <ul className="text-left space-y-4">
                  {STEPS.map((step, index) => {
                    const done = index < stepIndex;
                    const current = index === stepIndex;
                    return (
                      <li key={step.id} className="flex gap-3">
                        <span
                          className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center border-2 ${
                            done
                              ? "bg-emerald-500 border-emerald-500"
                              : current
                                ? "border-primary"
                                : "border-white/15"
                          }`}
                        >
                          {done ? (
                            <Check className="w-3.5 h-3.5 text-white" />
                          ) : current ? (
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          ) : null}
                        </span>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-semibold ${
                              current ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {step.title}
                          </p>
                          {(step.detail || (index === 0 && file)) && (
                            <p className="text-xs text-muted-foreground truncate">
                              {index === 0 && file ? file.name : step.detail}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="card-elevated rounded-2xl p-4 mt-7 flex items-center gap-3 text-left">
                  <Clock className="w-5 h-5 text-primary shrink-0" />
                  <p className="text-sm text-foreground/70">
                    Esto puede tardar unos segundos. No cierres la app.
                  </p>
                </div>
              </motion.div>
            )}

            {stage === "done" && result && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/15 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-11 h-11 text-emerald-500" />
                </div>

                <h2 className="text-2xl font-black tracking-tight text-foreground mt-5 mb-1">
                  ¡Listo!
                </h2>
                <p className="text-base text-foreground/70 mb-6">
                  Tu informe fue procesado correctamente.
                </p>

                <div className="card-elevated rounded-2xl p-5 flex items-center justify-between text-left">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Datos encontrados</p>
                    <p className="text-4xl font-black tabular-nums text-foreground leading-none">
                      {found}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">métricas</p>
                  </div>
                  <ProgressRing value={accuracy} size={92} stroke={10} label={`${accuracy}%`} />
                </div>

                <p className="text-sm text-foreground/70 mt-4 mb-6">
                  Se detectaron {found} métricas de tu evaluación del{" "}
                  <strong className="text-foreground">{formatDate(date)}</strong>. Revisá los datos
                  antes de guardarlos.
                </p>

                <button
                  onClick={() => setStage("review")}
                  className="w-full min-h-[52px] rounded-2xl bg-gradient-primary text-primary-foreground font-black text-base active:scale-[0.98] transition-transform"
                >
                  Revisar datos
                </button>
                <button
                  onClick={reset}
                  className="w-full min-h-[52px] rounded-2xl card-elevated text-foreground font-bold text-base mt-3 active:scale-[0.98] transition-transform"
                >
                  Subir otro informe
                </button>
              </motion.div>
            )}

            {stage === "review" && result && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Stepper current={3} />

                <p className="text-sm text-foreground/70 mt-5 mb-5">
                  Revisá los datos detectados en tu informe. Podés editar cualquier valor antes de
                  guardarlo.
                </p>

                {result.dateSource !== "informe" && (
                  <Notice>
                    No encontramos la fecha dentro del informe
                    {result.dateSource === "nombre del archivo"
                      ? ", la tomamos del nombre del archivo"
                      : ", pusimos la de hoy"}
                    . Confirmala abajo.
                  </Notice>
                )}

                <section className="mb-6">
                  <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-3">
                    Fecha de evaluación
                  </h3>
                  <label className="card-elevated rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary shrink-0" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="flex-1 bg-transparent text-foreground font-semibold outline-none"
                    />
                  </label>
                </section>

                {groupsWithValues.map((group) => (
                  <section key={group} className="mb-6">
                    <h3 className="text-sm font-black uppercase tracking-wider text-foreground mb-3">
                      {GROUP_LABELS[group]}
                    </h3>
                    <div className="card-elevated rounded-2xl divide-y divide-white/[0.06]">
                      {ANTHROPOMETRY_FIELDS.filter(
                        (f) => f.group === group && draft[f.id] !== undefined
                      ).map((field) => (
                        <div key={field.id} className="flex items-center gap-3 px-4 py-3">
                          <span className="min-w-0 flex-1 text-sm text-foreground truncate">
                            {field.label}
                            {!detectedIds.has(field.id) && (
                              <span className="text-[11px] text-muted-foreground ml-1.5">
                                calculado
                              </span>
                            )}
                            {lowConfidence.has(field.id) && (
                              <AlertTriangle className="inline w-3.5 h-3.5 text-amber-500 ml-1.5 -mt-0.5" />
                            )}
                          </span>
                          <input
                            inputMode="decimal"
                            value={draft[field.id] ?? ""}
                            onChange={(e) =>
                              setDraft((prev) => ({ ...prev, [field.id]: e.target.value }))
                            }
                            className="w-24 text-right bg-transparent text-foreground font-bold tabular-nums outline-none focus:text-primary"
                          />
                          <span className="w-9 text-xs text-muted-foreground">
                            {field.unit ?? ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}

                {warnings.length > 0 && (
                  <section className="mb-6">
                    <Notice>
                      <span className="font-semibold">Revisá esto antes de guardar:</span>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        {warnings.slice(0, 4).map((w) => (
                          <li key={w.fieldId + w.message}>{w.message}</li>
                        ))}
                      </ul>
                    </Notice>
                  </section>
                )}

                <button
                  onClick={submit}
                  disabled={saving}
                  className="w-full min-h-[52px] rounded-2xl bg-gradient-primary text-primary-foreground font-black text-base active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                  Guardar evaluación
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
};

/** Anillo de progreso reutilizado por el procesamiento y por el resumen. */
const ProgressRing = ({
  value,
  size = 148,
  stroke = 12,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted) / 0.35)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: circumference * (1 - clamped / 100) }}
          initial={{ strokeDashoffset: circumference }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {label ? (
          <span className="text-xl font-black tabular-nums text-foreground">{label}</span>
        ) : (
          <FileText className="w-8 h-8 text-primary" />
        )}
      </div>
    </div>
  );
};

const STEP_LABELS = ["Subir", "Procesar", "Revisar", "Guardar"];

const Stepper = ({ current }: { current: number }) => (
  <ol className="flex items-start justify-between">
    {STEP_LABELS.map((label, index) => {
      const step = index + 1;
      const done = step < current;
      const active = step === current;
      return (
        <li key={label} className="flex-1 flex flex-col items-center gap-1.5">
          <span
            className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center ${
              done
                ? "bg-emerald-500 text-white"
                : active
                  ? "bg-gradient-primary text-primary-foreground"
                  : "bg-white/[0.06] text-muted-foreground"
            }`}
          >
            {done ? <Check className="w-4 h-4" /> : step}
          </span>
          <span
            className={`text-[11px] ${active ? "text-primary font-bold" : "text-muted-foreground"}`}
          >
            {label}
          </span>
        </li>
      );
    })}
  </ol>
);

const Notice = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/25 p-3.5 flex gap-2.5 mb-5">
    <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
    <div className="text-sm text-foreground/80">{children}</div>
  </div>
);

export default AnthropometryUpload;
