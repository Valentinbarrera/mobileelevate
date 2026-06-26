/**
 * Biblioteca de ejercicios — buscador + filtro por músculo + grilla con video.
 * Se usa como pantalla (/exercises) y como overlay "Ver todos" durante el entreno.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Play, Dumbbell, X } from "lucide-react";
import ExerciseDetailModal from "./ExerciseDetailModal";
import { useExerciseLibrary, type LibraryExercise } from "@/hooks/useExerciseLibrary";
import LoadingSpinner from "@/components/ui/loading-spinner";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const ExerciseLibrary = ({ onClose }: { onClose: () => void }) => {
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

  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-5 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onClose} aria-label="Cerrar" className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Dumbbell className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Biblioteca</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Ejercicios</h1>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar ejercicio…"
              className="w-full min-w-0 h-11 pl-10 pr-9 rounded-xl bg-secondary border border-border text-base font-medium text-foreground focus:border-primary focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Limpiar"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filtro por músculo */}
        {muscles.length > 0 && (
          <div className="max-w-5xl mx-auto flex gap-1.5 overflow-x-auto scrollbar-hide px-5 pb-3">
            <button
              onClick={() => setMuscle(null)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                !muscle ? "bg-gradient-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground"
              }`}
            >
              Todos
            </button>
            {muscles.map((m) => (
              <button
                key={m}
                onClick={() => setMuscle(m === muscle ? null : m)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                  muscle === m ? "bg-gradient-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="max-w-5xl mx-auto px-5 pt-4">
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
                onClick={() => setSelected(ex)}
                className="text-left card-elevated rounded-2xl overflow-hidden group"
              >
                <div className="relative aspect-square bg-secondary">
                  {ex.thumbnailUrl ? (
                    <img src={ex.thumbnailUrl} alt={ex.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Dumbbell className="w-9 h-9 text-muted-foreground/30" />
                    </div>
                  )}
                  {ex.videoUrl && (
                    <div className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-black/55 backdrop-blur flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-bold text-foreground leading-tight line-clamp-2">{ex.name}</p>
                  {ex.muscle && <p className="text-[11px] text-primary capitalize mt-0.5 truncate">{cap(ex.muscle)}</p>}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <ExerciseDetailModal exercise={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default ExerciseLibrary;
