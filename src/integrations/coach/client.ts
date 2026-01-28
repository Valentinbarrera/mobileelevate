/**
 * Cliente Supabase para conectar con el proyecto Elevate Coach
 * Este cliente es independiente del cliente de Lovable Cloud
 */
import { createClient } from '@supabase/supabase-js';
import type { CoachDatabase } from './types';

const COACH_SUPABASE_URL = 'https://fumuvimyitsnuweqrgap.supabase.co';
const COACH_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1bXV2aW15aXRzbnV3ZXFyZ2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDA0MDgsImV4cCI6MjA3OTMxNjQwOH0.ggqsqhqE7dG12vNZ809tqI6GEGt_SwETnmrYb2AOrBs';

export const coachSupabase = createClient<CoachDatabase>(
  COACH_SUPABASE_URL,
  COACH_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'coach-auth-token', // Separate storage key from main app
    }
  }
);
