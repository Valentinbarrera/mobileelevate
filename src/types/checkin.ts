// Types for weekly check-in system

export type EnergyLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
export type AdherenceLevel = 'poor' | 'fair' | 'good' | 'excellent';

export interface WeeklyCheckin {
  id: string;
  user_id: string;
  week_number: number;
  year: number;
  
  // Physical metrics
  weight: number | null;
  body_fat_percentage: number | null;
  
  // Progress photos
  front_photo_url: string | null;
  side_photo_url: string | null;
  back_photo_url: string | null;
  
  // Subjective state
  energy_level: EnergyLevel;
  sleep_quality: number | null;
  stress_level: number | null;
  soreness_level: number | null;
  
  // Adherence
  training_adherence: AdherenceLevel;
  nutrition_adherence: AdherenceLevel;
  workouts_completed: number;
  workouts_planned: number;
  
  // Notes
  wins: string | null;
  challenges: string | null;
  notes: string | null;
  
  // Metadata
  submitted_at: string;
  created_at: string;
  
  // Relations
  coach_feedback?: CoachFeedback[];
}

export interface CoachFeedback {
  id: string;
  checkin_id: string;
  coach_id: string;
  message: string;
  training_adjustment: string | null;
  nutrition_adjustment: string | null;
  progress_rating: number | null;
  badges: string[] | null;
  created_at: string;
  updated_at: string;
}

// Form data for creating/updating check-ins
export interface CheckinFormData {
  weight?: number;
  body_fat_percentage?: number;
  energy_level: EnergyLevel;
  sleep_quality: number;
  stress_level: number;
  soreness_level: number;
  training_adherence: AdherenceLevel;
  nutrition_adherence: AdherenceLevel;
  workouts_completed: number;
  workouts_planned: number;
  wins?: string;
  challenges?: string;
  notes?: string;
}

// Labels for UI
export const energyLabels: Record<EnergyLevel, string> = {
  very_low: 'Muy baja',
  low: 'Baja',
  moderate: 'Normal',
  high: 'Alta',
  very_high: 'Muy alta'
};

export const energyEmojis: Record<EnergyLevel, string> = {
  very_low: '😴',
  low: '😔',
  moderate: '😐',
  high: '😊',
  very_high: '🔥'
};

export const adherenceLabels: Record<AdherenceLevel, string> = {
  poor: 'Pobre',
  fair: 'Regular',
  good: 'Buena',
  excellent: 'Excelente'
};

export const adherenceColors: Record<AdherenceLevel, string> = {
  poor: 'text-red-500 bg-red-500/10',
  fair: 'text-orange-500 bg-orange-500/10',
  good: 'text-blue-500 bg-blue-500/10',
  excellent: 'text-emerald-500 bg-emerald-500/10'
};
