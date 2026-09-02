/**
 * Antropometría del alumno: el resumen de su última evaluación y cómo viene
 * evolucionando.
 *
 * Los datos salen de los informes que el propio alumno sube (ver
 * `AnthropometryUpload`) y de los que carga el coach desde la web.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  CalendarDays,
  Droplet,
  Gauge,
  Plus,
  Scale,
  Target,
  Dumbbell,
  Bone,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import CompositionDonut from "@/components/anthropometry/CompositionDonut";
import MetricDeltaCard from "@/components/anthropometry/MetricDeltaCard";
import EvolutionChart, {
  type EvolutionSeries,
} from "@/components/anthropometry/EvolutionChart";
import { useEvaluations } from "@/hooks/useEvaluations";
import {
  compositionBreakdown,
  deltaFor,
  seriesFor,
  formatDate,
  relativeDate,
  numeric,
  formatValue,
} from "@/lib/anthropometryInsights";
import { FIELDS_BY_ID, GOAL_LABELS } from "@/types/evaluation";
import { staggerContainer, fadeUp } from "@/lib/animations";

type Tab = "resumen" | "evolucion";

/** Las tarjetas de arriba, en el orden en que se leen. */
const KEY_METRICS = [
  { fieldId: "weight", label: "Peso", unit: "kg", icon: Scale, color: "#f97316" },
  { fieldId: "body_fat_percentage", label: "% Grasa corporal", unit: "%", icon: Droplet, color: "#eab308" },
  { fieldId: "muscle_mass", label: "Masa muscular", unit: "kg", icon: Dumbbell, color: "#f97316" },
  { fieldId: "fat_mass", label: "Masa adiposa", unit: "kg", icon: Droplet, color: "#eab308" },
  { fieldId: "bone_mass", label: "Masa ósea", unit: "kg", icon: Bone, color: "#3b82f6" },
  { fieldId: "bmi", label: "IMC", unit: "", icon: Gauge, color: "#a855f7" },
] as const;

/** Índices que se muestran como lista al pie del resumen. */
const INDEX_FIELDS = [
  "sum_6_skinfolds",
  "muscle_bone_index",
  "waist_hip_ratio",
  "adipose_muscle_index",
  "basal_metabolism",
  "energy_expenditure",
  "somatotype_endo",
  "somatotype_meso",
  "somatotype_ecto",
];

const RANGES = [
  { days: 90, label: "Últimos 3 meses" },
  { days: 180, label: "Últimos 6 meses" },
  { days: 365, label: "Último año" },
  { days: 0, label: "Todo" },
];

const Anthropometry = () => {
  const navigate = useNavigate();
  const { evaluations, latest, previous } = useEvaluations();
  const [tab, setTab] = useState<Tab>("resumen");
  const [rangeDays, setRangeDays] = useState(90);

  const composition = useMemo(
    () => (latest ? compositionBreakdown(latest.values) : { weight: null, slices: [] }),
    [latest]
  );

  const inRange = useMemo(() => {
    if (!rangeDays) return evaluations;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - rangeDays);
    const iso = cutoff.toISOString().slice(0, 10);
    return evaluations.filter((e) => e.date >= iso);
  }, [evaluations, rangeDays]);

  const series: EvolutionSeries[] = useMemo(
    () => [
      { id: "weight", label: "Peso", unit: "kg", color: "#f97316", points: seriesFor("weight", inRange) },
      {
        id: "body_fat_percentage",
        label: "% Grasa",
        unit: "%",
        color: "#eab308",
        points: seriesFor("body_fat_percentage", inRange),
      },
      {
        id: "muscle_mass",
        label: "Masa muscular",
        unit: "kg",
        color: "#22c55e",
        points: seriesFor("muscle_mass", inRange),
      },
    ],
    [inRange]
  );

  const uploadButton = (
    <button
      onClick={() => navigate("/antropometria/subir")}
      className="flex items-center gap-1.5 px-3.5 min-h-11 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-bold active:scale-95 transition-transform"
    >
      <Plus className="w-5 h-5" />
      Subir
    </button>
  );

  const header = (
    <PageHeader
      eyebrow={
        <>
          <Activity className="w-3.5 h-3.5" />
          Composición corporal
        </>
      }
      title="Antropometría"
      left={
        <button
          onClick={() => navigate(-1)}
          aria-label="Volver"
          className="text-muted-foreground w-11 h-11 -ml-2 flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      }
      right={uploadButton}
    />
  );

  // --- Sin evaluaciones todavía ---
  if (!latest) {
    return (
      <AppShell>
        {header}
        <div className="min-h-screen bg-background pb-nav">
          <div className="max-w-2xl lg:max-w-3xl mx-auto px-5 lg:px-8 pt-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-foreground mb-2">
              Todavía no cargaste ninguna evaluación
            </h2>
            <p className="text-base text-foreground/70 mb-6 max-w-sm mx-auto">
              Subí el PDF de tu antropometría y la app extrae tus datos sola: composición corporal,
              pliegues, perímetros e índices.
            </p>
            <button
              onClick={() => navigate("/antropometria/subir")}
              className="inline-flex items-center gap-2 px-5 min-h-[52px] rounded-2xl bg-gradient-primary text-primary-foreground font-black active:scale-[0.98] transition-transform"
            >
              <Plus className="w-5 h-5" />
              Subir mi informe
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {header}

      {/* Pestañas */}
      <div className="sticky top-[var(--header-offset,0)] z-30 bg-background/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-5 lg:px-8 flex">
          {(["resumen", "evolucion"] as Tab[]).map((id) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                tab === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {id === "resumen" ? "Resumen" : "Evolución"}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        className="min-h-screen bg-background pb-nav"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-2xl lg:max-w-3xl mx-auto px-5 lg:px-8 pt-4 space-y-4">
          {tab === "resumen" ? (
            <>
              <motion.div
                variants={fadeUp}
                className="card-elevated rounded-2xl p-4 flex items-center gap-3"
              >
                <CalendarDays className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Última evaluación</p>
                  <p className="text-lg font-black text-foreground leading-tight">
                    {formatDate(latest.date)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{relativeDate(latest.date)}</span>
              </motion.div>

              {composition.slices.length > 0 && (
                <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="accent-bar" />
                    <h3 className="text-lg font-black tracking-tight text-foreground">
                      Composición corporal
                    </h3>
                  </div>
                  <CompositionDonut weight={composition.weight} slices={composition.slices} />
                </motion.div>
              )}

              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
                {KEY_METRICS.map((metric) => {
                  const delta = deltaFor(metric.fieldId, latest, previous);
                  if (!delta) return null;
                  return (
                    <MetricDeltaCard
                      key={metric.fieldId}
                      fieldId={metric.fieldId}
                      label={metric.label}
                      unit={metric.unit}
                      icon={metric.icon}
                      iconColor={metric.color}
                      delta={delta}
                    />
                  );
                })}
              </motion.div>

              {(latest.goal || latest.goalNote) && (
                <motion.div
                  variants={fadeUp}
                  className="rounded-2xl border border-primary/25 bg-primary/[0.06] p-4"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-black text-foreground">
                      Objetivo {latest.goal ? `· ${GOAL_LABELS[latest.goal] ?? latest.goal}` : ""}
                    </h3>
                  </div>
                  {latest.goalNote && (
                    <p className="text-sm text-foreground/80">{latest.goalNote}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-2">Lo definió tu coach</p>
                </motion.div>
              )}

              <IndexList values={latest.values} />

              {latest.notes && (
                <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-4">
                  <h3 className="text-sm font-black text-foreground mb-1.5">Notas de tu coach</h3>
                  <p className="text-sm text-foreground/80 whitespace-pre-line">{latest.notes}</p>
                </motion.div>
              )}

              {latest.sourceFileName && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  Origen: {latest.sourceFileName}
                </p>
              )}
            </>
          ) : (
            <>
              <motion.div variants={fadeUp} className="flex justify-end">
                <select
                  value={rangeDays}
                  onChange={(e) => setRangeDays(Number(e.target.value))}
                  className="card-elevated rounded-xl px-3 py-2 text-sm font-semibold text-foreground bg-card outline-none"
                >
                  {RANGES.map((r) => (
                    <option key={r.days} value={r.days}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </motion.div>

              <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="accent-bar" />
                  <h3 className="text-lg font-black tracking-tight text-foreground">Evolución</h3>
                </div>
                {evaluations.length < 2 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Con una sola evaluación todavía no hay evolución que mostrar. Subí la próxima y
                    vas a ver la comparación acá.
                  </p>
                ) : (
                  <EvolutionChart series={series} />
                )}
              </motion.div>

              <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="accent-bar" />
                  <h3 className="text-lg font-black tracking-tight text-foreground">
                    Historial de evaluaciones
                  </h3>
                </div>
                <ul className="space-y-1">
                  {evaluations.map((evaluation, index) => {
                    const weight = numeric(evaluation.values.weight);
                    const fat = numeric(evaluation.values.body_fat_percentage);
                    return (
                      <li
                        key={evaluation.id}
                        className={`flex items-center gap-3 py-3 pl-3 border-l-2 ${
                          index === 0 ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-foreground">
                            {formatDate(evaluation.date)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {relativeDate(evaluation.date)}
                          </p>
                        </div>
                        {weight !== null && (
                          <div className="text-right">
                            <p className="text-sm font-bold tabular-nums text-foreground">
                              {weight.toFixed(1)} kg
                            </p>
                            <p className="text-[11px] text-muted-foreground">Peso</p>
                          </div>
                        )}
                        {fat !== null && (
                          <div className="text-right w-16">
                            <p className="text-sm font-bold tabular-nums text-foreground">
                              {fat.toFixed(1)} %
                            </p>
                            <p className="text-[11px] text-muted-foreground">Grasa</p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>

              <motion.button
                variants={fadeUp}
                onClick={() => navigate("/measurements")}
                className="w-full card-elevated rounded-2xl p-4 flex items-center justify-between active:scale-[0.99] transition-transform"
              >
                <span className="text-sm font-bold text-foreground">
                  Ver mis mediciones manuales
                </span>
                <ArrowRight className="w-5 h-5 text-primary" />
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </AppShell>
  );
};

/** Índices y datos derivados del informe, si vinieron. */
const IndexList = ({ values }: { values: Record<string, number | string | null> }) => {
  const present = INDEX_FIELDS.filter(
    (id) => values[id] !== undefined && values[id] !== null && values[id] !== ""
  );
  if (!present.length) return null;

  return (
    <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="accent-bar" />
        <h3 className="text-lg font-black tracking-tight text-foreground">Índices</h3>
      </div>
      <ul className="space-y-2.5">
        {present.map((id) => {
          const field = FIELDS_BY_ID[id];
          return (
            <li key={id} className="flex items-center gap-3 text-sm">
              <span className="min-w-0 flex-1 text-foreground/70 truncate">
                {field?.label ?? id}
              </span>
              <span className="tabular-nums font-bold text-foreground">
                {formatValue(id, values[id])}
              </span>
              <span className="w-10 text-xs text-muted-foreground">{field?.unit ?? ""}</span>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
};

export default Anthropometry;
