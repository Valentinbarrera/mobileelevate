/**
 * Página de mediciones corporales
 * Muestra historial de anthropometry con grid de última medición
 */
import { motion } from "framer-motion";
import { ArrowLeft, Ruler, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import BodyMetricChart from "@/components/progress/BodyMetricChart";
import { useAnthropometryData } from "@/hooks/useAnthropometryData";
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
        <span className="text-2xl font-bold text-foreground">{value}</span>
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

  if (loading) {
    return <PageLoading message="Cargando mediciones..." />;
  }

  return (
    <AppShell>
      <motion.div
        className="min-h-screen bg-background pb-28 lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <motion.header
          className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50"
          variants={fadeUp}
        >
          <div className="max-w-4xl lg:max-w-6xl mx-auto flex items-center gap-3 px-5 lg:px-8 py-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Ruler className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Antropometría</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Mediciones</h1>
            </div>
          </div>
        </motion.header>

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
              <p className="font-semibold text-foreground mb-1">Sin mediciones</p>
              <p className="text-sm text-muted-foreground">Tu coach registrará tus mediciones corporales</p>
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
                    <div className="flex gap-4 text-sm">
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
    </AppShell>
  );
}
