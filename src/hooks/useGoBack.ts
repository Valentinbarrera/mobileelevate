/**
 * Volver atrás sin quedar encerrado.
 *
 * `navigate(-1)` no hace NADA cuando no hay historial al que volver, y en la
 * app nativa eso pasa seguido: iOS no tiene botón físico de atrás ni gesto de
 * swipe dentro del WebView, así que si entraste por una notificación, por un
 * deep link o después de un redirect de login, el botón "volver" queda muerto
 * y la pantalla es un callejón sin salida.
 *
 * React Router lleva la posición dentro de su pila en `history.state.idx`. Si
 * es 0 (o no existe) estamos en la primera entrada y no hay a dónde volver:
 * ahí vamos al destino de respaldo en vez de no hacer nada.
 */
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useGoBack(fallback = "/") {
  const navigate = useNavigate();

  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === "number" && idx > 0) {
      navigate(-1);
      return;
    }
    navigate(fallback, { replace: true });
  }, [navigate, fallback]);
}
