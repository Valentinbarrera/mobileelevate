/**
 * Types for the Achievements feature
 */

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";
export type AchievementStatus = "locked" | "unlocked" | "claimed";
export type AchievementCategory = "all" | "workouts" | "consistency" | "progress" | "social";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  status: AchievementStatus;
  xpReward: number;
  progress?: number;
  maxProgress?: number;
  unlockedAt?: string;
  category?: AchievementCategory;
}
