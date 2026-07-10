/**
 * Biblioteca de ejercicios — buscador + filtro por músculo + grilla con video.
 * Se usa como pantalla (/exercises, con PageHeader → `showHeader={false}`) y
 * como overlay "Ver todos" durante el entreno (con su header interno propio).
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Play, Dumbbell, X } from "lucide-react";
import ExerciseDetailModal from "./ExerciseDetailModal";
import { useExerciseLibrary, type LibraryExercise } from "@/hooks/useExerciseLibrary";
import LoadingSpinner from "@/components/ui/loading-spinner";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const ExerciseLibrary = ({
  onClose,
  showHeader = true,
}: {
  onClose: () => void;
  /** Header interno con back + título. La página lo apaga y usa PageHeader. */
  showHeader?: boolean;
}) => {
  const { exercises, loading } = useExerciseLibrary();
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState<string | null>(null);
  const [selected, setSelected] = useState<LibraryExercise | null>(null);

  const muscles = useMemo(() => {
    const set = new Set<string>();
    exercises.forEach((e) => e.muscle && set.add(e.muscle.toLowerCase()));
    return [...set].sort();
  }, [exercises]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((e) => {
      const matchQ = !q || e.name.toLowerCase().includes(q) || (e.muscle || "").toLowerCase().includes(q);
      const matchM = !muscle || (e.muscle || "").toLowerCase() === muscle;
      return matchQ && matchM;
    });
  }, [exercises, search, muscle]);

  // Buscador + filtros: reutilizados en ambos modos (embebido y página).
  const toolbar = (
    <div className="space-y-3">
      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ejercicio…"
          className="w-full min-w-0 h-12 pl-11 pr-10 rounded-2xl bg-secondary/60 border border-white/[0.06] text-base font-medium text-foreground placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Limpiar"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtro por músculo — chips scrolleables (activo en naranja) */}
      {muscles.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
          <button
            onClick={() => setMuscle(null)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-colors ${
              !muscle
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-secondary/60 text-muted-foreground border-transparent"
            }`}
          >
            Todos
          </button>
          {muscles.map((m) => (
            <button
              key={m}
              onClick={() => setMuscle(m === muscle ? null : m)}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold capitalize border transition-colors ${
                muscle === m
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-secondary/60 text-muted-foreground border-transparent"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-nav lg:pb-10">
      {/* Header interno (solo overlay "Ver todos"; la página usa PageHeader) */}
      {showHeader && (
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/50 header-safe pb-3">
          <div className="max-w-5xl mx-auto px-5">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="shrink-0 w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Dumbbell className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-bold text-primary uppercase tracking-[0.14em]">
                    Biblioteca
                  </span>
                </div>
                <h1 className="text-xl font-black tracking-tight text-foreground leading-tight">
                  Ejercicios
                </h1>
              </div>
            </div>
            {toolbar}
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        {/* En modo página, el buscador + filtros van acá (no sticky) */}
        {!showHeader && <div className="pt-4">{toolbar}</div>}

        <div className="pt-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Dumbbell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {exercises.length === 0 ? "No hay ejercicios cargados todavía." : "Sin resultados para tu búsqueda."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map((ex, i) => (
                <motion.button
                  key={ex.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelected(ex)}
                  className="text-left card-elevated rounded-2xl overflow-hidden group"
                >
                  <div className="relative aspect-square bg-secondary">
                    {ex.thumbnailUrl ? (
                      <img
                        src={ex.thumbnailUrl}
                        alt={ex.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-active:scale-[1.03]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Dumbbell className="w-9 h-9 text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Scrim inferior para legibilidad del badge */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    {ex.videoUrl && (
                      <div className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-black/55 backdrop-blur flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-bold text-foreground leading-tight line-clamp-2">{ex.name}</p>
                    {ex.muscle && (
                      <p className="text-[11px] font-semibold text-primary capitalize mt-0.5 truncate">
                        {cap(ex.muscle)}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ExerciseDetailModal exercise={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default ExerciseLibrary;
