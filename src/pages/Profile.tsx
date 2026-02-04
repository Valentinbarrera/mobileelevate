import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileMembership from "@/components/profile/ProfileMembership";
import ProfileSettings from "@/components/profile/ProfileSettings";
import BottomNav from "@/components/home/BottomNav";
import PageLoading from "@/components/ui/page-loading";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { useCoachAuthContext } from "@/contexts/CoachAuthContext";
import { useCoachWeeklyProgress } from "@/hooks/useCoachWorkoutSession";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const navigate = useNavigate();
  const { student, isAuthenticated } = useCoachAuthContext();
  const { user } = useAuth();
  const { getWeeklyProgress } = useCoachWeeklyProgress();
  
  const [stats, setStats] = useState({
    totalXp: 0,
    sessions: 0,
    medals: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch user stats from local DB
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get total completed sessions
        const { data: sessions } = await supabase
          .from("workout_sessions")
          .select("id")
          .eq("user_id", user.id)
          .not("completed_at", "is", null);

        // Get total PRs
        const { data: prs } = await supabase
          .from("personal_records")
          .select("id")
          .eq("user_id", user.id);

        // Get total volume for XP calculation
        const { data: sets } = await supabase
          .from("exercise_sets")
          .select("weight, reps, session_id")
          .limit(1000);

        const totalVolume = sets?.reduce((acc, s) => acc + (s.weight * s.reps), 0) || 0;
        const sessionCount = sessions?.length || 0;
        const xp = Math.floor(totalVolume / 10) + (sessionCount * 100);

        setStats({
          totalXp: xp,
          sessions: sessionCount,
          medals: prs?.length || 0,
        });
      } catch (error) {
        console.error("Error fetching profile stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // Use Coach student data if available, otherwise fallback
  const userData = {
    name: student?.name || user?.email?.split('@')[0] || "Atleta",
    memberType: isAuthenticated ? "ELEVATE ALUMNO" : "ELEVATE MEMBER",
    memberSince: student?.created_at 
      ? `Alumno desde ${new Date(student.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`
      : "Bienvenido",
    avatar: student?.avatar_url || "💪",
    isPro: isAuthenticated,
  };

  const membership = {
    plan: isAuthenticated ? "ELEVATE COACH" : "PLAN BÁSICO",
    nextRenewal: "Activo",
  };

  if (loading) {
    return <PageLoading message="Cargando perfil..." />;
  }

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
