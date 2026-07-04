import { ArrowLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CONTACT = "appelevate343@gmail.com";

const Support = () => {
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
          <h1 className="text-lg font-black tracking-tight">Soporte</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-6 leading-relaxed text-sm text-muted-foreground pb-16">
        <p>
          <strong className="text-foreground">Elevate</strong> es la app con la que entrenás siguiendo las
          rutinas y el plan de nutrición que arma tu entrenador. Acá tenés cómo contactarnos y las
          preguntas más comunes.
        </p>

        <Section title="Contacto">
          <p>
            ¿Tenés un problema, una duda o una sugerencia? Escribinos y te respondemos:
          </p>
          <a
            href={`mailto:${CONTACT}`}
            className="inline-flex items-center gap-2 rounded-xl card-elevated px-4 py-3 text-foreground font-semibold active:opacity-80"
          >
            <Mail className="w-4 h-4 text-primary" />
            {CONTACT}
          </a>
          <p className="text-xs">Respondemos dentro de las 48 horas hábiles.</p>
        </Section>

        <Section title="¿Cómo empiezo a usar Elevate?">
          <p>
            Tu entrenador te da de alta con tu email. Iniciás sesión con ese email y tu contraseña, y ya
            vas a ver las rutinas y el plan que te asignó. Si no tenés cuenta, pedile a tu coach que te
            registre.
          </p>
        </Section>

        <Section title="No puedo iniciar sesión">
          <p>
            Verificá que estés usando el mismo email con el que te registró tu coach. Si olvidaste la
            contraseña, usá la opción <em>“¿Olvidaste tu contraseña?”</em> en la pantalla de inicio de
            sesión para recibir un enlace de recuperación por email.
          </p>
        </Section>

        <Section title="¿Cómo registro un entrenamiento?">
          <p>
            Entrá a la rutina del día, tocá <em>Empezar</em> y cargá el peso y las repeticiones de cada
            serie. Podés editar o deshacer una serie tocándola. Al terminar se guarda automáticamente en
            tu historial y tu coach lo ve.
          </p>
        </Section>

        <Section title="¿Cómo elimino mi cuenta?">
          <p>
            Desde la app: <em>Perfil → Ajustes → Eliminar mi cuenta</em>. La eliminación borra todos tus
            datos de forma permanente e inmediata.
          </p>
        </Section>

        <Section title="Privacidad">
          <p>
            Podés leer cómo tratamos tus datos en nuestra{" "}
            <a href="/privacidad" className="text-primary underline">Política de Privacidad</a>.
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

export default Support;
