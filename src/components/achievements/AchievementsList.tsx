import type { Achievement, AchievementStatus, AchievementRarity } from "@/types/achievement";
import AchievementCard from "./AchievementCard";

interface AchievementsListProps {
  achievements: Achievement[];
}

const AchievementsList = ({ achievements }: AchievementsListProps) => {
  // Sort: unlocked first, then by rarity
  const sortedAchievements = [...achievements].sort((a, b) => {
    const statusOrder: Record<AchievementStatus, number> = { unlocked: 0, claimed: 1, locked: 2 };
    const rarityOrder: Record<AchievementRarity, number> = { legendary: 0, epic: 1, rare: 2, common: 3 };

    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  return (
    <div className="px-5 pb-8">
      <div className="grid grid-cols-2 gap-3">
        {sortedAchievements.map((achievement, index) => (
          <AchievementCard 
            key={achievement.id} 
            achievement={achievement}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default AchievementsList;
