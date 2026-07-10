/**
 * Página de mediciones corporales
 * Muestra historial de anthropometry con grid de última medición.
 * El alumno puede además cargar / editar sus propias mediciones.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Ruler, Scale, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import BodyMetricChart from "@/components/progress/BodyMetricChart";
import MeasurementSheet from "@/components/progress/MeasurementSheet";
import { useAnthropometryData } from "@/hooks/useAnthropometryData";
import { useSaveMeasurement } from "@/hooks/useSaveMeasurement";
import PageLoading from "@/components/ui/page-loading";
import { staggerContainer, fadeUp } from "@/lib/animations";

interface MeasurementCardProps {
  label: string;
  value: number | null;
  unit: string;
}

const MeasurementCard = ({ label, value, unit }: MeasurementCardProps) => (
  <div className="card-elevated rounded-2xl p-4 text-center">
    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
    {value != null ? (
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-2xl font-bold tabular-nums text-foreground">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">—</p>
    )}
  </div>
);

export default function Measurements() {
  const navigate = useNavigate();
  const { entries, latest, weightHistory, waistHistory, loading } = useAnthropometryData();
  const { saveMeasurement, saving, today } = useSaveMeasurement();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (loading) {
    return <PageLoading message="Cargando mediciones..." />;
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow={
          <>
            <Ruler className="w-3.5 h-3.5" />
            Antropometría
          </>
        }
        title="Mediciones"
        maxWidth="max-w-4xl lg:max-w-6xl"
        left={
          <button
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="text-muted-foreground p-1 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
        right={
          <button
            onClick={() => setSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-primary text-primary-foreground text-sm font-bold active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Registrar
          </button>
        }
      />

      <motion.div
        className="min-h-screen bg-background pb-nav lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-4xl lg:max-w-6xl mx-auto px-5 lg:px-8 pt-5 space-y-4">
          {/* Latest measurements grid */}
          {latest ? (
            <motion.div variants={fadeUp}>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-3">
                Última medición &middot; {new Date(latest.date + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <MeasurementCard label="Peso" value={latest.weight_kg} unit="kg" />
                <MeasurementCard label="Cintura" value={latest.waist_cm} unit="cm" />
                <MeasurementCard label="Pecho" value={latest.chest_cm} unit="cm" />
                <MeasurementCard label="Brazo" value={latest.arm_cm} unit="cm" />
                <MeasurementCard label="Muslo" value={latest.thigh_cm} unit="cm" />
                <MeasurementCard label="Cadera" value={latest.hips_cm} unit="cm" />
                <MeasurementCard label="Grasa Corp." value={latest.body_fat} unit="%" />
              </div>
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} className="card-elevated rounded-2xl p-6 text-center">
              <Scale className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-foreground mb-1">Registrá tu primera medición</p>
              <p className="text-sm text-muted-foreground mb-4">
                Cargá tu peso y medidas para seguir tu evolución. Tu coach también puede verlas.
              </p>
              <button
                onClick={() => setSheetOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-primary text-primary-foreground text-sm font-bold active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
                Registrar medición
              </button>
            </motion.div>
          )}

          <div className="xl:grid xl:grid-cols-12 xl:gap-4 xl:space-y-0 space-y-4 items-start">
            <div className="xl:col-span-8 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 space-y-4">
              {/* Weight chart */}
              <motion.div variants={fadeUp}>
                <BodyMetricChart
                  data={weightHistory}
                  title="Evolución de Peso"
                  unit="kg"
                  color="hsl(var(--primary))"
                />
              </motion.div>

              {/* Waist chart */}
              <motion.div variants={fadeUp}>
                <BodyMetricChart
                  data={waistHistory}
                  title="Evolución de Cintura"
                  unit="cm"
                  color="#f59e0b"
                />
              </motion.div>
            </div>

            {/* History */}
            {entries.length > 0 && (
              <motion.div variants={fadeUp} className="xl:col-span-4 card-elevated rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="accent-bar" />
                <h3 className="text-sm font-black tracking-tight text-foreground">Historial</h3>
              </div>
              <div className="space-y-3">
                {[...entries].reverse().map(entry => (
                  <div key={entry.id} className="flex items-center justify-between py-2 border-b border-white/[0.06] last:border-0">
                    <p className="text-sm text-foreground">
                      {new Date(entry.date + "T00:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <div className="flex gap-4 text-sm tabular-nums">
                      {entry.weight_kg && <span className="text-muted-foreground">{entry.weight_kg} kg</span>}
                      {entry.waist_cm && <span className="text-muted-foreground">{entry.waist_cm} cm</span>}
                      {entry.body_fat && <span className="text-muted-foreground">{entry.body_fat}%</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <MeasurementSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        today={today}
        saving={saving}
        latest={latest}
        onSave={saveMeasurement}
      />
    </AppShell>
  );
}
