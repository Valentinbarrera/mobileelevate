import * as React from "react";

/**
 * useMediaQuery — suscripción a una media query con lectura SÍNCRONA inicial.
 *
 * A diferencia de useIsMobile (que arranca en `undefined` y provoca un flash),
 * este hook lee window.matchMedia en el primer render, así el layout desktop vs
 * mobile se decide sin parpadeo. Se usa para elegir el layout de cada pantalla:
 * el mobile queda intacto y el desktop se monta sólo en `lg+`.
 */
export function useMediaQuery(query: string): boolean {
  const getMatch = () =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = React.useState<boolean>(getMatch);

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Atajo: ¿estamos en viewport desktop? (coincide con el breakpoint `lg` de Tailwind) */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
