import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Target, Dumbbell, Calendar, Mail } from "lucide-react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileSettings from "@/components/profile/ProfileSettings";
import AppShell from "@/components/layout/AppShell";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useAuthContext } from "@/contexts/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { student } = useAuthContext();

  const userData = {
    name: student?.full_name || "Atleta",
    memberType: "ELEVATE ALUMNO",
    memberSince: student?.created_at
      ? `Alumno desde ${new Date(student.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`
      : "Bienvenido",
    avatar: null,
  };

  const infoItems = [
    { icon: Mail, label: "Email", value: student?.email },
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

        <div className="max-w-2xl mx-auto">
          <motion.div variants={fadeUp}>
            <ProfileAvatar
              name={userData.name}
              memberType={userData.memberType}
              memberSince={userData.memberSince}
              avatar={userData.avatar}
            />
          </motion.div>

          {/* Student info cards */}
          {infoItems.length > 0 && (
            <motion.div variants={fadeUp} className="px-5 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {infoItems.map(item => (
                  <div key={item.label} className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <item.icon className="w-4 h-4 text-primary" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <ProfileSettings />
          </motion.div>
        </div>
      </motion.div>
    </AppShell>
  );
};

export default Profile;
