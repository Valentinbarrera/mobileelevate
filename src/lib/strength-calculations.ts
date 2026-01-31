/**
 * Utility functions for strength training calculations
 */

/**
 * Calculate estimated 1RM using the Brzycki formula
 * 1RM = weight × (36 / (37 - reps))
 * More accurate for reps under 10
 */
export function calculateBrzycki1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps > 12) {
    // Use Epley formula for higher reps (more accurate)
    return calculateEpley1RM(weight, reps);
  }
  return Math.round(weight * (36 / (37 - reps)));
}

/**
 * Calculate estimated 1RM using the Epley formula
 * 1RM = weight × (1 + reps/30)
 * Better for higher rep ranges
 */
export function calculateEpley1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

/**
 * Get the best 1RM estimate using the most appropriate formula
 */
export function estimatedOneRepMax(weight: number, reps: number): number {
  if (reps <= 10) {
    return calculateBrzycki1RM(weight, reps);
  }
  return calculateEpley1RM(weight, reps);
}

/**
 * Calculate percentage of 1RM
 */
export function percentageOf1RM(weight: number, oneRepMax: number): number {
  if (oneRepMax <= 0) return 0;
  return Math.round((weight / oneRepMax) * 100);
}

/**
 * Get recommended weight for a target rep range
 * Based on percentage of 1RM
 */
export function recommendedWeight(oneRepMax: number, targetReps: number): number {
  if (oneRepMax <= 0) return 0;
  
  // Rep-percentage mapping (approximate)
  const repPercentages: Record<number, number> = {
    1: 100,
    2: 95,
    3: 93,
    4: 90,
    5: 87,
    6: 85,
    7: 83,
    8: 80,
    9: 77,
    10: 75,
    11: 73,
    12: 70,
    15: 65,
    20: 60,
  };
  
  const percentage = repPercentages[targetReps] || (100 - targetReps * 2.5);
  return Math.round((oneRepMax * percentage) / 100 / 2.5) * 2.5; // Round to nearest 2.5kg
}

/**
 * Calculate total volume (weight × reps × sets)
 */
export function calculateVolume(weight: number, reps: number, sets: number = 1): number {
  return weight * reps * sets;
}

/**
 * Format weight display
 */
export function formatWeight(weight: number): string {
  if (weight % 1 === 0) {
    return weight.toString();
  }
  return weight.toFixed(1);
}
