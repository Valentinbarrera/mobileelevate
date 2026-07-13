/**
 * Exporta el cuestionario de intake del alumno a un PDF prolijo para que se lo
 * pueda pasar al coach. En mobile intenta abrir el menú de compartir con el
 * archivo (WhatsApp/mail); si no se puede, lo descarga. Sin IA, sin backend.
 */
import { jsPDF } from "jspdf";
import {
  SEX_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  ACTIVITY_OPTIONS,
  TRAINING_MODE_OPTIONS,
  WEEKDAYS,
  type OnboardingData,
} from "./onboarding";

type Opt = { value: string; label: string };
const label = (opts: Opt[], v: string | null) =>
  v ? opts.find((o) => o.value === v)?.label ?? v : "—";
const val = (v: number | null, suffix = "") => (v != null ? `${v}${suffix}` : "—");
const list = (arr: string[]) => (arr.length ? arr.join(", ") : "—");

export async function exportQuestionnairePdf(data: OnboardingData, studentName: string) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 48;
  const contentW = pageW - M * 2;
  const KX = M + 160; // columna de valores
  let y = M;

  const ensure = (h: number) => {
    if (y + h > pageH - M) {
      doc.addPage();
      y = M;
    }
  };

  // ── Encabezado ──
  doc.setFillColor(255, 92, 28);
  doc.rect(M, y - 2, 8, 22, "F");
  doc.setTextColor(28, 28, 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("ELEVATE", M + 16, y + 15);
  y += 34;
  doc.setFontSize(13);
  doc.text("Perfil del alumno · Cuestionario de intake", M, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(110, 115, 125);
  doc.text(`Alumno: ${studentName || "—"}`, M, y);
  y += 14;
  const completed = data.completedAt
    ? new Date(data.completedAt).toLocaleDateString("es-AR")
    : "—";
  doc.text(`Completado: ${completed}`, M, y);
  y += 12;
  doc.setDrawColor(225);
  doc.line(M, y, pageW - M, y);
  y += 22;

  const section = (title: string, rows: [string, string][]) => {
    ensure(34);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 92, 28);
    doc.text(title.toUpperCase(), M, y);
    y += 16;
    doc.setFontSize(10);
    for (const [k, v] of rows) {
      const vLines = doc.splitTextToSize(v, contentW - (KX - M));
      const rowH = Math.max(15, vLines.length * 13);
      ensure(rowH);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(110, 115, 125);
      doc.text(k, M, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(28, 28, 32);
      doc.text(vLines, KX, y);
      y += rowH + 3;
    }
    y += 12;
  };

  const trainingDays =
    data.trainingDays && data.trainingDays.length
      ? data.trainingDays
          .map((i) => WEEKDAYS[i])
          .filter(Boolean)
          .join(", ")
      : "—";

  section("Datos corporales", [
    ["Sexo", label(SEX_OPTIONS, data.sex)],
    ["Edad", val(data.age, " años")],
    ["Altura", val(data.heightCm, " cm")],
    ["Peso", val(data.weightKg, " kg")],
  ]);
  section("Experiencia y objetivo", [
    ["Experiencia", label(EXPERIENCE_OPTIONS, data.experience)],
    ["Objetivo", label(GOAL_OPTIONS, data.goal)],
    ["Actividad diaria", label(ACTIVITY_OPTIONS, data.activityLevel)],
    ["Prioridades", list(data.priorities)],
  ]);
  section("Entrenamiento", [
    ["Modalidad", label(TRAINING_MODE_OPTIONS, data.trainingMode)],
    ["Días por semana", val(data.daysPerWeek)],
    ["Días elegidos", trainingDays],
    ["Split", data.split ?? "—"],
    ["Duración", val(data.programWeeks, " semanas")],
    ["Equipamiento", list(data.equipment)],
    ["Ejercicios que domina", list(data.masteredExercises)],
  ]);
  section("Nutrición", [
    ["Comidas por día", val(data.mealsPerDay)],
    ["Restricciones", list(data.dietaryRestrictions)],
    ["Notas", data.nutritionNotes.trim() || "—"],
  ]);
  section("Lesiones y molestias", [
    ["Zonas", data.injuryAreas.length ? list(data.injuryAreas) : "Sin lesiones reportadas"],
    ["Notas", data.injuryNotes.trim() || "—"],
  ]);

  ensure(20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 155);
  doc.text("Generado por Elevate · datos declarados por el alumno.", M, pageH - 24);

  const safeName = (studentName || "alumno")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  const filename = `Elevate-Perfil-${safeName || "alumno"}.pdf`;

  // Compartir el archivo (mejor en mobile) o descargar como fallback.
  try {
    const blob = doc.output("blob");
    const file = new File([blob], filename, { type: "application/pdf" });
    const nav = navigator as Navigator & { canShare?: (d: unknown) => boolean };
    if (nav.share && nav.canShare && nav.canShare({ files: [file] })) {
      await nav.share({ files: [file], title: "Perfil Elevate", text: "Mi cuestionario de Elevate" });
      return;
    }
  } catch (e) {
    // el usuario canceló el menú de compartir → no descargamos
    if ((e as Error)?.name === "AbortError") return;
    // cualquier otro error → seguimos al fallback de descarga
  }
  doc.save(filename);
}
