/**
 * Pantalla de la biblioteca de ejercicios (accesos directos → Ejercicios).
 * Reutiliza el mismo componente que el overlay "Ver todos" del entreno.
 */
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ExerciseLibrary from "@/components/workout/ExerciseLibrary";

export default function ExerciseLibraryPage() {
  const navigate = useNavigate();
  return (
    <AppShell>
      <ExerciseLibrary onClose={() => navigate(-1)} />
    </AppShell>
  );
}
