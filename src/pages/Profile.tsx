import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileMembership from "@/components/profile/ProfileMembership";
import ProfileSettings from "@/components/profile/ProfileSettings";
import BottomNav from "@/components/home/BottomNav";
import { staggerContainer, fadeUp } from "@/lib/animations";

const Profile = () => {
  const navigate = useNavigate();

  const userData = {
    name: "Juan Pérez",
    memberType: "ELEVATE PRO MEMBER",
    memberSince: "Socio desde Enero 2024",
    avatar: "👨‍💼",
    isPro: true,
  };

  const stats = {
    totalXp: 12450,
    sessions: 48,
    medals: 12,
  };

  const membership = {
    plan: "ELEVATE PRO",
    nextRenewal: "12 Mar, 2025",
  };

  return (
    <motion.div 
      className="min-h-screen bg-background pb-28"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <ProfileHeader onBack={() => navigate(-1)} />
      </motion.div>

      {/* Avatar Section */}
      <motion.div variants={fadeUp}>
        <ProfileAvatar 
          name={userData.name}
          memberType={userData.memberType}
          memberSince={userData.memberSince}
          avatar={userData.avatar}
          isPro={userData.isPro}
        />
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp}>
        <ProfileStats 
          totalXp={stats.totalXp}
          sessions={stats.sessions}
          medals={stats.medals}
        />
      </motion.div>

      {/* Membership Card */}
      <motion.div variants={fadeUp}>
        <ProfileMembership 
          plan={membership.plan}
          nextRenewal={membership.nextRenewal}
          isPro={userData.isPro}
        />
      </motion.div>

      {/* Settings List */}
      <motion.div variants={fadeUp}>
        <ProfileSettings />
      </motion.div>

      {/* Bottom Navigation */}
      <BottomNav />
    </motion.div>
  );
};

export default Profile;
