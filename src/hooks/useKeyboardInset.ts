/**
 * Altura del teclado en pantalla, en px. Se usa para levantar los bottom-sheets
 * por encima del teclado (con `Keyboard.resize: 'body'` el sheet fijo queda
 * anclado al fondo real de la pantalla y el teclado lo tapa).
 *
 * - Nativo (Capacitor iOS/Android): escucha el plugin Keyboard, que da la altura
 *   exacta del teclado.
 * - Web / PWA: cae al `visualViewport`, cuya diferencia con `innerHeight`
 *   equivale a lo que ocupa el teclado.
 */
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    // ── Nativo: plugin Keyboard (altura autoritativa) ──
    if (Capacitor.isNativePlatform()) {
      let cleanup: (() => void) | undefined;
      let cancelled = false;
      import("@capacitor/keyboard").then(({ Keyboard }) => {
        if (cancelled) return;
        const showP = Keyboard.addListener("keyboardWillShow", (info) =>
          setInset(info.keyboardHeight)
        );
        const hideP = Keyboard.addListener("keyboardWillHide", () => setInset(0));
        cleanup = () => {
          void showP.then((h) => h.remove());
          void hideP.then((h) => h.remove());
        };
      });
      return () => {
        cancelled = true;
        cleanup?.();
      };
    }

    // ── Web: visualViewport ──
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const overlap = window.innerHeight - vv.height - vv.offsetTop;
      setInset(overlap > 60 ? overlap : 0); // umbral para ignorar barras del navegador
    };
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);

  return inset;
}
