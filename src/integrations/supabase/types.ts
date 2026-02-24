export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      anthropometry: {
        Row: {
          arm_cm: number | null
          body_fat: number | null
          chest_cm: number | null
          created_at: string
          date: string
          hips_cm: number | null
          id: string
          notes: string | null
          student_id: string
          thigh_cm: number | null
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          body_fat?: number | null
          chest_cm?: number | null
          created_at?: string
          date?: string
          hips_cm?: number | null
          id?: string
          notes?: string | null
          student_id: string
          thigh_cm?: number | null
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          body_fat?: number | null
          chest_cm?: number | null
          created_at?: string
          date?: string
          hips_cm?: number | null
          id?: string
          notes?: string | null
          student_id?: string
          thigh_cm?: number | null
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anthropometry_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_wellness: {
        Row: {
          created_at: string
          date: string
          fatigue_level: number | null
          id: string
          motivation_level: number | null
          muscle_soreness: number | null
          notes: string | null
          readiness_score: number | null
          sleep_hours: number | null
          sleep_quality: number | null
          stress_level: number | null
          student_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          fatigue_level?: number | null
          id?: string
          motivation_level?: number | null
          muscle_soreness?: number | null
          notes?: string | null
          readiness_score?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          student_id: string
        }
        Update: {
          created_at?: string
          date?: string
          fatigue_level?: number | null
          id?: string
          motivation_level?: number | null
          muscle_soreness?: number | null
          notes?: string | null
          readiness_score?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          stress_level?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "athlete_wellness_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          coach_id: string
          color: string | null
          created_at: string
          date: string
          description: string | null
          end_time: string | null
          event_type: string
          id: string
          notes: string | null
          planned_session_id: string | null
          priority: string | null
          routine_id: string | null
          start_time: string | null
          status: string
          student_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          all_day?: boolean | null
          coach_id: string
          color?: string | null
          created_at?: string
          date: string
          description?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          notes?: string | null
          planned_session_id?: string | null
          priority?: string | null
          routine_id?: string | null
          start_time?: string | null
          status?: string
          student_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          all_day?: boolean | null
          coach_id?: string
          color?: string | null
          created_at?: string
          date?: string
          description?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          notes?: string | null
          planned_session_id?: string | null
          priority?: string | null
          routine_id?: string | null
          start_time?: string | null
          status?: string
          student_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_planned_session_id_fkey"
            columns: ["planned_session_id"]
            isOneToOne: false
            referencedRelation: "planned_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      client_subscriptions: {
        Row: {
          coach_id: string
          created_at: string
          custom_price: number | null
          end_date: string | null
          id: string
          next_payment_date: string | null
          notes: string | null
          plan_id: string | null
          start_date: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          custom_price?: number | null
          end_date?: string | null
          id?: string
          next_payment_date?: string | null
          notes?: string | null
          plan_id?: string | null
          start_date?: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          custom_price?: number | null
          end_date?: string | null
          id?: string
          next_payment_date?: string | null
          notes?: string | null
          plan_id?: string | null
          start_date?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          coach_id: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          failed_payment_count: number | null
          grace_period_end: string | null
          grace_period_start: string | null
          id: string
          max_students: number | null
          mp_preapproval_id: string | null
          mp_subscription_id: string | null
          next_payment_date: string | null
          payment_failed_at: string | null
          plan_id: string
          plan_name: string
          price: number
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          coach_id: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          failed_payment_count?: number | null
          grace_period_end?: string | null
          grace_period_start?: string | null
          id?: string
          max_students?: number | null
          mp_preapproval_id?: string | null
          mp_subscription_id?: string | null
          next_payment_date?: string | null
          payment_failed_at?: string | null
          plan_id: string
          plan_name: string
          price: number
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          coach_id?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          failed_payment_count?: number | null
          grace_period_end?: string | null
          grace_period_start?: string | null
          id?: string
          max_students?: number | null
          mp_preapproval_id?: string | null
          mp_subscription_id?: string | null
          next_payment_date?: string | null
          payment_failed_at?: string | null
          plan_id?: string
          plan_name?: string
          price?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_subscriptions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: true
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      coaches: {
        Row: {
          business_name: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_admin: boolean
          onboarding_completed: boolean
          picture_url: string | null
          primary_goal: string | null
          specialty: string | null
          student_count_range: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_admin?: boolean
          onboarding_completed?: boolean
          picture_url?: string | null
          primary_goal?: string | null
          specialty?: string | null
          student_count_range?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_admin?: boolean
          onboarding_completed?: boolean
          picture_url?: string | null
          primary_goal?: string | null
          specialty?: string | null
          student_count_range?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      completed_exercises: {
        Row: {
          completed_session_id: string
          id: string
          notes: string | null
          reps: number
          rir: number | null
          routine_exercise_id: string
          series: number
          tonnage: number | null
          weight: number | null
        }
        Insert: {
          completed_session_id: string
          id?: string
          notes?: string | null
          reps: number
          rir?: number | null
          routine_exercise_id: string
          series: number
          tonnage?: number | null
          weight?: number | null
        }
        Update: {
          completed_session_id?: string
          id?: string
          notes?: string | null
          reps?: number
          rir?: number | null
          routine_exercise_id?: string
          series?: number
          tonnage?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "completed_exercises_completed_session_id_fkey"
            columns: ["completed_session_id"]
            isOneToOne: false
            referencedRelation: "completed_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_exercises_routine_exercise_id_fkey"
            columns: ["routine_exercise_id"]
            isOneToOne: false
            referencedRelation: "routine_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      completed_sessions: {
        Row: {
          created_at: string
          date: string
          energy_level: number | null
          id: string
          notes: string | null
          planned_session_id: string
          readiness_pre: number | null
          session_quality: string | null
          student_id: string
          total_rpe: number | null
          total_tonnage: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          energy_level?: number | null
          id?: string
          notes?: string | null
          planned_session_id: string
          readiness_pre?: number | null
          session_quality?: string | null
          student_id: string
          total_rpe?: number | null
          total_tonnage?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          energy_level?: number | null
          id?: string
          notes?: string | null
          planned_session_id?: string
          readiness_pre?: number | null
          session_quality?: string | null
          student_id?: string
          total_rpe?: number | null
          total_tonnage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "completed_sessions_planned_session_id_fkey"
            columns: ["planned_session_id"]
            isOneToOne: false
            referencedRelation: "planned_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "completed_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_nutrition_summary: {
        Row: {
          adherence_score: number | null
          calories_target: number | null
          carbs_target: number | null
          created_at: string
          date: string
          fats_target: number | null
          id: string
          meals_logged: number | null
          protein_target: number | null
          student_id: string
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_fiber: number | null
          total_protein: number | null
          updated_at: string
          water_ml: number | null
        }
        Insert: {
          adherence_score?: number | null
          calories_target?: number | null
          carbs_target?: number | null
          created_at?: string
          date: string
          fats_target?: number | null
          id?: string
          meals_logged?: number | null
          protein_target?: number | null
          student_id: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          updated_at?: string
          water_ml?: number | null
        }
        Update: {
          adherence_score?: number | null
          calories_target?: number | null
          carbs_target?: number | null
          created_at?: string
          date?: string
          fats_target?: number | null
          id?: string
          meals_logged?: number | null
          protein_target?: number | null
          student_id?: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_fiber?: number | null
          total_protein?: number | null
          updated_at?: string
          water_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_nutrition_summary_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_videos: {
        Row: {
          created_at: string | null
          duration_seconds: number | null
          exercise_id: string | null
          exercise_name: string
          id: string
          notes: string | null
          status: string | null
          storage_path: string
          student_id: string
          thumbnail_path: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds?: number | null
          exercise_id?: string | null
          exercise_name: string
          id?: string
          notes?: string | null
          status?: string | null
          storage_path: string
          student_id: string
          thumbnail_path?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number | null
          exercise_id?: string | null
          exercise_name?: string
          id?: string
          notes?: string | null
          status?: string | null
          storage_path?: string
          student_id?: string
          thumbnail_path?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_videos_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_videos_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string | null
          coach_id: string | null
          created_at: string
          description: string | null
          equipment: string | null
          id: string
          instructions: string[] | null
          is_system: boolean | null
          level: string | null
          muscle: string | null
          name: string
          secondary_muscles: string[] | null
          thumbnail_url: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category?: string | null
          coach_id?: string | null
          created_at?: string
          description?: string | null
          equipment?: string | null
          id?: string
          instructions?: string[] | null
          is_system?: boolean | null
          level?: string | null
          muscle?: string | null
          name: string
          secondary_muscles?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string | null
          coach_id?: string | null
          created_at?: string
          description?: string | null
          equipment?: string | null
          id?: string
          instructions?: string[] | null
          is_system?: boolean | null
          level?: string | null
          muscle?: string | null
          name?: string
          secondary_muscles?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          coach_id: string
          created_at: string
          expense_date: string
          expense_type: string
          id: string
          is_recurring: boolean
          name: string
          notes: string | null
        }
        Insert: {
          amount?: number
          category?: string | null
          coach_id: string
          created_at?: string
          expense_date?: string
          expense_type?: string
          id?: string
          is_recurring?: boolean
          name: string
          notes?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          coach_id?: string
          created_at?: string
          expense_date?: string
          expense_type?: string
          id?: string
          is_recurring?: boolean
          name?: string
          notes?: string | null
        }
        Relationships: []
      }
      financial_reminders: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean
          reminder_type: string
          student_id: string | null
          title: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          reminder_type: string
          student_id?: string | null
          title: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean
          reminder_type?: string
          student_id?: string | null
          title?: string
        }
        Relationships: []
      }
      food_log_items: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          custom_food_name: string | null
          fats: number
          fiber: number | null
          food_id: string | null
          food_log_id: string
          id: string
          protein: number
          quantity: number
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string
          custom_food_name?: string | null
          fats?: number
          fiber?: number | null
          food_id?: string | null
          food_log_id: string
          id?: string
          protein?: number
          quantity?: number
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          custom_food_name?: string | null
          fats?: number
          fiber?: number | null
          food_id?: string | null
          food_log_id?: string
          id?: string
          protein?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "food_log_items_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_log_items_food_log_id_fkey"
            columns: ["food_log_id"]
            isOneToOne: false
            referencedRelation: "food_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      food_logs: {
        Row: {
          created_at: string
          date: string
          energy_after: number | null
          hunger_level: number | null
          id: string
          meal_plan_id: string | null
          meal_type: string
          notes: string | null
          satiety_level: number | null
          student_id: string
          time_logged: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          energy_after?: number | null
          hunger_level?: number | null
          id?: string
          meal_plan_id?: string | null
          meal_type: string
          notes?: string | null
          satiety_level?: number | null
          student_id: string
          time_logged?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          energy_after?: number | null
          hunger_level?: number | null
          id?: string
          meal_plan_id?: string | null
          meal_type?: string
          notes?: string | null
          satiety_level?: number | null
          student_id?: string
          time_logged?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "food_logs_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "food_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          calories: number
          carbs: number
          category: string | null
          coach_id: string | null
          created_at: string
          fats: number
          fiber: number | null
          id: string
          is_public: boolean
          name: string
          protein: number
          serving_size: number
          serving_unit: string
        }
        Insert: {
          calories?: number
          carbs?: number
          category?: string | null
          coach_id?: string | null
          created_at?: string
          fats?: number
          fiber?: number | null
          id?: string
          is_public?: boolean
          name: string
          protein?: number
          serving_size?: number
          serving_unit?: string
        }
        Update: {
          calories?: number
          carbs?: number
          category?: string | null
          coach_id?: string | null
          created_at?: string
          fats?: number
          fiber?: number | null
          id?: string
          is_public?: boolean
          name?: string
          protein?: number
          serving_size?: number
          serving_unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "foods_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      hydration_logs: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          student_id: string
          water_ml: number
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          student_id: string
          water_ml?: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          student_id?: string
          water_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "hydration_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_foods: {
        Row: {
          created_at: string
          food_id: string
          id: string
          meal_id: string
          notes: string | null
          quantity: number
        }
        Insert: {
          created_at?: string
          food_id: string
          id?: string
          meal_id: string
          notes?: string | null
          quantity?: number
        }
        Update: {
          created_at?: string
          food_id?: string
          id?: string
          meal_id?: string
          notes?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_foods_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_foods_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_assignments: {
        Row: {
          created_at: string
          id: string
          meal_plan_id: string
          start_date: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_plan_id: string
          start_date: string
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_plan_id?: string
          start_date?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_assignments_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_plan_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_days: {
        Row: {
          created_at: string
          day_name: string
          day_number: number
          id: string
          meal_plan_id: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          day_name: string
          day_number: number
          id?: string
          meal_plan_id: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          day_name?: string
          day_number?: number
          id?: string
          meal_plan_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_plan_days_meal_plan_id_fkey"
            columns: ["meal_plan_id"]
            isOneToOne: false
            referencedRelation: "meal_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plans: {
        Row: {
          calories_target: number | null
          carbs_target: number | null
          coach_id: string
          created_at: string
          description: string | null
          fats_target: number | null
          id: string
          is_template: boolean
          name: string
          protein_target: number | null
          updated_at: string
        }
        Insert: {
          calories_target?: number | null
          carbs_target?: number | null
          coach_id: string
          created_at?: string
          description?: string | null
          fats_target?: number | null
          id?: string
          is_template?: boolean
          name: string
          protein_target?: number | null
          updated_at?: string
        }
        Update: {
          calories_target?: number | null
          carbs_target?: number | null
          coach_id?: string
          created_at?: string
          description?: string | null
          fats_target?: number | null
          id?: string
          is_template?: boolean
          name?: string
          protein_target?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string
          id: string
          meal_plan_day_id: string
          meal_type: string
          notes: string | null
          order_index: number
        }
        Insert: {
          created_at?: string
          id?: string
          meal_plan_day_id: string
          meal_type: string
          notes?: string | null
          order_index?: number
        }
        Update: {
          created_at?: string
          id?: string
          meal_plan_day_id?: string
          meal_type?: string
          notes?: string | null
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "meals_meal_plan_day_id_fkey"
            columns: ["meal_plan_day_id"]
            isOneToOne: false
            referencedRelation: "meal_plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          coach_id: string
          content: string
          created_at: string
          file_url: string | null
          id: string
          seen_at: string | null
          sender: string
          student_id: string
        }
        Insert: {
          coach_id: string
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          seen_at?: string | null
          sender: string
          student_id: string
        }
        Update: {
          coach_id?: string
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          seen_at?: string | null
          sender?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      mp_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          date_approved: string | null
          date_created: string | null
          external_reference: string | null
          id: string
          mp_payment_id: string | null
          mp_subscription_id: string | null
          payer_email: string | null
          payment_method_id: string | null
          payment_type_id: string | null
          raw_data: Json | null
          status: string
          status_detail: string | null
          subscription_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          date_approved?: string | null
          date_created?: string | null
          external_reference?: string | null
          id?: string
          mp_payment_id?: string | null
          mp_subscription_id?: string | null
          payer_email?: string | null
          payment_method_id?: string | null
          payment_type_id?: string | null
          raw_data?: Json | null
          status: string
          status_detail?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          date_approved?: string | null
          date_created?: string | null
          external_reference?: string | null
          id?: string
          mp_payment_id?: string | null
          mp_subscription_id?: string | null
          payer_email?: string | null
          payment_method_id?: string | null
          payment_type_id?: string | null
          raw_data?: Json | null
          status?: string
          status_detail?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mp_payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "mp_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      mp_subscription_plans: {
        Row: {
          amount: number
          coach_id: string
          created_at: string
          currency: string
          description: string | null
          features: string[] | null
          frequency: number
          frequency_type: string
          id: string
          is_active: boolean
          mp_plan_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          amount: number
          coach_id: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[] | null
          frequency?: number
          frequency_type?: string
          id?: string
          is_active?: boolean
          mp_plan_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          amount?: number
          coach_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[] | null
          frequency?: number
          frequency_type?: string
          id?: string
          is_active?: boolean
          mp_plan_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mp_subscription_plans_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      mp_subscriptions: {
        Row: {
          auto_recurring: boolean | null
          created_at: string
          external_reference: string | null
          id: string
          last_payment_amount: number | null
          last_payment_date: string | null
          mp_init_point: string | null
          mp_payer_id: string | null
          mp_subscription_id: string | null
          next_payment_date: string | null
          payer_email: string | null
          plan_id: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          auto_recurring?: boolean | null
          created_at?: string
          external_reference?: string | null
          id?: string
          last_payment_amount?: number | null
          last_payment_date?: string | null
          mp_init_point?: string | null
          mp_payer_id?: string | null
          mp_subscription_id?: string | null
          next_payment_date?: string | null
          payer_email?: string | null
          plan_id?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          auto_recurring?: boolean | null
          created_at?: string
          external_reference?: string | null
          id?: string
          last_payment_amount?: number | null
          last_payment_date?: string | null
          mp_init_point?: string | null
          mp_payer_id?: string | null
          mp_subscription_id?: string | null
          next_payment_date?: string | null
          payer_email?: string | null
          plan_id?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mp_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "mp_subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mp_subscriptions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      mp_webhook_logs: {
        Row: {
          created_at: string
          data_id: string | null
          error_message: string | null
          event_id: string | null
          event_type: string
          id: string
          processed: boolean | null
          raw_payload: Json | null
        }
        Insert: {
          created_at?: string
          data_id?: string | null
          error_message?: string | null
          event_id?: string | null
          event_type: string
          id?: string
          processed?: boolean | null
          raw_payload?: Json | null
        }
        Update: {
          created_at?: string
          data_id?: string | null
          error_message?: string | null
          event_id?: string | null
          event_type?: string
          id?: string
          processed?: boolean | null
          raw_payload?: Json | null
        }
        Relationships: []
      }
      nutrition_alerts: {
        Row: {
          alert_type: string
          coach_id: string
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          message: string
          resolved_at: string | null
          severity: string | null
          student_id: string
        }
        Insert: {
          alert_type: string
          coach_id: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message: string
          resolved_at?: string | null
          severity?: string | null
          student_id: string
        }
        Update: {
          alert_type?: string
          coach_id?: string
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string
          resolved_at?: string | null
          severity?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_alerts_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_alerts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          coach_id: string
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          status: string
          student_id: string
          subscription_id: string | null
        }
        Insert: {
          amount?: number
          coach_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          status?: string
          student_id: string
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          coach_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          status?: string
          student_id?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "client_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          created_at: string
          id: string
          metric_type: string
          period_end: string
          period_start: string
          student_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metric_type: string
          period_end: string
          period_start: string
          student_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          metric_type?: string
          period_end?: string
          period_start?: string
          student_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_comments: {
        Row: {
          coach_id: string
          comment: string
          created_at: string | null
          id: string
          photo_id: string
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          comment: string
          created_at?: string | null
          id?: string
          photo_id: string
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          photo_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_comments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_comments_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "progress_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      planned_sessions: {
        Row: {
          assignment_id: string
          created_at: string
          date: string
          id: string
          routine_day_id: string
          student_id: string
        }
        Insert: {
          assignment_id: string
          created_at?: string
          date: string
          id?: string
          routine_day_id: string
          student_id: string
        }
        Update: {
          assignment_id?: string
          created_at?: string
          date?: string
          id?: string
          routine_day_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "planned_sessions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "routine_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_sessions_routine_day_id_fkey"
            columns: ["routine_day_id"]
            isOneToOne: false
            referencedRelation: "routine_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "planned_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          duration_months: number
          duration_type: string
          features: string[] | null
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          duration_months?: number
          duration_type?: string
          features?: string[] | null
          id?: string
          is_active?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          duration_months?: number
          duration_type?: string
          features?: string[] | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          anthropometry_id: string
          created_at: string
          id: string
          photo_type: string
          storage_path: string
          student_id: string
        }
        Insert: {
          anthropometry_id: string
          created_at?: string
          id?: string
          photo_type: string
          storage_path: string
          student_id: string
        }
        Update: {
          anthropometry_id?: string
          created_at?: string
          id?: string
          photo_type?: string
          storage_path?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_anthropometry_id_fkey"
            columns: ["anthropometry_id"]
            isOneToOne: false
            referencedRelation: "anthropometry"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_assignments: {
        Row: {
          created_at: string
          id: string
          routine_id: string
          start_date: string
          status: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          routine_id: string
          start_date: string
          status?: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          routine_id?: string
          start_date?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_assignments_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_assignments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_days: {
        Row: {
          created_at: string
          day_name: string
          id: string
          notes: string | null
          order_index: number
          routine_id: string
        }
        Insert: {
          created_at?: string
          day_name: string
          id?: string
          notes?: string | null
          order_index: number
          routine_id: string
        }
        Update: {
          created_at?: string
          day_name?: string
          id?: string
          notes?: string | null
          order_index?: number
          routine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_days_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_exercises: {
        Row: {
          created_at: string
          exercise_id: string | null
          id: string
          intensity_modifier: string | null
          name: string
          notes: string | null
          order_index: number
          reps: string | null
          rest: number | null
          rir: number | null
          routine_day_id: string
          series: number | null
          tempo: string | null
          training_method: string | null
          type: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string
          exercise_id?: string | null
          id?: string
          intensity_modifier?: string | null
          name: string
          notes?: string | null
          order_index: number
          reps?: string | null
          rest?: number | null
          rir?: number | null
          routine_day_id: string
          series?: number | null
          tempo?: string | null
          training_method?: string | null
          type?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string
          exercise_id?: string | null
          id?: string
          intensity_modifier?: string | null
          name?: string
          notes?: string | null
          order_index?: number
          reps?: string | null
          rest?: number | null
          rir?: number | null
          routine_day_id?: string
          series?: number | null
          tempo?: string | null
          training_method?: string | null
          type?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routine_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routine_exercises_routine_day_id_fkey"
            columns: ["routine_day_id"]
            isOneToOne: false
            referencedRelation: "routine_days"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          coach_id: string
          created_at: string
          description: string | null
          id: string
          is_template: boolean | null
          level: string | null
          name: string
          updated_at: string
          weeks: number | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_template?: boolean | null
          level?: string | null
          name: string
          updated_at?: string
          weeks?: number | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_template?: boolean | null
          level?: string | null
          name?: string
          updated_at?: string
          weeks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "routines_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_payments: {
        Row: {
          amount: number
          coach_id: string | null
          created_at: string | null
          currency: string | null
          id: string
          plan_id: string | null
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          amount: number
          coach_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          plan_id?: string | null
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          amount?: number
          coach_id?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          plan_id?: string | null
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_payments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_id: string | null
          event_type: string
          id: string
          processed: boolean | null
          raw_payload: Json | null
          stripe_subscription_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          event_type: string
          id?: string
          processed?: boolean | null
          raw_payload?: Json | null
          stripe_subscription_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_id?: string | null
          event_type?: string
          id?: string
          processed?: boolean | null
          raw_payload?: Json | null
          stripe_subscription_id?: string | null
        }
        Relationships: []
      }
      student_nutrition_goals: {
        Row: {
          calories_target: number | null
          carbs_target: number | null
          fats_target: number | null
          id: string
          protein_target: number | null
          restrictions: string | null
          student_id: string
          updated_at: string
          water_target: number | null
        }
        Insert: {
          calories_target?: number | null
          carbs_target?: number | null
          fats_target?: number | null
          id?: string
          protein_target?: number | null
          restrictions?: string | null
          student_id: string
          updated_at?: string
          water_target?: number | null
        }
        Update: {
          calories_target?: number | null
          carbs_target?: number | null
          fats_target?: number | null
          id?: string
          protein_target?: number | null
          restrictions?: string | null
          student_id?: string
          updated_at?: string
          water_target?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_nutrition_goals_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          age: number | null
          coach_id: string
          created_at: string
          email: string
          full_name: string
          goal: string | null
          height_cm: number | null
          id: string
          injuries: string | null
          level: string | null
          status: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age?: number | null
          coach_id: string
          created_at?: string
          email: string
          full_name: string
          goal?: string | null
          height_cm?: number | null
          id?: string
          injuries?: string | null
          level?: string | null
          status?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: number | null
          coach_id?: string
          created_at?: string
          email?: string
          full_name?: string
          goal?: string | null
          height_cm?: number | null
          id?: string
          injuries?: string | null
          level?: string | null
          status?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "students_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      supplement_recommendations: {
        Row: {
          coach_id: string
          created_at: string
          dosage: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          priority: string | null
          reason: string | null
          start_date: string | null
          student_id: string
          timing: string | null
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          priority?: string | null
          reason?: string | null
          start_date?: string | null
          student_id: string
          timing?: string | null
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          dosage?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          priority?: string | null
          reason?: string | null
          start_date?: string | null
          student_id?: string
          timing?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplement_recommendations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplement_recommendations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      trials: {
        Row: {
          admin_notes: string | null
          coach_id: string
          created_at: string
          created_by_admin_id: string | null
          days_duration: number
          end_date: string
          id: string
          is_active: boolean
          notes: string | null
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          coach_id: string
          created_at?: string
          created_by_admin_id?: string | null
          days_duration?: number
          end_date: string
          id?: string
          is_active?: boolean
          notes?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          coach_id?: string
          created_at?: string
          created_by_admin_id?: string | null
          days_duration?: number
          end_date?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trials_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trials_created_by_admin_id_fkey"
            columns: ["created_by_admin_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      video_corrections: {
        Row: {
          coach_id: string
          comment: string
          correction_type: string | null
          created_at: string | null
          id: string
          is_resolved: boolean | null
          timestamp_seconds: number | null
          updated_at: string | null
          video_id: string
          voice_note_path: string | null
        }
        Insert: {
          coach_id: string
          comment: string
          correction_type?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          timestamp_seconds?: number | null
          updated_at?: string | null
          video_id: string
          voice_note_path?: string | null
        }
        Update: {
          coach_id?: string
          comment?: string
          correction_type?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          timestamp_seconds?: number | null
          updated_at?: string | null
          video_id?: string
          voice_note_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_corrections_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_corrections_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "exercise_videos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_active_trial: {
        Args: { _coach_id: string }
        Returns: {
          coach_id: string
          days_duration: number
          days_remaining: number
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          status: string
        }[]
      }
      get_coach_dashboard_stats: { Args: { p_coach_id: string }; Returns: Json }
      get_student_coach_id: { Args: never; Returns: string }
      get_student_dashboard_stats: {
        Args: { p_student_id: string }
        Returns: Json
      }
      get_team_performance: {
        Args: { p_coach_id: string; p_weeks?: number }
        Returns: Json
      }
      get_user_teams: { Args: { _user_id: string }; Returns: string[] }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _team_id: string
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_coach: { Args: never; Returns: boolean }
      is_student: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "coach" | "athlete"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "coach", "athlete"],
    },
  },
} as const
