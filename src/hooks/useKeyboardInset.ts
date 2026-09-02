/**
 * Altura del teclado en pantalla, en px. Se usa para levantar los bottom-sheets
 * por encima del teclado: los sheets son `position: fixed`, y un elemento fijo
 * se posiciona contra el viewport, no contra el body. Como `Keyboard.resize:
 * 'body'` sólo achica el body, el sheet sigue anclado al fondo REAL de la
 * pantalla y el teclado se lo come.
 *
 * Se escuchan las DOS fuentes a la vez y se toma la mayor:
 *
 *  - el plugin Keyboard de Capacitor, que da la altura exacta;
 *  - `visualViewport`, cuya diferencia con `innerHeight` es lo que ocupa el
 *    teclado.
 *
 * Antes el camino nativo hacía `return` temprano y nunca llegaba al
 * `visualViewport`. Cuando el plugin no avisaba —pasa en iOS según el modo de
 * resize— el inset quedaba en 0, el sheet no se levantaba y el botón de
 * guardar quedaba abajo del teclado, sin forma de llegar. Con las dos fuentes,
 * que falle una no rompe nada.
 */
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

/** Menos que esto no es un teclado: es la barra de direcciones del navegador. */
const MIN_KEYBOARD_PX = 60;

export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    let fromPlugin = 0;
    let fromViewport = 0;
    // Se queda con la más alta: si una fuente no reporta, manda la otra.
    const apply = () => setInset(Math.max(fromPlugin, fromViewport));

    // ── visualViewport: anda en la WebView y en el navegador ──
    const vv = typeof window !== "undefined" ? window.visualViewport : undefined;
    const onViewport = () => {
      if (!vv) return;
      const overlap = window.innerHeight - vv.height - vv.offsetTop;
      fromViewport = overlap > MIN_KEYBOARD_PX ? Math.round(overlap) : 0;
      apply();
    };
    vv?.addEventListener("resize", onViewport);
    vv?.addEventListener("scroll", onViewport);

    // ── Plugin Keyboard: sólo en la app nativa, y es el más preciso ──
    let removePlugin: (() => void) | undefined;
    let cancelled = false;
    if (Capacitor.isNativePlatform()) {
      void import("@capacitor/keyboard").then(({ Keyboard }) => {
        if (cancelled) return;
        const showP = Keyboard.addListener("keyboardWillShow", (info) => {
          fromPlugin = info.keyboardHeight;
          apply();
        });
        const hideP = Keyboard.addListener("keyboardWillHide", () => {
          fromPlugin = 0;
          apply();
        });
        removePlugin = () => {
          void showP.then((h) => h.remove());
          void hideP.then((h) => h.remove());
        };
      });
    }

    return () => {
      cancelled = true;
      removePlugin?.();
      vv?.removeEventListener("resize", onViewport);
      vv?.removeEventListener("scroll", onViewport);
    };
  }, []);

  return inset;
}
