/**
 * ReorderableSections — pila de bloques que el alumno puede reordenar.
 *
 * "Personalizar" activa el modo edición: cada bloque muestra flechas ▲▼ para
 * subirlo o bajarlo (y un botón para ocultarlo/mostrarlo). Flechas y no
 * arrastrar: en el celular, arrastrar pelea con el scroll de la página.
 * El orden y lo oculto se guardan en localStorage, por pantalla.
 */
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, Eye, EyeOff, RotateCcw, SlidersHorizontal } from "lucide-react";

export interface Section {
  id: string;
  label: string;
  /** Falsy = el bloque no aplica hoy (no se muestra ni se lista). */
  node: ReactNode;
}

interface Stored {
  order: string[];
  hidden: string[];
}

const readStored = (key: string): Stored => {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "null");
    return {
      order: Array.isArray(raw?.order) ? raw.order.filter((x: unknown) => typeof x === "string") : [],
      hidden: Array.isArray(raw?.hidden) ? raw.hidden.filter((x: unknown) => typeof x === "string") : [],
    };
  } catch {
    return { order: [], hidden: [] };
  }
};

const ReorderableSections = ({
  storageKey,
  sections,
}: {
  storageKey: string;
  sections: Section[];
}) => {
  const [stored, setStored] = useState<Stored>(() => readStored(storageKey));
  const [editing, setEditing] = useState(false);

  const persist = useCallback(
    (next: Stored) => {
      setStored(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* almacenamiento no disponible */
      }
    },
    [storageKey],
  );

  // Orden guardado primero; lo que no esté guardado (bloques nuevos) va al final
  // en su orden por defecto.
  const ordered = useMemo(() => {
    const present = sections.filter((s) => !!s.node);
    const byId = new Map(present.map((s) => [s.id, s]));
    const known = stored.order.filter((id) => byId.has(id)).map((id) => byId.get(id)!);
    const rest = present.filter((s) => !stored.order.includes(s.id));
    return [...known, ...rest];
  }, [sections, stored.order]);

  const move = (id: string, dir: -1 | 1) => {
    const ids = ordered.map((s) => s.id);
    const i = ids.indexOf(id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    persist({ ...stored, order: ids });
  };

  const toggleHidden = (id: string) =>
    persist({
      ...stored,
      hidden: stored.hidden.includes(id) ? stored.hidden.filter((h) => h !== id) : [...stored.hidden, id],
    });

  const reset = () => persist({ order: [], hidden: [] });

  const visible = editing ? ordered : ordered.filter((s) => !stored.hidden.includes(s.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {editing && (stored.order.length > 0 || stored.hidden.length > 0) && (
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 min-h-11 rounded-xl text-sm font-bold text-foreground/70 active:scale-95 transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            Restablecer
          </button>
        )}
        <button
          onClick={() => setEditing((e) => !e)}
          aria-pressed={editing}
          className={`flex items-center gap-1.5 px-4 min-h-11 rounded-xl text-sm font-bold active:scale-95 transition-transform ${
            editing ? "bg-primary text-primary-foreground" : "card-elevated text-foreground"
          }`}
        >
          {editing ? <Check className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
          {editing ? "Listo" : "Personalizar"}
        </button>
      </div>

      {visible.map((s, i) => {
        const hidden = stored.hidden.includes(s.id);
        if (!editing) return <div key={s.id}>{s.node}</div>;
        return (
          <div
            key={s.id}
            className="rounded-3xl border border-dashed border-primary/40 p-2 space-y-2 bg-primary/[0.03]"
          >
            <div className="flex items-center gap-1.5 px-1">
              <p className="flex-1 min-w-0 truncate text-[13px] font-bold uppercase tracking-wider text-foreground/80">
                {s.label}
              </p>
              <button
                onClick={() => toggleHidden(s.id)}
                aria-label={hidden ? `Mostrar ${s.label}` : `Ocultar ${s.label}`}
                className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-foreground/80 active:scale-95 transition-transform"
              >
                {hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button
                onClick={() => move(s.id, -1)}
                disabled={i === 0}
                aria-label={`Subir ${s.label}`}
                className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-foreground/80 disabled:opacity-30 active:scale-95 transition-transform"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => move(s.id, 1)}
                disabled={i === visible.length - 1}
                aria-label={`Bajar ${s.label}`}
                className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-foreground/80 disabled:opacity-30 active:scale-95 transition-transform"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
            </div>
            <div className={hidden ? "opacity-40 pointer-events-none" : ""}>{s.node}</div>
          </div>
        );
      })}
    </div>
  );
};

export default ReorderableSections;
