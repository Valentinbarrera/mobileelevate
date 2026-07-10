/**
 * Pantalla de la biblioteca de ejercicios (accesos directos → Ejercicios).
 * Reutiliza el mismo componente que el overlay "Ver todos" del entreno, pero
 * apaga su header interno y usa PageHeader (safe-area iOS resuelta).
 */
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dumbbell } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import ExerciseLibrary from "@/components/workout/ExerciseLibrary";

export default function ExerciseLibraryPage() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <PageHeader
        eyebrow={
          <>
            <Dumbbell className="w-3.5 h-3.5" />
            Biblioteca
          </>
        }
        title="Ejercicios"
        maxWidth="max-w-5xl"
        left={
          <button
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        }
      />
      <ExerciseLibrary showHeader={false} onClose={() => navigate(-1)} />
    </AppShell>
  );
}
