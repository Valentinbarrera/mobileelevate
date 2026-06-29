/**
 * Fotos de progreso del alumno.
 *
 * Cada foto vive en el bucket privado `progress-photos` (carpeta = auth uid) y
 * se referencia desde la tabla `progress_photos`, atada SIEMPRE a un registro de
 * `anthropometry` (una fecha/medición). Por eso al subir hacemos find-or-create
 * del registro de antropometría del día elegido.
 *
 * El coach deja feedback en `photo_comments` (solo lectura para el alumno).
 *
 * Requiere correr una vez `scripts/setup-progress-photos.sql` en el dashboard.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { parseLocalDateString, getLocalDateString } from "@/lib/date";

const BUCKET = "progress-photos";
const SIGNED_TTL = 60 * 60 * 24 * 7; // 7 días

export type PhotoType = "front" | "side" | "back";

export const PHOTO_TYPES: { key: PhotoType; label: string; emoji: string }[] = [
  { key: "front", label: "Frente", emoji: "🧍" },
  { key: "side", label: "Lateral", emoji: "🚶" },
  { key: "back", label: "Espalda", emoji: "🧍‍♂️" },
];

export interface PhotoComment {
  id: string;
  comment: string;
  createdAt: string | null;
}

export interface ProgressPhoto {
  id: string;
  photoType: PhotoType;
  storagePath: string;
  date: string; // YYYY-MM-DD (de anthropometry)
  url: string | null; // signed URL
  comments: PhotoComment[];
}

export interface PhotoMonth {
  month: string; // YYYY-MM
  label: string; // "Junio 2026"
  sortKey: string; // fecha más reciente del mes
  photos: ProgressPhoto[];
}

// Agrupamos por FECHA (cada sesión de fotos), no por mes, así no se oculta
// ninguna foto cuando hay varias del mismo tipo en el mismo mes.
const dateLabel = (date: string) => {
  const d = parseLocalDateString(date);
  const s = d.toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export function useProgressPhotos() {
  const { student } = useAuthContext();
  const queryClient = useQueryClient();
  const studentId = student?.id ?? null;

  const query = useQuery({
    queryKey: ["progress-photos", studentId],
    enabled: !!studentId,
    staleTime: 1000 * 60 * 2,
    queryFn: async (): Promise<PhotoMonth[]> => {
      if (!studentId) return [];

      const { data: rows, error } = await supabase
        .from("progress_photos")
        .select("id, photo_type, storage_path, anthropometry:anthropometry_id ( date )")
        .eq("student_id", studentId);
      if (error) throw error;
      if (!rows || rows.length === 0) return [];

      // Signed URLs en batch
      const paths = rows.map((r) => r.storage_path);
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_TTL);
      const urlByPath = new Map<string, string>();
      (signed || []).forEach((s) => {
        if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
      });

      // Comentarios del coach
      const ids = rows.map((r) => r.id);
      const { data: commentRows } = await supabase
        .from("photo_comments")
        .select("id, photo_id, comment, created_at")
        .in("photo_id", ids)
        .order("created_at", { ascending: true });
      const commentsByPhoto = new Map<string, PhotoComment[]>();
      (commentRows || []).forEach((c) => {
        const list = commentsByPhoto.get(c.photo_id) || [];
        list.push({ id: c.id, comment: c.comment, createdAt: c.created_at });
        commentsByPhoto.set(c.photo_id, list);
      });

      const photos: ProgressPhoto[] = rows.map((r) => {
        // anthropometry puede venir como objeto o array según el embed
        const anthro = Array.isArray(r.anthropometry) ? r.anthropometry[0] : r.anthropometry;
        return {
          id: r.id,
          photoType: r.photo_type as PhotoType,
          storagePath: r.storage_path,
          date: (anthro?.date as string) || "",
          url: urlByPath.get(r.storage_path) || null,
          comments: commentsByPhoto.get(r.id) || [],
        };
      });

      // Agrupar por FECHA (cada día de fotos muestra sus frente/lateral/espalda)
      const byDate = new Map<string, PhotoMonth>();
      photos.forEach((p) => {
        if (!p.date) return;
        const existing = byDate.get(p.date);
        if (existing) {
          existing.photos.push(p);
        } else {
          byDate.set(p.date, { month: p.date, label: dateLabel(p.date), sortKey: p.date, photos: [p] });
        }
      });

      return [...byDate.values()].sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1)); // más reciente primero
    },
  });

  // ── Subir una foto (file picker; sin cámara) ──────────────────────────────
  const upload = useMutation({
    mutationFn: async ({
      file,
      photoType,
      date,
    }: {
      file: File;
      photoType: PhotoType;
      date: string;
    }) => {
      if (!studentId) throw new Error("Tenés que iniciar sesión para subir fotos.");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión no válida. Iniciá sesión de nuevo.");

      // 1. find-or-create el registro de antropometría de esa fecha
      const { data: existingAnthro } = await supabase
        .from("anthropometry")
        .select("id")
        .eq("student_id", studentId)
        .eq("date", date)
        .maybeSingle();

      let anthropometryId = existingAnthro?.id as string | undefined;
      if (!anthropometryId) {
        const { data: created, error: createErr } = await supabase
          .from("anthropometry")
          .insert({ student_id: studentId, date })
          .select("id")
          .single();
        if (createErr) throw createErr;
        anthropometryId = created.id;
      }

      // 2. subir el archivo al bucket (carpeta = auth uid, 1 foto por tipo/medición)
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${anthropometryId}/${photoType}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type || "image/jpeg" });
      if (upErr) throw upErr;

      // 3. upsert de la fila en progress_photos
      const { data: existingPhotoRow } = await supabase
        .from("progress_photos")
        .select("id")
        .eq("anthropometry_id", anthropometryId)
        .eq("photo_type", photoType)
        .maybeSingle();

      if (existingPhotoRow?.id) {
        const { error } = await supabase
          .from("progress_photos")
          .update({ storage_path: path })
          .eq("id", existingPhotoRow.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("progress_photos").insert({
          student_id: studentId,
          anthropometry_id: anthropometryId,
          photo_type: photoType,
          storage_path: path,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress-photos", studentId] });
      queryClient.invalidateQueries({ queryKey: ["anthropometry", studentId] });
    },
  });

  // ── Borrar una foto ───────────────────────────────────────────────────────
  const remove = useMutation({
    mutationFn: async (photo: ProgressPhoto) => {
      await supabase.storage.from(BUCKET).remove([photo.storagePath]);
      const { error } = await supabase.from("progress_photos").delete().eq("id", photo.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress-photos", studentId] });
    },
  });

  return {
    months: query.data ?? [],
    loading: query.isLoading,
    error: query.error as Error | null,
    canUpload: !!studentId,
    uploadPhoto: upload.mutateAsync,
    uploading: upload.isPending,
    deletePhoto: remove.mutateAsync,
    deleting: remove.isPending,
    today: getLocalDateString(),
  };
}
