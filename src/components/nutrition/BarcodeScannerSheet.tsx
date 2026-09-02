/**
 * Escanear el código de barras de un producto.
 *
 * Va a pantalla completa y no en un bottom-sheet a propósito: escanear es una
 * tarea de una sola cosa, hecha con el teléfono en movimiento apuntando a un
 * envase. Media pantalla de cámara obliga a acercarse más y hace más difícil
 * encuadrar.
 *
 * Los estados de búsqueda viven acá y no en el componente padre para que la
 * transición "detecté → estoy buscando → lo encontré" pase sin cortes: si el
 * sheet se cerrara para buscar, el alumno vería un parpadeo negro.
 */
import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ZapOff, Barcode, WifiOff, RotateCcw, PencilLine, Camera } from "lucide-react";
import { useBarcodeScanner } from "@/hooks/useBarcodeScanner";
import {
  lookupProductByBarcode,
  type FoodProduct,
  type LookupFailure,
} from "@/lib/foodProduct";
import { hapticLight } from "@/lib/haptics";

/** Qué está haciendo la pantalla. Manda sobre lo que se dibuja encima del video. */
type Phase =
  | { kind: "scanning" }
  | { kind: "searching"; barcode: string }
  | { kind: "failed"; reason: LookupFailure; barcode: string };

interface BarcodeScannerSheetProps {
  open: boolean;
  onClose: () => void;
  /** Producto encontrado: el padre decide qué hacer con él. */
  onFound: (product: FoodProduct) => void;
  /** "No lo encontré, lo cargo a mano." */
  onManual: () => void;
  /** Cargar los datos de un producto que la base no tiene, con su código. */
  onManualProduct?: (barcode: string) => void;
}

/** Un motivo de fallo → qué le decimos y qué puede hacer. Sin jerga. */
const FAILURE_COPY: Record<LookupFailure, { title: string; body: string }> = {
  not_found: {
    title: "No tenemos este producto",
    body: "La base es colaborativa y todavía no lo cargó nadie. Cargá vos los datos del envase y queda guardado con este código: la próxima vez ya aparece.",
  },
  invalid_barcode: {
    title: "Ese código no es de un alimento",
    body: "Probá con el código de barras del envase, el de las rayitas con números abajo.",
  },
  offline: {
    title: "Sin conexión",
    body: "Necesitamos internet para buscar el producto. Podés anotarlo a mano igual.",
  },
  timeout: {
    title: "La búsqueda tardó demasiado",
    body: "Puede ser la señal. Probá de nuevo o anotalo a mano.",
  },
  rate_limit: {
    title: "Demasiadas búsquedas seguidas",
    body: "Esperá unos segundos y volvé a intentar.",
  },
  server_error: {
    title: "El buscador no responde",
    body: "Es un problema del servicio de productos, no tuyo. Probá en un rato o anotalo a mano.",
  },
  bad_response: {
    title: "No pudimos leer los datos",
    body: "La respuesta vino incompleta. Probá de nuevo o anotalo a mano.",
  },
};

const BarcodeScannerSheet = ({
  open,
  onClose,
  onFound,
  onManual,
  onManualProduct,
}: BarcodeScannerSheetProps) => {
  const [phase, setPhase] = useState<Phase>({ kind: "scanning" });

  // Destello de "lo leí". Dura medio segundo y vive aparte de la fase porque
  // tiene que verse ENCIMA de la mirilla, antes de que aparezca el cartel de
  // búsqueda: sin él, escanear se siente como un salto sin causa.
  const [flash, setFlash] = useState(false);

  const handleDetected = useCallback(
    async (barcode: string) => {
      hapticLight();
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      setPhase({ kind: "searching", barcode });
      const res = await lookupProductByBarcode(barcode);
      if (res.ok) {
        onFound(res.product);
        return;
      }
      setPhase({ kind: "failed", reason: res.reason, barcode });
    },
    [onFound]
  );

  // El lector se apaga mientras buscamos o mientras se muestra un error: si
  // siguiera activo, mover el teléfono dispararía una búsqueda nueva por
  // debajo del cartel que el alumno está leyendo.
  const { videoRef, status, start, stop, torchOn, torchAvailable, toggleTorch } =
    useBarcodeScanner({ onDetected: handleDetected, active: phase.kind === "scanning" });

  useEffect(() => {
    if (open) {
      setPhase({ kind: "scanning" });
      void start();
    } else {
      stop();
    }
  }, [open, start, stop]);

  const retry = () => setPhase({ kind: "scanning" });

  if (!open) return null;

  const showCamera = status === "scanning" || status === "requesting";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[140] bg-black flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Video de fondo. `object-cover` para que llene sin deformar. */}
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover ${showCamera ? "opacity-100" : "opacity-0"}`}
          muted
          playsInline
        />
        {/* Foco real en vez de un velo parejo: se oscurece TODO menos el
            rectángulo donde va el código. Un `bg-black/45` uniforme apaga
            también la zona que el alumno tiene que encuadrar, que es
            exactamente donde hace falta ver bien. */}
        <div
          className="absolute inset-0 bg-black/60 transition-opacity duration-300"
          style={{
            maskImage:
              "radial-gradient(ellipse 150px 92px at 50% 45%, transparent 0%, transparent 62%, black 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 150px 92px at 50% 45%, transparent 0%, transparent 62%, black 100%)",
          }}
        />

        {/* Barra superior: cerrar siempre disponible, pase lo que pase. */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-safe">
          <button
            onClick={onClose}
            aria-label="Cerrar el escáner"
            className="mt-3 w-11 h-11 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <X className="w-6 h-6" />
          </button>
          {torchAvailable && (
            <button
              onClick={toggleTorch}
              aria-label={torchOn ? "Apagar la luz" : "Prender la luz"}
              aria-pressed={torchOn}
              className={`mt-3 w-11 h-11 rounded-full backdrop-blur flex items-center justify-center active:scale-95 transition-transform ${
                torchOn ? "bg-white text-black" : "bg-black/50 text-white"
              }`}
            >
              {torchOn ? <Zap className="w-5 h-5" /> : <ZapOff className="w-5 h-5" />}
            </button>
          )}
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-safe">
          {/* ── Cámara viva: mirilla + instrucción ── */}
          {showCamera && (phase.kind === "scanning" || flash) && (
            <>
              <motion.div
                className="relative w-full max-w-[300px] aspect-[5/3]"
                animate={flash ? { scale: [1, 1.045, 1] } : { scale: 1 }}
                transition={{ duration: 0.42, ease: "easeOut" }}
              >
                {/* Cuatro esquinas en vez de un marco cerrado: dejan ver el
                    envase entero y no compiten con el código. Al leerlo pasan
                    a verde, que es el color con el que Elevate confirma. */}
                {[
                  "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-2xl",
                  "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-2xl",
                  "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-2xl",
                  "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-2xl",
                ].map((cls) => (
                  <span
                    key={cls}
                    className={`absolute w-10 h-10 transition-colors duration-200 ${
                      flash ? "border-emerald-400" : "border-primary"
                    } ${cls}`}
                  />
                ))}
                {/* La línea barre mientras busca y se apaga al encontrar: si
                    siguiera moviéndose parecería que no leyó nada. */}
                {!flash && (
                  <motion.span
                    className="absolute left-3 right-3 h-[2px] rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
                    animate={{ top: ["12%", "88%", "12%"] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {flash && (
                  <motion.span
                    className="absolute inset-0 rounded-2xl bg-emerald-400/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                )}
              </motion.div>
              <p className="mt-6 text-center text-white/80 text-[15px] font-semibold max-w-xs">
                {flash ? "¡Código leído!" : "Apuntá al código de barras del envase"}
              </p>
              {status === "requesting" && (
                <p className="mt-2 text-center text-white/50 text-sm">Abriendo la cámara…</p>
              )}
            </>
          )}

          {/* ── Buscando el producto ── */}
          {phase.kind === "searching" && !flash && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl bg-card/95 backdrop-blur border border-border p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                <motion.span
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  className="flex"
                >
                  <Barcode className="w-7 h-7 text-primary" />
                </motion.span>
              </div>
              <p className="text-lg font-black text-foreground tracking-tight">Buscando el producto…</p>
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">{phase.barcode}</p>
              {/* Esqueleto: adelanta la forma de la ficha que viene. */}
              <div className="mt-5 space-y-2">
                <div className="h-3 rounded-full bg-white/[0.07] animate-pulse" />
                <div className="h-3 w-2/3 mx-auto rounded-full bg-white/[0.07] animate-pulse" />
              </div>
            </motion.div>
          )}

          {/* ── No se pudo: motivo concreto + salidas ── */}
          {phase.kind === "failed" && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl bg-card/95 backdrop-blur border border-border p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-400/12 border border-amber-400/25 flex items-center justify-center">
                {phase.reason === "offline" ? (
                  <WifiOff className="w-7 h-7 text-amber-400" />
                ) : (
                  <Barcode className="w-7 h-7 text-amber-400" />
                )}
              </div>
              <p className="text-lg font-black text-foreground tracking-tight">
                {FAILURE_COPY[phase.reason].title}
              </p>
              <p className="mt-1.5 text-sm text-foreground/70 leading-relaxed">
                {FAILURE_COPY[phase.reason].body}
              </p>
              <p className="mt-2 text-sm text-muted-foreground tabular-nums">{phase.barcode}</p>

              {/* Cargar los datos del producto es MEJOR que anotar la comida
                  suelta: queda pegado al código de barras y la próxima vez que
                  lo escanees ya está. Por eso es la acción principal. */}
              <button
                onClick={() =>
                  onManualProduct ? onManualProduct(phase.barcode) : onManual()
                }
                className="w-full min-h-12 mt-5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <PencilLine className="w-5 h-5" />
                Cargar los datos del envase
              </button>
              <button
                onClick={retry}
                className="w-full min-h-12 mt-2 rounded-2xl bg-secondary/60 border border-white/[0.06] text-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <RotateCcw className="w-5 h-5" />
                Escanear otro
              </button>
            </motion.div>
          )}

          {/* ── Sin permiso de cámara ── */}
          {status === "denied" && (
            <div className="w-full max-w-sm rounded-3xl bg-card/95 backdrop-blur border border-border p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/12 border border-primary/25 flex items-center justify-center">
                <Camera className="w-7 h-7 text-primary" />
              </div>
              <p className="text-lg font-black text-foreground tracking-tight">
                Elevate necesita la cámara
              </p>
              <p className="mt-1.5 text-sm text-foreground/70 leading-relaxed">
                Es sólo para leer el código de barras del envase. No se saca ninguna foto ni se
                guarda nada. Podés darle permiso en los ajustes de tu teléfono, en Elevate.
              </p>
              <button
                onClick={onManual}
                className="w-full min-h-12 mt-5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <PencilLine className="w-5 h-5" />
                Anotarlo a mano
              </button>
              <button
                onClick={() => void start()}
                className="w-full min-h-12 mt-2 rounded-2xl bg-secondary/60 border border-white/[0.06] text-foreground font-bold active:scale-[0.98] transition-transform"
              >
                Ya le di permiso, reintentar
              </button>
            </div>
          )}

          {/* ── El aparato no puede ── */}
          {(status === "unsupported" || status === "error") && (
            <div className="w-full max-w-sm rounded-3xl bg-card/95 backdrop-blur border border-border p-6 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-primary/12 border border-primary/25 flex items-center justify-center">
                <Camera className="w-7 h-7 text-primary" />
              </div>
              <p className="text-lg font-black text-foreground tracking-tight">
                No pudimos usar la cámara
              </p>
              <p className="mt-1.5 text-sm text-foreground/70 leading-relaxed">
                {status === "unsupported"
                  ? "Este dispositivo no tiene una cámara que podamos usar para escanear."
                  : "Puede que otra app la esté usando. Cerrala y volvé a intentar."}
              </p>
              <button
                onClick={onManual}
                className="w-full min-h-12 mt-5 rounded-2xl bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <PencilLine className="w-5 h-5" />
                Anotarlo a mano
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BarcodeScannerSheet;
