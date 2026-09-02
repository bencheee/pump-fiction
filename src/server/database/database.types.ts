export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      active_workout_commands: {
        Row: {
          applied_at: string
          client_created_at: string
          command_id: string
          expected_revision: number
          operation: Database["public"]["Enums"]["active_workout_command_operation"]
          payload: Json
          resulting_revision: number
          workout_id: string
        }
        Insert: {
          applied_at?: string
          client_created_at: string
          command_id: string
          expected_revision: number
          operation: Database["public"]["Enums"]["active_workout_command_operation"]
          payload: Json
          resulting_revision: number
          workout_id: string
        }
        Update: {
          applied_at?: string
          client_created_at?: string
          command_id?: string
          expected_revision?: number
          operation?: Database["public"]["Enums"]["active_workout_command_operation"]
          payload?: Json
          resulting_revision?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_workout_commands_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string
          id: number
          measurement_unit: string
          time_zone: string
          updated_at: string
          weight_unit: string
        }
        Insert: {
          created_at?: string
          id?: number
          measurement_unit?: string
          time_zone: string
          updated_at?: string
          weight_unit?: string
        }
        Update: {
          created_at?: string
          id?: number
          measurement_unit?: string
          time_zone?: string
          updated_at?: string
          weight_unit?: string
        }
        Relationships: []
      }
      exercise_load_modes: {
        Row: {
          exercise_base_type: Database["public"]["Enums"]["exercise_base_type"]
          exercise_id: string
          load_mode: Database["public"]["Enums"]["load_mode"]
        }
        Insert: {
          exercise_base_type: Database["public"]["Enums"]["exercise_base_type"]
          exercise_id: string
          load_mode: Database["public"]["Enums"]["load_mode"]
        }
        Update: {
          exercise_base_type?: Database["public"]["Enums"]["exercise_base_type"]
          exercise_id?: string
          load_mode?: Database["public"]["Enums"]["load_mode"]
        }
        Relationships: [
          {
            foreignKeyName: "exercise_load_modes_exercise_id_exercise_base_type_fkey"
            columns: ["exercise_id", "exercise_base_type"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id", "base_type"]
          },
        ]
      }
      exercises: {
        Row: {
          base_type: Database["public"]["Enums"]["exercise_base_type"]
          created_at: string
          id: string
          name: string
          persistent_note: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          base_type: Database["public"]["Enums"]["exercise_base_type"]
          created_at?: string
          id?: string
          name: string
          persistent_note?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          base_type?: Database["public"]["Enums"]["exercise_base_type"]
          created_at?: string
          id?: string
          name?: string
          persistent_note?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: []
      }
      measurement_entries: {
        Row: {
          created_at: string
          entry_date: string
          id: string
          measurement_type_id: string
          updated_at: string
          value_cm: number
        }
        Insert: {
          created_at?: string
          entry_date: string
          id?: string
          measurement_type_id: string
          updated_at?: string
          value_cm: number
        }
        Update: {
          created_at?: string
          entry_date?: string
          id?: string
          measurement_type_id?: string
          updated_at?: string
          value_cm?: number
        }
        Relationships: [
          {
            foreignKeyName: "measurement_entries_measurement_type_id_fkey"
            columns: ["measurement_type_id"]
            isOneToOne: false
            referencedRelation: "measurement_types"
            referencedColumns: ["id"]
          },
        ]
      }
      measurement_types: {
        Row: {
          created_at: string
          id: string
          name: string
          status: Database["public"]["Enums"]["entity_status"]
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["entity_status"]
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["entity_status"]
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          id: string
          name: string
          next_split_id: string | null
          status: Database["public"]["Enums"]["program_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          next_split_id?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          next_split_id?: string | null
          status?: Database["public"]["Enums"]["program_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_next_split_same_program_fk"
            columns: ["id", "next_split_id"]
            isOneToOne: false
            referencedRelation: "splits"
            referencedColumns: ["program_id", "id"]
          },
        ]
      }
      split_exercises: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          max_reps: number
          min_reps: number
          planned_sets: number
          position: number
          split_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          max_reps: number
          min_reps: number
          planned_sets: number
          position: number
          split_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          max_reps?: number
          min_reps?: number
          planned_sets?: number
          position?: number
          split_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "split_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "split_exercises_split_id_fkey"
            columns: ["split_id"]
            isOneToOne: false
            referencedRelation: "splits"
            referencedColumns: ["id"]
          },
        ]
      }
      splits: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          program_id: string
          status: Database["public"]["Enums"]["entity_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position: number
          program_id: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          program_id?: string
          status?: Database["public"]["Enums"]["entity_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "splits_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      weight_entries: {
        Row: {
          created_at: string
          entry_date: string
          id: string
          updated_at: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          entry_date: string
          id?: string
          updated_at?: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          entry_date?: string
          id?: string
          updated_at?: string
          weight_kg?: number
        }
        Relationships: []
      }
      workout_exercise_load_modes: {
        Row: {
          exercise_base_type_snapshot: Database["public"]["Enums"]["exercise_base_type"]
          load_mode: Database["public"]["Enums"]["load_mode"]
          workout_exercise_id: string
        }
        Insert: {
          exercise_base_type_snapshot: Database["public"]["Enums"]["exercise_base_type"]
          load_mode: Database["public"]["Enums"]["load_mode"]
          workout_exercise_id: string
        }
        Update: {
          exercise_base_type_snapshot?: Database["public"]["Enums"]["exercise_base_type"]
          load_mode?: Database["public"]["Enums"]["load_mode"]
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercise_load_modes_workout_exercise_id_exercise_b_fkey"
            columns: ["workout_exercise_id", "exercise_base_type_snapshot"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id", "exercise_base_type_snapshot"]
          },
        ]
      }
      workout_exercises: {
        Row: {
          created_at: string
          exercise_base_type_snapshot: Database["public"]["Enums"]["exercise_base_type"]
          exercise_id: string
          exercise_name_snapshot: string
          id: string
          max_reps_snapshot: number | null
          min_reps_snapshot: number | null
          persistent_note_snapshot: string
          planned_sets_snapshot: number | null
          position: number
          updated_at: string
          workout_id: string
          workout_note: string
        }
        Insert: {
          created_at?: string
          exercise_base_type_snapshot: Database["public"]["Enums"]["exercise_base_type"]
          exercise_id: string
          exercise_name_snapshot: string
          id?: string
          max_reps_snapshot?: number | null
          min_reps_snapshot?: number | null
          persistent_note_snapshot?: string
          planned_sets_snapshot?: number | null
          position: number
          updated_at?: string
          workout_id: string
          workout_note?: string
        }
        Update: {
          created_at?: string
          exercise_base_type_snapshot?: Database["public"]["Enums"]["exercise_base_type"]
          exercise_id?: string
          exercise_name_snapshot?: string
          id?: string
          max_reps_snapshot?: number | null
          min_reps_snapshot?: number | null
          persistent_note_snapshot?: string
          planned_sets_snapshot?: number | null
          position?: number
          updated_at?: string
          workout_id?: string
          workout_note?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sets: {
        Row: {
          band_direction: Database["public"]["Enums"]["band_direction"] | null
          band_strength: Database["public"]["Enums"]["band_strength"] | null
          created_at: string
          id: string
          is_confirmed: boolean
          load_kg: number | null
          load_mode: Database["public"]["Enums"]["load_mode"] | null
          position: number
          reps: number | null
          updated_at: string
          workout_exercise_id: string
        }
        Insert: {
          band_direction?: Database["public"]["Enums"]["band_direction"] | null
          band_strength?: Database["public"]["Enums"]["band_strength"] | null
          created_at?: string
          id?: string
          is_confirmed?: boolean
          load_kg?: number | null
          load_mode?: Database["public"]["Enums"]["load_mode"] | null
          position: number
          reps?: number | null
          updated_at?: string
          workout_exercise_id: string
        }
        Update: {
          band_direction?: Database["public"]["Enums"]["band_direction"] | null
          band_strength?: Database["public"]["Enums"]["band_strength"] | null
          created_at?: string
          id?: string
          is_confirmed?: boolean
          load_kg?: number | null
          load_mode?: Database["public"]["Enums"]["load_mode"] | null
          position?: number
          reps?: number | null
          updated_at?: string
          workout_exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_workout_exercise_id_fkey"
            columns: ["workout_exercise_id"]
            isOneToOne: false
            referencedRelation: "workout_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_workout_exercise_id_load_mode_fkey"
            columns: ["workout_exercise_id", "load_mode"]
            isOneToOne: false
            referencedRelation: "workout_exercise_load_modes"
            referencedColumns: ["workout_exercise_id", "load_mode"]
          },
        ]
      }
      workouts: {
        Row: {
          accumulated_active_seconds: number
          active_segment_started_at: string | null
          created_at: string
          finished_at: string | null
          id: string
          one_time_name: string | null
          program_name_snapshot: string | null
          revision: number
          rotation_advanced_at: string | null
          rotation_advanced_to_split_id: string | null
          source_kind: Database["public"]["Enums"]["workout_source_kind"]
          source_program_id: string | null
          source_split_id: string | null
          split_name_snapshot: string | null
          started_at: string
          status: Database["public"]["Enums"]["workout_status"]
          updated_at: string
          workout_date: string
        }
        Insert: {
          accumulated_active_seconds?: number
          active_segment_started_at?: string | null
          created_at?: string
          finished_at?: string | null
          id?: string
          one_time_name?: string | null
          program_name_snapshot?: string | null
          revision?: number
          rotation_advanced_at?: string | null
          rotation_advanced_to_split_id?: string | null
          source_kind: Database["public"]["Enums"]["workout_source_kind"]
          source_program_id?: string | null
          source_split_id?: string | null
          split_name_snapshot?: string | null
          started_at: string
          status: Database["public"]["Enums"]["workout_status"]
          updated_at?: string
          workout_date: string
        }
        Update: {
          accumulated_active_seconds?: number
          active_segment_started_at?: string | null
          created_at?: string
          finished_at?: string | null
          id?: string
          one_time_name?: string | null
          program_name_snapshot?: string | null
          revision?: number
          rotation_advanced_at?: string | null
          rotation_advanced_to_split_id?: string | null
          source_kind?: Database["public"]["Enums"]["workout_source_kind"]
          source_program_id?: string | null
          source_split_id?: string | null
          split_name_snapshot?: string | null
          started_at?: string
          status?: Database["public"]["Enums"]["workout_status"]
          updated_at?: string
          workout_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_rotation_advanced_to_split_id_fkey"
            columns: ["rotation_advanced_to_split_id"]
            isOneToOne: false
            referencedRelation: "splits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_rotation_target_same_program_fk"
            columns: ["source_program_id", "rotation_advanced_to_split_id"]
            isOneToOne: false
            referencedRelation: "splits"
            referencedColumns: ["program_id", "id"]
          },
          {
            foreignKeyName: "workouts_source_program_id_fkey"
            columns: ["source_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_source_split_id_fkey"
            columns: ["source_split_id"]
            isOneToOne: false
            referencedRelation: "splits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workouts_source_split_same_program_fk"
            columns: ["source_program_id", "source_split_id"]
            isOneToOne: false
            referencedRelation: "splits"
            referencedColumns: ["program_id", "id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_active_workout_command: {
        Args: {
          p_client_created_at: string
          p_command_id: string
          p_expected_revision: number
          p_operation: Database["public"]["Enums"]["active_workout_command_operation"]
          p_payload: Json
          p_workout_id: string
        }
        Returns: {
          acknowledged_command_id: string
          acknowledged_workout_id: string
          expected_revision: number
          kind: string
          resulting_revision: number
        }[]
      }
      create_exercise_definition: {
        Args: {
          p_base_type: Database["public"]["Enums"]["exercise_base_type"]
          p_load_modes: Database["public"]["Enums"]["load_mode"][]
          p_name: string
          p_persistent_note: string
        }
        Returns: string
      }
      update_exercise_definition: {
        Args: {
          p_base_type: Database["public"]["Enums"]["exercise_base_type"]
          p_exercise_id: string
          p_load_modes: Database["public"]["Enums"]["load_mode"][]
          p_name: string
          p_persistent_note: string
        }
        Returns: string
      }
    }
    Enums: {
      active_workout_command_operation:
        | "set_workout_exercise_note"
        | "pause_timer"
        | "resume_timer"
      band_direction: "resistance" | "assistance"
      band_strength: "light" | "medium" | "strong"
      entity_status: "active" | "archived"
      exercise_base_type: "weights" | "bodyweight" | "assisted" | "band"
      load_mode:
        | "weight"
        | "weight_resistance_band"
        | "bodyweight"
        | "bodyweight_added_weight"
        | "bodyweight_resistance_band"
        | "bodyweight_assistance_band"
        | "assistance_weight"
        | "assistance_band"
        | "resistance_band"
      program_status: "draft" | "active" | "archived"
      workout_source_kind: "proposed_split" | "alternate_split" | "one_time"
      workout_status: "active" | "paused" | "completed" | "incomplete"
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
      active_workout_command_operation: [
        "set_workout_exercise_note",
        "pause_timer",
        "resume_timer",
      ],
      band_direction: ["resistance", "assistance"],
      band_strength: ["light", "medium", "strong"],
      entity_status: ["active", "archived"],
      exercise_base_type: ["weights", "bodyweight", "assisted", "band"],
      load_mode: [
        "weight",
        "weight_resistance_band",
        "bodyweight",
        "bodyweight_added_weight",
        "bodyweight_resistance_band",
        "bodyweight_assistance_band",
        "assistance_weight",
        "assistance_band",
        "resistance_band",
      ],
      program_status: ["draft", "active", "archived"],
      workout_source_kind: ["proposed_split", "alternate_split", "one_time"],
      workout_status: ["active", "paused", "completed", "incomplete"],
    },
  },
} as const
