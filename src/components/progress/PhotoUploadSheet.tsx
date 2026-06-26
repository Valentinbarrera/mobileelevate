/**
 * Bottom-sheet para SUBIR una foto de progreso (galería/archivo, sin cámara).
 * Elegís tipo (frente/lateral/espalda) + fecha y subís la imagen.
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ImagePlus, Check, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { PHOTO_TYPES, type PhotoType } from "@/hooks/useProgressPhotos";

interface PhotoUploadSheetProps {
  open: boolean;
  onClose: () => void;
  defaultDate: string; // YYYY-MM-DD
  defaultType?: PhotoType;
  uploading: boolean;
  onUpload: (args: { file: File; photoType: PhotoType; date: string }) => Promise<void>;
}

const MAX_MB = 8;

const PhotoUploadSheet = ({
  open,
  onClose,
  defaultDate,
  defaultType = "front",
  uploading,
  onUpload,
}: PhotoUploadSheetProps) => {
  const [photoType, setPhotoType] = useState<PhotoType>(defaultType);
  const [date, setDate] = useState(defaultDate);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset al abrir
  useEffect(() => {
    if (open) {
      setPhotoType(defaultType);
      setDate(defaultDate);
      setFile(null);
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    }
  }, [open, defaultDate, defaultType]);

  // Limpiar object URL
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pickFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Tiene que ser una imagen");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`La imagen supera los ${MAX_MB}MB`);
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file || uploading) return;
    try {
      await onUpload({ file, photoType, date });
      toast.success("Foto subida 📸");
      onClose();
    } catch (e) {
      toast.error((e as Error).message || "No se pudo subir la foto");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md card-elevated rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-xl font-black text-foreground">Subir foto</h2>
                <p className="text-sm text-muted-foreground">Tu coach va a poder verla y compararla.</p>
              </div>
              <button onClick={onClose} aria-label="Cerrar" className="text-muted-foreground p-1 -mr-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tipo de foto */}
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Pose</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {PHOTO_TYPES.map((t) => {
                const active = photoType === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setPhotoType(t.key)}
                    className={`flex flex-col items-center gap-1 rounded-2xl py-3 border transition-colors ${
                      active
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-white/[0.06] bg-secondary/40 text-muted-foreground"
                    }`}
                  >
                    <span className="text-xl">{t.emoji}</span>
                    <span className="text-xs font-bold">{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Fecha */}
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Fecha</p>
            <div className="relative mb-5">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={date}
                max={defaultDate}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 pl-10 pr-3 rounded-2xl bg-secondary border border-border text-foreground font-semibold focus:border-primary focus:outline-none"
              />
            </div>

            {/* Selector de imagen + preview */}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={() => inputRef.current?.click()}
              className={`w-full rounded-2xl border-2 border-dashed overflow-hidden transition-colors ${
                preview ? "border-primary/40" : "border-white/15 hover:border-primary/40"
              }`}
            >
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Vista previa" className="w-full max-h-72 object-cover" />
                  <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-background/80 backdrop-blur text-xs font-bold text-foreground">
                    Cambiar
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10">
                  <ImagePlus className="w-8 h-8 text-primary" />
                  <span className="text-sm font-bold text-foreground">Elegí una foto</span>
                  <span className="text-xs text-muted-foreground">JPG o PNG · hasta {MAX_MB}MB</span>
                </div>
              )}
            </button>

            {/* Acción */}
            <button
              onClick={submit}
              disabled={!file || uploading}
              className="mt-5 w-full h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-bold flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.99] transition-transform"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Subiendo...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" /> Subir foto
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhotoUploadSheet;
