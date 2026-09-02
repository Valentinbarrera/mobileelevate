import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, X, Check, Video, Eye, EyeOff, Maximize2, Minimize2, ChevronUp, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const fmtClock = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/**
 * Reloj vivo del entreno, AISLADO: es lo único que tickea cada 500ms, así el
 * resto de la pantalla (la lista de ejercicios) no se re-renderiza en cada tick.
 * Lee el tiempo de un getter anclado a timestamp (sobrevive al background) y se
 * congela solo con pausar (no tickea mientras isPaused).
 */
const ActiveClock = ({
  getElapsedSeconds,
  isPaused,
  hidden,
  className = "text-xl font-black text-foreground tabular-nums tracking-tight",
}: {
  getElapsedSeconds: () => number;
  isPaused: boolean;
  hidden: boolean;
  className?: string;
}) => {
  const [, force] = useState(0);
  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => force((t) => t + 1), 500);
    return () => clearInterval(id);
  }, [isPaused]);
  return <span className={className}>{hidden ? "– –" : fmtClock(getElapsedSeconds())}</span>;
};

interface ActiveWorkoutHeaderProps {
  /** Devuelve los segundos transcurridos (anclado a timestamp). El header lo
   *  consulta con su propio tick, para no re-renderizar la página entera. */
  getElapsedSeconds: () => number;
  isPaused: boolean;
  onPauseToggle: () => void;
  completedExercises: number;
  totalExercises: number;
  completedSets: number;
  totalSets: number;
  onFinish?: () => void;
  /**
   * Video de técnica del ejercicio en curso. Se ofrece acá arriba porque el
   * alumno lo necesita justo antes de levantar, sin tener que desplegar la
   * sección "Técnica" de la card. Si el coach no cargó video, la página cae a
   * una búsqueda en YouTube, así que el botón se muestra igual.
   */
  activeExerciseName?: string;
  onOpenVideo?: () => void;
  /**
   * Descarta la sesión en curso (borra el snapshot para que NO se pueda
   * reanudar). Al salir normalmente el progreso queda guardado; esto es el
   * "salir sin guardar".
   */
  onDiscard?: () => void;
}

// Preferencias locales del entreno. Dos cosas distintas y a propósito:
//  - HIDE_TIMER    → oculta SOLO el reloj, la barra sigue entera.
//  - COLLAPSE_BAR  → pliega la BARRA COMPLETA y deja apenas el progreso.
// Las dos se recuerdan: si alguien pliega la barra es porque le molesta, y
// volver a plegarla en cada entreno sería pedirle lo mismo todos los días.
const HIDE_TIMER_KEY = "elevate_hide_active_timer";
const COLLAPSE_BAR_KEY = "elevate_collapse_active_bar";

const readFlag = (key: string) => {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};
const writeFlag = (key: string, on: boolean) => {
  try {
    localStorage.setItem(key, on ? "1" : "0");
  } catch {
    /* almacenamiento no disponible */
  }
};

const ActiveWorkoutHeader = ({
  getElapsedSeconds,
  isPaused,
  onPauseToggle,
  completedExercises,
  totalExercises,
  completedSets,
  totalSets,
  onFinish,
  activeExerciseName,
  onOpenVideo,
  onDiscard,
}: ActiveWorkoutHeaderProps) => {
  const navigate = useNavigate();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [timerHidden, setTimerHidden] = useState(() => readFlag(HIDE_TIMER_KEY));
  const [collapsed, setCollapsed] = useState(() => readFlag(COLLAPSE_BAR_KEY));
  const [fullscreen, setFullscreen] = useState(false); // cronómetro en modo foco
  const exerciseProgress = (completedExercises / totalExercises) * 100;

  const toggleTimer = () => {
    setTimerHidden((prev) => {
      writeFlag(HIDE_TIMER_KEY, !prev);
      return !prev;
    });
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      writeFlag(COLLAPSE_BAR_KEY, !prev);
      return !prev;
    });
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  // El snapshot de la sesión se guarda solo en cada cambio → salir simplemente
  // vuelve al Home y deja el entreno listo para reanudar.
  const leaveAndSave = () => {
    navigate("/");
  };

  // Salir sin guardar: borra el snapshot y sale.
  const discardAndExit = () => {
    onDiscard?.();
    navigate("/");
  };

  return (
    <>
      {/* pt-safe empuja la barra de progreso por debajo del notch/isla en iOS */}
      <motion.header
        className="sticky top-0 z-50 bg-background/98 backdrop-blur-xl border-b border-border pt-safe"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
      >
        {/* Progress Bar */}
        <div className="h-1 bg-secondary">
          <motion.div 
            className="h-full bg-gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${exerciseProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Todo el cuerpo de la barra se pliega. Lo único que sobrevive es la
            línea de progreso de arriba y el tirador: querés sacarte la barra de
            encima, no perder de vista cómo venís. */}
        <motion.div
          className="overflow-hidden"
          initial={false}
          animate={{ height: collapsed ? 0 : "auto", opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          aria-hidden={collapsed}
        >
        {/* px-3 y no px-5: entre salir, reloj, video, dos contadores, pausa y
            finalizar, esta barra pide más ancho del que tiene un iPhone de
            390px y los controles se montaban unos sobre otros. */}
        <div className="px-3 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5">
            {/* Exit Button + Timer */}
            <div className="flex items-center gap-1.5 min-w-0">
              <motion.button
                onClick={handleExit}
                className="w-11 h-11 shrink-0 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-destructive/20 transition-colors touch-target"
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Acá NO va un botón para ocultar el reloj: probado, no entra —
                  se encimaba con "Tiempo activo" y con el video. Para sacarte
                  el tiempo de encima está el tirador de abajo, que pliega la
                  barra entera; ocultar sólo el reloj sigue estando adentro del
                  modo pantalla completa. */}
              {/* Sin el rótulo "Tiempo activo": con 14 series y 4 ejercicios
                  los contadores crecen y el rótulo empujaba al botón de video
                  encima del texto. Un cronómetro corriendo no necesita que le
                  aclaren que es un cronómetro. */}
              <button
                onClick={() => setFullscreen(true)}
                className="shrink-0 flex items-center gap-1"
                aria-label="Ver cronómetro en pantalla completa"
              >
                <ActiveClock
                  getElapsedSeconds={getElapsedSeconds}
                  isPaused={isPaused}
                  hidden={timerHidden}
                />
                <Maximize2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              </button>

              {/* Video del ejercicio en curso, a mano desde acá arriba */}
              {onOpenVideo && (
                <motion.button
                  onClick={onOpenVideo}
                  aria-label={`Ver video de ${activeExerciseName || "el ejercicio"}`}
                  className="w-11 h-11 shrink-0 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary touch-target"
                  whileTap={{ scale: 0.95 }}
                >
                  <Video className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Sets Counter */}
              <div className="text-center">
                <div className="flex items-center gap-0.5">
                  <span className="text-base font-bold text-foreground tabular-nums">{completedSets}</span>
                  <span className="text-sm text-foreground/70">/{totalSets}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Series</p>
              </div>

              {/* Exercises Counter — se esconde en pantallas angostas, como
                  "Finalizar". El avance de ejercicios ya lo cuenta la barra de
                  progreso de arriba; las series no las cuenta nadie más. */}
              <div className="text-center hidden min-[430px]:block">
                <div className="flex items-center gap-0.5">
                  <span className="text-base font-bold text-primary tabular-nums">{completedExercises}</span>
                  <span className="text-sm text-foreground/70">/{totalExercises}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Ejercicios</p>
              </div>

              {/* Pause Button */}
              <motion.button
                onClick={onPauseToggle}
                className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-colors touch-target ${
                  isPaused
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {isPaused ? (
                  <Play className="w-5 h-5 ml-0.5" />
                ) : (
                  <Pause className="w-5 h-5" />
                )}
              </motion.button>

              {/* Finalizar — cerrar el entreno cuando quieras, sin completar todo */}
              {onFinish && (
                <motion.button
                  onClick={onFinish}
                  aria-label="Finalizar entrenamiento"
                  className="h-11 px-2.5 sm:px-3.5 shrink-0 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center gap-1.5 touch-target"
                  whileTap={{ scale: 0.95 }}
                >
                  <Check className="w-5 h-5" strokeWidth={3} />
                  {/* En pantallas angostas el ícono alcanza: si no, se sale del header */}
                  <span className="hidden sm:inline">Finalizar</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
        </motion.div>

        {/* Tirador: pliega y despliega la barra entera. Va a lo ancho y no
            flotando encima del contenido, para que no tape la primera serie. */}
        <button
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Mostrar la barra del entreno" : "Minimizar la barra del entreno"}
          className="w-full h-7 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 active:bg-white/[0.04] transition-colors"
        >
          {collapsed ? (
            <>
              <ChevronDown className="w-4 h-4" />
              {completedSets}/{totalSets} series
            </>
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </motion.header>

      {/* Cronómetro a pantalla completa (modo foco). Reusa el mismo reloj vivo:
          minimizar vuelve al header; también podés ocultarlo del header. */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            className="fixed inset-0 z-[135] bg-background flex flex-col pt-safe pb-safe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Glow ambiental de marca */}
            <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-primary/15 blur-3xl" />

            {/* Barra superior: minimizar */}
            <div className="relative flex justify-end p-4">
              <button
                onClick={() => setFullscreen(false)}
                aria-label="Minimizar cronómetro"
                className="flex items-center gap-2 px-4 h-11 rounded-xl bg-secondary text-foreground font-semibold text-sm active:scale-95 transition-transform"
              >
                <Minimize2 className="w-5 h-5" />
                Minimizar
              </button>
            </div>

            {/* Centro: reloj gigante + pausa */}
            <div className="relative flex-1 flex flex-col items-center justify-center gap-4 px-6 -mt-8">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-primary flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-primary ${isPaused ? "" : "animate-pulse"}`} />
                {isPaused ? "En pausa" : "Tiempo activo"}
              </span>
              <ActiveClock
                getElapsedSeconds={getElapsedSeconds}
                isPaused={isPaused}
                hidden={false}
                className="text-[5rem] leading-none font-black text-foreground tabular-nums tracking-tight"
              />
              <motion.button
                onClick={onPauseToggle}
                whileTap={{ scale: 0.97 }}
                className={`mt-6 flex items-center gap-2.5 px-8 h-14 rounded-2xl font-black uppercase tracking-wide ${
                  isPaused
                    ? "bg-gradient-primary text-primary-foreground glow-primary"
                    : "bg-secondary text-foreground border border-border"
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-5 h-5 fill-current" /> Reanudar
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5" /> Pausar
                  </>
                )}
              </motion.button>
            </div>

            {/* Pie: ocultar/mostrar el cronómetro del header */}
            <div className="relative p-6">
              <button
                onClick={toggleTimer}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-secondary/60 border border-border text-foreground/80 font-semibold text-sm active:scale-[0.99] transition-transform"
              >
                {timerHidden ? (
                  <>
                    <Eye className="w-4 h-4" /> Mostrar el cronómetro en el header
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" /> Ocultar el cronómetro del header
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm card-elevated rounded-3xl p-6 text-center"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Pause className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">¿Dejar el entrenamiento?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Tu progreso queda guardado. Podés retomarlo cuando quieras, desde donde lo dejaste.
            </p>

            <div className="space-y-2.5">
              <motion.button
                onClick={leaveAndSave}
                className="w-full min-h-12 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold"
                whileTap={{ scale: 0.98 }}
              >
                Dejar y guardar
              </motion.button>
              <motion.button
                onClick={() => setShowExitConfirm(false)}
                className="w-full min-h-12 py-3 rounded-xl bg-secondary text-foreground font-semibold"
                whileTap={{ scale: 0.98 }}
              >
                Seguir entrenando
              </motion.button>
              {onDiscard && (
                <motion.button
                  onClick={discardAndExit}
                  className="w-full min-h-11 py-2.5 rounded-xl text-sm font-semibold text-destructive/90 hover:text-destructive"
                  whileTap={{ scale: 0.98 }}
                >
                  Descartar y salir sin guardar
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default ActiveWorkoutHeader;
