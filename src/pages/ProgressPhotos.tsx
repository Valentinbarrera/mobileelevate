/**
 * Fotos de progreso — el alumno sube fotos mes a mes (frente/lateral/espalda),
 * las compara lado a lado y ve el feedback del coach.
 *
 * UX: galería agrupada por mes + modo comparar + subida por file-picker.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Plus, MessageCircle, ImageOff, GitCompareArrows } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageLoading from "@/components/ui/page-loading";
import PhotoUploadSheet from "@/components/progress/PhotoUploadSheet";
import PhotoLightbox from "@/components/progress/PhotoLightbox";
import {
  useProgressPhotos,
  PHOTO_TYPES,
  type PhotoType,
  type ProgressPhoto,
} from "@/hooks/useProgressPhotos";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { parseLocalDateString } from "@/lib/date";

type Mode = "gallery" | "compare";

const shortDate = (date: string) =>
  parseLocalDateString(date).toLocaleDateString("es-AR", { day: "numeric", month: "short" });

export default function ProgressPhotos() {
  const navigate = useNavigate();
  const {
    months,
    loading,
    canUpload,
    uploadPhoto,
    uploading,
    deletePhoto,
    deleting,
    today,
  } = useProgressPhotos();

  const [mode, setMode] = useState<Mode>("gallery");
  const [uploadFor, setUploadFor] = useState<{ date: string; type: PhotoType } | null>(null);
  const [lightbox, setLightbox] = useState<ProgressPhoto | null>(null);

  const hasPhotos = months.length > 0;

  const openUpload = (date: string, type: PhotoType) => setUploadFor({ date, type });

  const handleDelete = async (photo: ProgressPhoto) => {
    await deletePhoto(photo);
    setLightbox(null);
  };

  if (loading) return <PageLoading message="Cargando tus fotos..." />;

  return (
    <AppShell>
      <motion.div
        className="min-h-screen bg-background pb-32 lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-3xl mx-auto flex items-center gap-3 px-5 py-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground" aria-label="Volver">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <Camera className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Progreso visual</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-foreground">Fotos</h1>
            </div>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-5 pt-5 space-y-5">
          {/* Toggle galería / comparar */}
          {hasPhotos && (
            <div className="flex gap-2 p-1 rounded-2xl bg-secondary/40 border border-border/50">
              {([
                { k: "gallery", label: "Galería" },
                { k: "compare", label: "Comparar" },
              ] as { k: Mode; label: string }[]).map(({ k, label }) => {
                const active = mode === k;
                return (
                  <button
                    key={k}
                    onClick={() => setMode(k)}
                    className={`relative flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="photosModeToggle"
                        className="absolute inset-0 bg-gradient-primary rounded-xl"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Sin sesión */}
          {!canUpload && (
            <div className="card-elevated rounded-2xl p-6 text-center">
              <ImageOff className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-semibold text-foreground mb-1">Iniciá sesión</p>
              <p className="text-sm text-muted-foreground">
                Necesitás tu cuenta vinculada al coach para subir y guardar fotos.
              </p>
            </div>
          )}

          {/* Empty state */}
          {canUpload && !hasPhotos && (
            <motion.div variants={fadeUp} className="card-hero rounded-3xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-black text-foreground mb-1">Empezá tu progreso visual</p>
              <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                Subí tu primera foto. Cada mes sacate otra y mirá la evolución lado a lado.
              </p>
              <button
                onClick={() => openUpload(today, "front")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-primary text-primary-foreground font-bold active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" /> Subir primera foto
              </button>
            </motion.div>
          )}

          {/* ── GALERÍA ── */}
          {canUpload && hasPhotos && mode === "gallery" && (
            <div className="space-y-6">
              {months.map((m) => (
                <motion.div key={m.month} variants={fadeUp} className="space-y-2.5">
                  <div className="flex items-center gap-2 px-0.5">
                    <span className="accent-bar" />
                    <h3 className="text-sm font-black text-foreground tracking-tight capitalize">{m.label}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {PHOTO_TYPES.map((t) => {
                      const photo = m.photos.find((p) => p.photoType === t.key) || null;
                      if (photo) {
                        return (
                          <button
                            key={t.key}
                            onClick={() => setLightbox(photo)}
                            className="relative aspect-[3/4] rounded-2xl overflow-hidden card-elevated group"
                          >
                            {photo.url ? (
                              <img
                                src={photo.url}
                                alt={t.label}
                                className="w-full h-full object-cover group-active:scale-[1.02] transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full bg-secondary/50" />
                            )}
                            <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-left">
                              <span className="text-[11px] font-bold text-white">{t.label}</span>
                            </span>
                            {photo.comments.length > 0 && (
                              <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
                                <MessageCircle className="w-3 h-3 text-primary-foreground" />
                              </span>
                            )}
                          </button>
                        );
                      }
                      return (
                        <button
                          key={t.key}
                          onClick={() => openUpload(m.sortKey, t.key)}
                          className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 flex flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                          <span className="text-[11px] font-semibold">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── COMPARAR ── */}
          {canUpload && hasPhotos && mode === "compare" && (
            <CompareView months={months} />
          )}
        </div>

        {/* FAB subir */}
        {canUpload && hasPhotos && (
          <button
            onClick={() => openUpload(today, "front")}
            aria-label="Subir foto"
            className="fixed right-5 bottom-28 lg:bottom-8 z-40 w-14 h-14 rounded-2xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            style={{ boxShadow: "0 10px 24px hsl(18 100% 55% / 0.45)" }}
          >
            <Plus className="w-6 h-6" strokeWidth={2.6} />
          </button>
        )}

        <PhotoUploadSheet
          open={!!uploadFor}
          onClose={() => setUploadFor(null)}
          defaultDate={uploadFor?.date ?? today}
          defaultType={uploadFor?.type ?? "front"}
          uploading={uploading}
          onUpload={uploadPhoto}
        />

        <PhotoLightbox
          photo={lightbox}
          onClose={() => setLightbox(null)}
          onDelete={handleDelete}
          deleting={deleting}
        />
      </motion.div>
    </AppShell>
  );
}

// ─── Vista de comparación lado a lado ─────────────────────────────────────────
function CompareView({ months }: { months: ReturnType<typeof useProgressPhotos>["months"] }) {
  const [pose, setPose] = useState<PhotoType>("front");

  // Todas las fotos de esa pose, ordenadas por fecha asc
  const series = useMemo(() => {
    const all = months
      .flatMap((m) => m.photos)
      .filter((p) => p.photoType === pose)
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    return all;
  }, [months, pose]);

  const [leftIdx, setLeftIdx] = useState(0);
  // null = "todavía no elegí" → por defecto muestro la última (más reciente)
  const [rightIdx, setRightIdx] = useState<number | null>(null);

  const lastIdx = Math.max(0, series.length - 1);
  const li = Math.min(leftIdx, lastIdx);
  const ri = rightIdx == null ? lastIdx : Math.min(rightIdx, lastIdx);
  const left = series[li] ?? null;
  const right = series[ri] ?? null;

  return (
    <div className="space-y-4">
      {/* Selector de pose */}
      <div className="grid grid-cols-3 gap-2">
        {PHOTO_TYPES.map((t) => {
          const active = pose === t.key;
          return (
            <button
              key={t.key}
              onClick={() => { setPose(t.key); setLeftIdx(0); setRightIdx(0); }}
              className={`flex items-center justify-center gap-1.5 rounded-2xl py-2.5 border text-sm font-bold transition-colors ${
                active ? "border-primary/50 bg-primary/10 text-primary" : "border-white/[0.06] bg-secondary/40 text-muted-foreground"
              }`}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          );
        })}
      </div>

      {series.length < 2 ? (
        <div className="card-elevated rounded-2xl p-6 text-center">
          <GitCompareArrows className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Necesitás al menos 2 fotos de <span className="font-bold text-foreground">{PHOTO_TYPES.find((t) => t.key === pose)?.label}</span> para comparar.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {[{ photo: left, idx: li, set: setLeftIdx, tag: "Antes" }, { photo: right, idx: ri, set: setRightIdx, tag: "Después" }].map(
              ({ photo, idx, set, tag }, i) => (
                <div key={i} className="space-y-2">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden card-elevated">
                    {photo?.url ? (
                      <img src={photo.url} alt={tag} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-secondary/50" />
                    )}
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-background/80 backdrop-blur text-[10px] font-black uppercase tracking-wider text-foreground">
                      {tag}
                    </span>
                  </div>
                  <select
                    value={idx}
                    onChange={(e) => set(Number(e.target.value))}
                    className="w-full h-10 rounded-xl bg-secondary border border-border text-foreground text-sm font-semibold px-3 focus:border-primary focus:outline-none"
                  >
                    {series.map((p, j) => (
                      <option key={p.id} value={j}>
                        {shortDate(p.date)}
                      </option>
                    ))}
                  </select>
                </div>
              )
            )}
          </div>
          {left && right && left.date !== right.date && (
            <p className="text-center text-xs text-muted-foreground">
              {Math.max(
                0,
                Math.round(
                  (parseLocalDateString(right.date).getTime() - parseLocalDateString(left.date).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              )}{" "}
              días de diferencia
            </p>
          )}
        </>
      )}
    </div>
  );
}
