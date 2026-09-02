/**
 * Cámara + lectura de códigos de barras.
 *
 * Toda la mecánica (getUserMedia, ZXing, linterna, limpieza del stream) vive
 * acá: el componente de scanner sólo recibe un estado y un código. Si mañana
 * hay que cambiar a un plugin nativo de Capacitor, se reescribe este archivo
 * y la UI no se entera.
 *
 * Se usa ZXing sobre `getUserMedia` en vez de un plugin nativo porque Elevate
 * es una WebView de Capacitor, no React Native: así el scanner funciona igual
 * en la app, en la PWA y en el navegador de desarrollo, que es la única forma
 * de poder probarlo sin un device en la mano.
 *
 * Sólo formatos de producto (EAN/UPC): habilitar QR y compañía hace que el
 * lector pruebe decenas de decodificadores por cuadro y baje el framerate.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BrowserMultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  type Result,
} from "@zxing/library";

export type ScannerStatus =
  /** Todavía no se pidió la cámara. */
  | "idle"
  /** Pidiendo permiso / abriendo el stream. */
  | "requesting"
  /** Cámara viva, buscando un código. */
  | "scanning"
  /** El usuario dijo que no, o el sistema lo bloqueó. */
  | "denied"
  /** El dispositivo o el navegador no puede (sin cámara, contexto inseguro). */
  | "unsupported"
  /** Falló al abrir la cámara por otro motivo. */
  | "error";

interface UseBarcodeScannerOptions {
  /** Se llama UNA sola vez por código detectado. */
  onDetected: (barcode: string) => void;
  /** Mientras sea false el lector ignora lo que ve (ej: buscando el producto). */
  active: boolean;
}

const HINTS = new Map<DecodeHintType, unknown>([
  [
    DecodeHintType.POSSIBLE_FORMATS,
    [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
    ],
  ],
]);

export function useBarcodeScanner({ onDetected, active }: UseBarcodeScannerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastCodeRef = useRef<string | null>(null);
  const activeRef = useRef(active);

  const [status, setStatus] = useState<ScannerStatus>("idle");
  const [torchOn, setTorchOn] = useState(false);
  const [torchAvailable, setTorchAvailable] = useState(false);

  // El callback y el flag se leen desde refs para que el efecto que abre la
  // cámara NO dependa de ellos: si dependiera, cada render que cambia `active`
  // apagaría y volvería a encender la cámara.
  const onDetectedRef = useRef(onDetected);
  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);
  useEffect(() => {
    activeRef.current = active;
    // Al reactivarse (ej: "escanear otro") se olvida el último código, si no
    // el mismo producto no se podría volver a escanear nunca.
    if (active) lastCodeRef.current = null;
  }, [active]);

  const stop = useCallback(() => {
    try {
      readerRef.current?.reset();
    } catch {
      /* el lector ya estaba frenado */
    }
    readerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setTorchOn(false);
    setTorchAvailable(false);
  }, []);

  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // `environment` = cámara trasera, que es con la que se apunta a un envase.
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;

      const track = stream.getVideoTracks()[0];
      // La linterna no existe en iOS ni en escritorio; sólo se ofrece si el
      // track dice que puede.
      const caps = track?.getCapabilities?.() as { torch?: boolean } | undefined;
      setTorchAvailable(!!caps?.torch);

      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setStatus("error");
        return;
      }
      video.srcObject = stream;
      video.setAttribute("playsinline", "true"); // iOS: sin esto abre pantalla completa
      await video.play().catch(() => undefined);

      const reader = new BrowserMultiFormatReader(HINTS as never);
      readerRef.current = reader;
      reader.decodeFromStream(stream, video, (result: Result | undefined) => {
        if (!result) return; // cuadro sin código: es lo normal, no es un error
        if (!activeRef.current) return;
        const code = result.getText().trim();
        if (!code || code === lastCodeRef.current) return;
        // Se recuerda el código ANTES de avisar: sin esto el lector dispara
        // varias veces el mismo envase y se registraría la comida repetida.
        lastCodeRef.current = code;
        onDetectedRef.current(code);
      });

      setStatus("scanning");
    } catch (e) {
      const name = (e as DOMException)?.name;
      if (name === "NotAllowedError" || name === "SecurityError") setStatus("denied");
      else if (name === "NotFoundError" || name === "OverconstrainedError") setStatus("unsupported");
      else setStatus("error");
      stop();
    }
  }, [stop]);

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] } as MediaTrackConstraints);
      setTorchOn(next);
    } catch {
      setTorchAvailable(false);
    }
  }, [torchOn]);

  // Apagar la cámara al desmontar es obligatorio: si no, el LED del teléfono
  // se queda prendido después de cerrar el scanner.
  useEffect(() => stop, [stop]);

  return { videoRef, status, start, stop, torchOn, torchAvailable, toggleTorch };
}
