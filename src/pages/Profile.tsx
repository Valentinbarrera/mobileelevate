import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileSettings from "@/components/profile/ProfileSettings";
import BottomNav from "@/components/home/BottomNav";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useAuthContext } from "@/contexts/AuthContext";

const Profile = () => {
  const navigate = useNavigate();
  const { student, loading } = useAuthContext();

  const userData = {
    name: student?.full_name || "Atleta",
    memberType: "ELEVATE ALUMNO",
    memberSince: student?.created_at
      ? `Alumno desde ${new Date(student.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`
      : "Bienvenido",
    avatar: student?.avatar_url || null,
    isPro: true,
  };

  return (
    <motion.div
      className="min-h-screen bg-background pb-28"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeUp}>
        <ProfileHeader onBack={() => navigate(-1)} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <ProfileAvatar
          name={userData.name}
          memberType={userData.memberType}
          memberSince={userData.memberSince}
          avatar={userData.avatar}
          isPro={userData.isPro}
        />
      </motion.div>

      <motion.div variants={fadeUp}>
        <ProfileSettings />
      </motion.div>

      <BottomNav />
    </motion.div>
  );
};

export default Profile;
