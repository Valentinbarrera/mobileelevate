/**
 * Bottom-sheet para que el ALUMNO cargue su propia medición corporal.
 *
 * Todos los campos numéricos son opcionales (podés cargar solo algunos). Se
 * guarda en la fecha elegida (default hoy). Si ya existe una medición de esa
 * fecha, se actualiza; si no, se crea. El guardado real lo hace
 * `useSaveMeasurement` (find-or-create + RLS).
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import type { MeasurementInput } from "@/hooks/useSaveMeasurement";

interface FieldDef {
  key: keyof Omit<MeasurementInput, "date" | "notes">;
  label: string;
  unit: string;
}

const FIELDS: FieldDef[] = [
  { key: "weight_kg", label: "Peso", unit: "kg" },
  { key: "waist_cm", label: "Cintura", unit: "cm" },
  { key: "chest_cm", label: "Pecho", unit: "cm" },
  { key: "arm_cm", label: "Brazo", unit: "cm" },
  { key: "thigh_cm", label: "Muslo", unit: "cm" },
  { key: "hips_cm", label: "Cadera", unit: "cm" },
  { key: "body_fat", label: "% Grasa", unit: "%" },
];

type FormState = Record<FieldDef["key"], string>;

const emptyForm = (): FormState => ({
  weight_kg: "",
  waist_cm: "",
  chest_cm: "",
  arm_cm: "",
  thigh_cm: "",
  hips_cm: "",
  body_fat: "",
});

export interface MeasurementSheetProps {
  open: boolean;
  onClose: () => void;
  today: string; // YYYY-MM-DD
  saving: boolean;
  /** Últimos valores conocidos, para precargar y editar cómodo (opcional). */
  latest?: Partial<Record<FieldDef["key"], number | null>> | null;
  onSave: (input: MeasurementInput) => Promise<unknown>;
}

const MeasurementSheet = ({
  open,
  onClose,
  today,
  saving,
  latest,
  onSave,
}: MeasurementSheetProps) => {
  const [date, setDate] = useState(today);
  const [values, setValues] = useState<FormState>(emptyForm());
  const [notes, setNotes] = useState("");

  // Reset + precarga con los últimos valores al abrir.
  useEffect(() => {
    if (!open) return;
    setDate(today);
    setNotes("");
    const next = emptyForm();
    if (latest) {
      for (const f of FIELDS) {
        const v = latest[f.key];
        if (v != null) next[f.key] = String(v);
      }
    }
    setValues(next);
  }, [open, today, latest]);

  const setField = (key: FieldDef["key"], raw: string) => {
    // Solo números, punto y coma (se normaliza a punto).
    const clean = raw.replace(/[^0-9.,]/g, "").replace(",", ".");
    setValues((prev) => ({ ...prev, [key]: clean }));
  };

  const submit = async () => {
    if (saving) return;

    const input: MeasurementInput = { date };
    let hasAny = false;
    for (const f of FIELDS) {
      const raw = values[f.key].trim();
      if (raw === "") continue;
      const num = Number(raw);
      if (Number.isNaN(num) || num <= 0) {
        toast.error(`Revisá el valor de ${f.label.toLowerCase()}`);
        return;
      }
      input[f.key] = num;
      hasAny = true;
    }
    if (notes.trim() !== "") input.notes = notes.trim();

    if (!hasAny) {
      toast.error("Cargá al menos un valor");
      return;
    }

    try {
      await onSave(input);
      toast.success("Medición guardada 📏");
      onClose();
    } catch (e) {
      toast.error((e as Error).message || "No se pudo guardar la medición");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md card-elevated rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-foreground">Registrar medición</h2>
                <p className="text-sm text-muted-foreground">Cargá los valores que quieras, todos son opcionales.</p>
              </div>
              <button onClick={onClose} aria-label="Cerrar" className="text-muted-foreground p-1 -mr-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fecha */}
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Fecha</p>
            <div className="relative mb-5">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 pl-10 pr-3 rounded-2xl bg-secondary border border-border text-foreground font-semibold focus:border-primary focus:outline-none"
              />
            </div>

            {/* Valores */}
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Valores</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {f.label}
                  </label>
                  <div className="relative">
                    <input
                      inputMode="decimal"
                      value={values[f.key]}
                      onChange={(e) => setField(f.key, e.target.value)}
                      placeholder="—"
                      className="w-full h-12 pl-3 pr-10 rounded-2xl bg-secondary border border-border text-foreground font-bold tabular-nums focus:border-primary focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground pointer-events-none">
                      {f.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Notas */}
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Notas (opcional)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ej. en ayunas, post entreno…"
              className="w-full mb-5 p-3 rounded-2xl bg-secondary border border-border text-foreground focus:border-primary focus:outline-none resize-none"
            />

            {/* Acción */}
            <button
              onClick={submit}
              disabled={saving}
              className="w-full h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.99] transition-transform"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" /> Guardar medición
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MeasurementSheet;
