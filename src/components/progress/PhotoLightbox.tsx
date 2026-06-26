/**
 * Visor a pantalla completa de una foto de progreso + feedback del coach.
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, MessageCircle, Loader2 } from "lucide-react";
import { PHOTO_TYPES, type ProgressPhoto } from "@/hooks/useProgressPhotos";
import { parseLocalDateString } from "@/lib/date";

interface PhotoLightboxProps {
  photo: ProgressPhoto | null;
  onClose: () => void;
  onDelete: (photo: ProgressPhoto) => void;
  deleting: boolean;
}

const fmtDate = (date: string) =>
  parseLocalDateString(date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

const PhotoLightbox = ({ photo, onClose, onDelete, deleting }: PhotoLightboxProps) => {
  const typeLabel = photo ? PHOTO_TYPES.find((t) => t.key === photo.photoType)?.label : "";

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          className="fixed inset-0 z-[110] bg-background/95 backdrop-blur-md flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4 shrink-0">
            <div>
              <p className="text-sm font-black text-foreground">{typeLabel}</p>
              <p className="text-xs text-muted-foreground capitalize">{photo.date && fmtDate(photo.date)}</p>
            </div>
            <button onClick={onClose} aria-label="Cerrar" className="w-10 h-10 rounded-full card-elevated flex items-center justify-center">
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Imagen */}
          <div className="flex-1 min-h-0 flex items-center justify-center px-4">
            {photo.url ? (
              <img src={photo.url} alt={typeLabel} className="max-w-full max-h-full object-contain rounded-2xl" />
            ) : (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            )}
          </div>

          {/* Comentarios del coach + borrar */}
          <div className="shrink-0 max-h-[40vh] overflow-y-auto px-5 py-4 space-y-3">
            {photo.comments.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                    Feedback del coach
                  </span>
                </div>
                {photo.comments.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-primary/10 border border-primary/20 px-4 py-3">
                    <p className="text-sm text-foreground/90">{c.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center">Tu coach todavía no comentó esta foto.</p>
            )}

            <button
              onClick={() => onDelete(photo)}
              disabled={deleting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-destructive text-sm font-bold active:scale-[0.99] transition-transform disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Eliminar foto
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhotoLightbox;
