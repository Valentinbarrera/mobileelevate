import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileMembership from "@/components/profile/ProfileMembership";
import ProfileSettings from "@/components/profile/ProfileSettings";
import BottomNav from "@/components/home/BottomNav";

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
      className="min-h-screen bg-background pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <ProfileHeader onBack={() => navigate(-1)} />

      {/* Avatar Section */}
      <ProfileAvatar 
        name={userData.name}
        memberType={userData.memberType}
        memberSince={userData.memberSince}
        avatar={userData.avatar}
        isPro={userData.isPro}
      />

      {/* Stats */}
      <ProfileStats 
        totalXp={stats.totalXp}
        sessions={stats.sessions}
        medals={stats.medals}
      />

      {/* Membership Card */}
      <ProfileMembership 
        plan={membership.plan}
        nextRenewal={membership.nextRenewal}
        isPro={userData.isPro}
      />

      {/* Settings List */}
      <ProfileSettings />

      {/* Bottom Navigation */}
      <BottomNav />
    </motion.div>
  );
};

export default Profile;
