import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UPDATED = "Julio de 2026";
const CONTACT = "appelevate343@gmail.com";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-5 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl card-elevated flex items-center justify-center active:opacity-80"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black tracking-tight">Política de Privacidad</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-6 leading-relaxed text-sm text-muted-foreground pb-16">
        <p className="text-xs">Última actualización: {UPDATED}</p>

        <p>
          En <strong className="text-foreground">Elevate</strong> cuidamos tu información. Esta política
          explica qué datos recopilamos, para qué los usamos y qué derechos tenés. Al usar la app aceptás
          lo aquí descrito.
        </p>

        <Section title="1. Qué datos recopilamos">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Cuenta:</strong> email y nombre.</li>
            <li><strong className="text-foreground">Datos de entrenamiento:</strong> rutinas, series, pesos, repeticiones e historial de entrenos.</li>
            <li><strong className="text-foreground">Datos corporales y de progreso:</strong> mediciones (peso, medidas) y fotos de progreso que subís voluntariamente.</li>
            <li><strong className="text-foreground">Nutrición y bienestar:</strong> registro de comidas, agua, sueño, energía y notas.</li>
            <li><strong className="text-foreground">Comunicación:</strong> mensajes que intercambiás con tu coach.</li>
            <li><strong className="text-foreground">Cuestionario de inicio:</strong> objetivo, experiencia, lesiones, equipamiento y preferencias.</li>
          </ul>
        </Section>

        <Section title="2. Para qué los usamos">
          <p>
            Usamos tus datos únicamente para <strong className="text-foreground">prestar el servicio</strong>: que tu
            coach pueda programarte los entrenamientos y la nutrición, hacer seguimiento de tu progreso y comunicarse
            con vos. No usamos tus datos con fines publicitarios ni los vendemos a terceros.
          </p>
        </Section>

        <Section title="3. Con quién se comparten">
          <p>
            Tu información es visible para <strong className="text-foreground">tu coach</strong> (el profesional que te
            asignó el plan). Para funcionar, la app se apoya en <strong className="text-foreground">Supabase</strong>
            {" "}(base de datos y almacenamiento seguro). No compartimos tus datos con otras terceras partes salvo
            obligación legal.
          </p>
        </Section>

        <Section title="4. Almacenamiento y seguridad">
          <p>
            Los datos se guardan en servidores de Supabase, cifrados en tránsito (HTTPS). El acceso está restringido por
            reglas de seguridad a nivel de base de datos: cada persona solo puede ver sus propios datos y los de su
            relación coach–alumno. Las fotos de progreso se guardan en un almacenamiento privado.
          </p>
        </Section>

        <Section title="5. Tus derechos">
          <p>
            Podés acceder y corregir tu información desde la app. También podés{" "}
            <strong className="text-foreground">eliminar tu cuenta y todos tus datos de forma permanente</strong> en
            cualquier momento desde <em>Perfil → Ajustes → Eliminar mi cuenta</em>. La eliminación es inmediata e
            irreversible.
          </p>
        </Section>

        <Section title="6. Menores">
          <p>La app no está dirigida a menores de 16 años sin la supervisión de un adulto responsable.</p>
        </Section>

        <Section title="7. Retención">
          <p>Conservamos tus datos mientras tengas una cuenta activa. Si la eliminás, se borran de forma permanente.</p>
        </Section>

        <Section title="8. Cambios">
          <p>Podemos actualizar esta política. Si hay cambios importantes, te lo notificaremos dentro de la app.</p>
        </Section>

        <Section title="9. Contacto">
          <p>
            Ante cualquier consulta sobre tus datos, escribinos a{" "}
            <a href={`mailto:${CONTACT}`} className="text-primary underline">{CONTACT}</a>.
          </p>
        </Section>
      </main>
    </div>
  );
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="accent-bar" />
        <h2 className="text-sm font-black text-foreground tracking-tight">{title}</h2>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export default Privacy;
