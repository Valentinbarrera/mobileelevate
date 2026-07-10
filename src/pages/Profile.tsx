import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Target, Dumbbell, Calendar, Mail, ClipboardList, ChevronRight, Check, UserCircle } from "lucide-react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileSettings from "@/components/profile/ProfileSettings";
import AppShell from "@/components/layout/AppShell";
import PageHeader from "@/components/layout/PageHeader";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsDesktop } from "@/hooks/use-media-query";
import { isOnboardingComplete } from "@/lib/onboarding";

const Profile = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { student, user, isAdminMode } = useAuthContext();
  const sid = student?.id || (isAdminMode ? "admin" : "anon");
  const intakeDone = isOnboardingComplete(sid);

  const userData = {
    name: student?.full_name || user?.email?.split('@')[0] || "Atleta",
    memberType: student ? "ELEVATE ALUMNO" : "ELEVATE FREE",
    memberSince: student?.created_at
      ? `Alumno desde ${new Date(student.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`
      : "Bienvenido",
    avatar: null,
  };

  const infoItems = [
    { icon: Mail, label: "Email", value: student?.email || user?.email },
    { icon: Target, label: "Objetivo", value: student?.goal },
    { icon: Dumbbell, label: "Nivel", value: student?.level },
    { icon: Calendar, label: "Edad", value: student?.age ? `${student.age} años` : null },
  ].filter(item => item.value);

  return (
    <AppShell>
      {/* Perfil es pestaña raíz del bottom-nav: sin botón atrás y sin ⚙️ decorativo.
          La safe-area de iOS la resuelve PageHeader. */}
      <PageHeader
        eyebrow={
          <>
            <UserCircle className="w-3.5 h-3.5" />
            Cuenta
          </>
        }
        title="Perfil"
      />

      <motion.div
        className="min-h-screen bg-background pb-nav lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {(() => {
          const avatar = (
            <motion.div variants={fadeUp}>
              <ProfileAvatar
                name={userData.name}
                memberType={userData.memberType}
                memberSince={userData.memberSince}
                avatar={userData.avatar}
              />
            </motion.div>
          );

          const intakeCard = (
            <motion.div variants={fadeUp} className="px-5 lg:px-0 mb-6 lg:mb-0">
              <button
                onClick={() => navigate("/onboarding")}
                className="w-full text-left rounded-2xl card-hero p-4 flex items-center gap-3.5 active:scale-[0.99] transition-transform"
              >
                <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-foreground">Mi perfil de entrenamiento</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {intakeDone ? "Cuestionario completo · tocá para editar" : "Completá el cuestionario para tu coach"}
                  </p>
                </div>
                {intakeDone ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 shrink-0">
                    <Check className="w-4 h-4" /> Listo
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2 py-1 rounded-md bg-primary/10 border border-primary/20 shrink-0">
                    Pendiente
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </button>
              <button
                onClick={() => navigate("/cuestionarios")}
                className="mt-2 text-xs font-bold text-primary px-1 active:opacity-70"
              >
                Ver todos los cuestionarios →
              </button>
            </motion.div>
          );

          const infoCards = infoItems.length > 0 && (
            <motion.div variants={fadeUp} className="px-5 lg:px-0 mb-6 lg:mb-0">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-3">
                {infoItems.map(item => (
                  <div key={item.label} className="card-elevated rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className="w-4 h-4 text-primary" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          );

          const settings = (
            <motion.div variants={fadeUp}>
              <ProfileSettings />
            </motion.div>
          );

          // Desktop: avatar + datos a la izquierda, ajustes a la derecha.
          if (isDesktop) {
            return (
              <div className="max-w-5xl mx-auto px-8 pt-6 grid grid-cols-12 gap-8 items-start">
                <div className="col-span-5 space-y-6">
                  {avatar}
                  {intakeCard}
                  {infoCards}
                </div>
                <div className="col-span-7">{settings}</div>
              </div>
            );
          }

          // Mobile: columna única (sin cambios).
          return (
            <div className="max-w-2xl mx-auto">
              {avatar}
              {intakeCard}
              {infoCards}
              {settings}
            </div>
          );
        })()}
      </motion.div>
    </AppShell>
  );
};

export default Profile;
