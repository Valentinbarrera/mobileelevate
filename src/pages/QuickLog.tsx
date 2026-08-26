/**
 * Anotador — se escribe, se entiende y queda. Un solo campo.
 *
 * La versión anterior tenía tres campos (ejercicio, kilos, reps): entre serie y
 * serie eso son tres toques y dos teclados distintos. Acá escribís
 * "sentadilla 100x8" como en un chat y listo; la siguiente serie es sólo
 * "100x7", porque hereda el ejercicio de la anotación anterior.
 *
 * Lo que se anota va al MISMO registro local que el resto de la app
 * (`workoutLog`), así que también alimenta "la vez pasada", los PRs y la tarjeta
 * del Progreso. Todo local: la base está congelada.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, NotebookPen, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  logSet,
  deleteLoggedSet,
  getLoggedHistory,
  getLastLoggedName,
  countSetsOn,
  freeExerciseId,
} from "@/lib/workoutLog";
import { recordFreeExercise } from "@/lib/freeExercises";
import { parseQuickLog } from "@/lib/quickLogParser";
import { getLocalDateString, parseLocalDateString } from "@/lib/date";

/** Cuántos días de historial se muestran arriba del campo. */
const DIAS_A_LA_VISTA = 4;

const EJEMPLOS = ["sentadilla 100x8", "60 kg por 10", "3 series de 40x12", "dominadas 12 repes"];

/** "Hoy" / "Ayer" / "lun 25 ago" — leer una fecha ISO cuesta más que reconocerla. */
const dayLabel = (date: string, today: string) => {
  if (date === today) return "Hoy";
  const ayer = parseLocalDateString(today);
  ayer.setDate(ayer.getDate() - 1);
  if (date === getLocalDateString(ayer)) return "Ayer";
  return parseLocalDateString(date).toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

export default function QuickLog() {
  const navigate = useNavigate();
  const { student, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");
  const today = getLocalDateString();

  const [texto, setTexto] = useState("");
  /** Respuesta efímera cuando no se entendió. No se guarda: es una aclaración. */
  const [noEntendi, setNoEntendi] = useState<string | null>(null);
  // El historial se re-lee en cada render en vez de vivir en estado: la fuente
  // es localStorage y así no puede quedar desincronizado con lo que se anota.
  const [, bump] = useState(0);
  const refrescar = () => bump((v) => v + 1);

  const inputRef = useRef<HTMLInputElement>(null);
  const finRef = useRef<HTMLDivElement>(null);

  // Del día más viejo al más nuevo y con el campo abajo: se lee como un chat.
  const dias = getLoggedHistory(sid)
    .slice(0, DIAS_A_LA_VISTA)
    .reverse()
    .map((d) => ({ ...d, sets: [...d.sets].reverse() }));
  const total = dias.reduce((a, d) => a + d.sets.length, 0);

  useEffect(() => {
    finRef.current?.scrollIntoView({ block: "end" });
  }, [total]);

  const anotar = () => {
    const crudo = texto.trim();
    if (!crudo) return;

    const parsed = parseQuickLog(crudo);
    if (!parsed) {
      setNoEntendi(crudo);
      return;
    }

    // Sin nombre en el mensaje, sigue el ejercicio anterior: es lo que hace que
    // la segunda serie sea sólo "100x7".
    const nombre = parsed.exercise ?? getLastLoggedName(sid);
    if (!nombre) {
      setNoEntendi(crudo);
      return;
    }

    const exerciseId = freeExerciseId(nombre);
    let n = countSetsOn(sid, exerciseId, today);
    for (const s of parsed.sets) {
      n += 1;
      logSet(sid, {
        exerciseId,
        date: today,
        setNumber: n,
        weight: s.weight,
        reps: s.reps,
        name: nombre,
      });
    }
    recordFreeExercise(sid, nombre);

    setTexto("");
    setNoEntendi(null);
    refrescar();
    if (navigator.vibrate) navigator.vibrate(10);
    // Sin toast de confirmacion a proposito: la burbuja que acaba de aparecer ya
    // dice lo que se entendio, y el toast se le sentaba encima del campo justo
    // cuando el alumno va a escribir la serie siguiente.
    inputRef.current?.focus();
  };

  const borrar = (exerciseId: string, date: string, setNumber: number, label: string) => {
    deleteLoggedSet(sid, exerciseId, date, setNumber);
    refrescar();
    toast(`${label} borrada`);
  };

  return (
    <AppShell>
      <PageHeader
        eyebrow={
          <>
            <NotebookPen className="w-3.5 h-3.5" />
            Registro libre
          </>
        }
        title="Anotador"
        subtitle="Escribilo como te salga y queda anotado"
        left={
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground -ml-2 w-11 h-11 flex items-center justify-center"
            aria-label="Volver"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        }
      />

      <div className="min-h-screen bg-background flex flex-col">
        {/* Conversación */}
        <div className="flex-1 max-w-2xl w-full mx-auto px-5 pt-5 pb-4 space-y-3">
          {total === 0 && (
            <div className="card-elevated rounded-2xl p-5">
              <div className="flex items-center gap-2.5 mb-2">
                <Sparkles className="w-5 h-5 text-primary shrink-0" />
                <p className="text-base font-black text-foreground">Escribí lo que hiciste</p>
              </div>
              <p className="text-sm text-foreground/70 mb-3">
                Sin campos ni menús. Lo entiende y lo guarda; la serie siguiente puede ser sólo el
                peso y las reps.
              </p>
              <div className="flex flex-wrap gap-2">
                {EJEMPLOS.map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      setTexto(e);
                      inputRef.current?.focus();
                    }}
                    className="min-h-11 px-3 rounded-xl bg-secondary/50 border border-white/[0.06] text-sm font-bold text-foreground/70"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {dias.map((day) => (
            <div key={day.date} className="space-y-2">
              <div className="flex items-center gap-3 py-1">
                <span className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {dayLabel(day.date, today)}
                </span>
                <span className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {day.sets.map((s) => (
                <motion.div
                  key={`${s.exerciseId}-${s.setNumber}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end"
                >
                  <div className="group max-w-[85%] rounded-2xl rounded-br-md bg-primary/12 border border-primary/25 pl-4 pr-2 py-2.5 flex items-center gap-2">
                    <div className="min-w-0">
                      <p className="text-base font-bold text-foreground truncate">{s.name}</p>
                      <p className="text-sm text-foreground/70 tabular-nums">
                        {s.weight > 0 ? `${s.weight} kg × ${s.reps}` : `${s.reps} reps`}
                      </p>
                    </div>
                    <button
                      onClick={() => borrar(s.exerciseId, s.date, s.setNumber, s.name)}
                      aria-label={`Borrar ${s.name}`}
                      className="shrink-0 w-11 h-11 flex items-center justify-center text-muted-foreground active:scale-90 transition-transform"
                    >
                      <Trash2 className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}

          {/* No se entendió: se aclara acá mismo, sin sacar al alumno de la pantalla. */}
          <AnimatePresence>
            {noEntendi && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="max-w-[85%] rounded-2xl rounded-bl-md bg-secondary/60 border border-white/[0.06] px-4 py-3"
              >
                <p className="text-sm text-foreground">
                  No encontré una serie en "{noEntendi}". Necesito el peso y las repeticiones.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EJEMPLOS.slice(0, 2).map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        setTexto(e);
                        setNoEntendi(null);
                        inputRef.current?.focus();
                      }}
                      className="min-h-11 px-3 rounded-xl bg-background/60 border border-white/[0.06] text-sm font-bold text-primary"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={finRef} />
        </div>

        {/* Campo: pegado abajo, arriba de la barra de navegación. */}
        <div className="sticky bottom-0 z-30 bg-background/95 backdrop-blur-xl border-t border-white/[0.06] pb-nav">
          <div className="max-w-2xl mx-auto px-5 py-3 flex items-end gap-2">
            <input
              ref={inputRef}
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value);
                if (noEntendi) setNoEntendi(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && anotar()}
              enterKeyHint="send"
              placeholder="sentadilla 100x8"
              aria-label="Anotá tu serie"
              className="flex-1 min-w-0 min-h-12 rounded-2xl bg-secondary/60 border border-white/10 px-4 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:outline-none"
            />
            <button
              onClick={anotar}
              disabled={!texto.trim()}
              aria-label="Anotar"
              className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
            >
              <ArrowUp className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
