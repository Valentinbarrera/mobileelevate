import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Target, Dumbbell, Calendar, Mail } from "lucide-react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileSettings from "@/components/profile/ProfileSettings";
import AppShell from "@/components/layout/AppShell";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useAuthContext } from "@/contexts/AuthContext";
import { useIsDesktop } from "@/hooks/use-media-query";

const Profile = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { student, user } = useAuthContext();

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
      <motion.div
        className="min-h-screen bg-background pb-28 lg:pb-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeUp}>
          <ProfileHeader onBack={() => navigate(-1)} />
        </motion.div>

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
              <div className="max-w-5xl mx-auto px-8 grid grid-cols-12 gap-8 items-start">
                <div className="col-span-5 space-y-6">
                  {avatar}
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
