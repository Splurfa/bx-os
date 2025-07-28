export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      behavior_history: {
        Row: {
          assigned_kiosk_id: number | null
          behaviors: string[]
          completed_at: string
          completion_status: string
          created_at: string
          device_location: string | null
          device_type: string | null
          id: string
          intervention_outcome: string
          kiosk_location: string | null
          kiosk_name: string | null
          mood: string
          notes: string | null
          original_request_id: string
          question1: string | null
          question2: string | null
          question3: string | null
          question4: string | null
          queue_created_at: string
          queue_position: number | null
          queue_started_at: string | null
          reflection_history: Json | null
          reflection_id: string | null
          session_id: string | null
          student_class_name: string | null
          student_grade: string | null
          student_id: string
          student_name: string
          teacher_email: string | null
          teacher_feedback: string | null
          teacher_id: string
          teacher_name: string | null
          time_in_queue_minutes: number | null
          updated_at: string
          urgent: boolean
        }
        Insert: {
          assigned_kiosk_id?: number | null
          behaviors?: string[]
          completed_at?: string
          completion_status?: string
          created_at?: string
          device_location?: string | null
          device_type?: string | null
          id?: string
          intervention_outcome?: string
          kiosk_location?: string | null
          kiosk_name?: string | null
          mood: string
          notes?: string | null
          original_request_id: string
          question1?: string | null
          question2?: string | null
          question3?: string | null
          question4?: string | null
          queue_created_at: string
          queue_position?: number | null
          queue_started_at?: string | null
          reflection_history?: Json | null
          reflection_id?: string | null
          session_id?: string | null
          student_class_name?: string | null
          student_grade?: string | null
          student_id: string
          student_name: string
          teacher_email?: string | null
          teacher_feedback?: string | null
          teacher_id: string
          teacher_name?: string | null
          time_in_queue_minutes?: number | null
          updated_at?: string
          urgent?: boolean
        }
        Update: {
          assigned_kiosk_id?: number | null
          behaviors?: string[]
          completed_at?: string
          completion_status?: string
          created_at?: string
          device_location?: string | null
          device_type?: string | null
          id?: string
          intervention_outcome?: string
          kiosk_location?: string | null
          kiosk_name?: string | null
          mood?: string
          notes?: string | null
          original_request_id?: string
          question1?: string | null
          question2?: string | null
          question3?: string | null
          question4?: string | null
          queue_created_at?: string
          queue_position?: number | null
          queue_started_at?: string | null
          reflection_history?: Json | null
          reflection_id?: string | null
          session_id?: string | null
          student_class_name?: string | null
          student_grade?: string | null
          student_id?: string
          student_name?: string
          teacher_email?: string | null
          teacher_feedback?: string | null
          teacher_id?: string
          teacher_name?: string | null
          time_in_queue_minutes?: number | null
          updated_at?: string
          urgent?: boolean
        }
        Relationships: []
      }
      behavior_requests: {
        Row: {
          assigned_kiosk_id: number | null
          behaviors: string[]
          created_at: string
          id: string
          kiosk_status: string
          mood: string
          notes: string | null
          status: string
          student_id: string
          teacher_id: string
          updated_at: string
          urgent: boolean
        }
        Insert: {
          assigned_kiosk_id?: number | null
          behaviors?: string[]
          created_at?: string
          id?: string
          kiosk_status?: string
          mood: string
          notes?: string | null
          status?: string
          student_id: string
          teacher_id: string
          updated_at?: string
          urgent?: boolean
        }
        Update: {
          assigned_kiosk_id?: number | null
          behaviors?: string[]
          created_at?: string
          id?: string
          kiosk_status?: string
          mood?: string
          notes?: string | null
          status?: string
          student_id?: string
          teacher_id?: string
          updated_at?: string
          urgent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "behavior_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_requests_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kiosks: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string
          current_behavior_request_id: string | null
          current_student_id: string | null
          id: number
          is_active: boolean
          location: string | null
          name: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          current_behavior_request_id?: string | null
          current_student_id?: string | null
          id?: number
          is_active?: boolean
          location?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          current_behavior_request_id?: string | null
          current_student_id?: string | null
          id?: number
          is_active?: boolean
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kiosks_current_student_id_fkey"
            columns: ["current_student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          behavior_request_id: string
          created_at: string
          id: string
          question1: string
          question2: string
          question3: string
          question4: string
          status: string
          teacher_feedback: string | null
          updated_at: string
        }
        Insert: {
          behavior_request_id: string
          created_at?: string
          id?: string
          question1: string
          question2: string
          question3: string
          question4: string
          status?: string
          teacher_feedback?: string | null
          updated_at?: string
        }
        Update: {
          behavior_request_id?: string
          created_at?: string
          id?: string
          question1?: string
          question2?: string
          question3?: string
          question4?: string
          status?: string
          teacher_feedback?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflections_behavior_request_id_fkey"
            columns: ["behavior_request_id"]
            isOneToOne: false
            referencedRelation: "behavior_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      reflections_history: {
        Row: {
          archived_at: string
          archived_by: string | null
          attempt_number: number
          behavior_request_id: string
          id: string
          original_created_at: string
          original_reflection_id: string
          original_updated_at: string
          question1: string
          question2: string
          question3: string
          question4: string
          revision_reason: string | null
          status: string
          teacher_feedback: string | null
        }
        Insert: {
          archived_at?: string
          archived_by?: string | null
          attempt_number?: number
          behavior_request_id: string
          id?: string
          original_created_at: string
          original_reflection_id: string
          original_updated_at: string
          question1: string
          question2: string
          question3: string
          question4: string
          revision_reason?: string | null
          status: string
          teacher_feedback?: string | null
        }
        Update: {
          archived_at?: string
          archived_by?: string | null
          attempt_number?: number
          behavior_request_id?: string
          id?: string
          original_created_at?: string
          original_reflection_id?: string
          original_updated_at?: string
          question1?: string
          question2?: string
          question3?: string
          question4?: string
          revision_reason?: string | null
          status?: string
          teacher_feedback?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          class_name: string | null
          created_at: string
          grade: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          class_name?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          class_name?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_identifier: string | null
          device_type: string
          id: string
          kiosk_id: number | null
          last_activity: string
          location: string | null
          login_time: string
          metadata: Json | null
          session_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_identifier?: string | null
          device_type: string
          id?: string
          kiosk_id?: number | null
          last_activity?: string
          location?: string | null
          login_time?: string
          metadata?: Json | null
          session_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_identifier?: string | null
          device_type?: string
          id?: string
          kiosk_id?: number | null
          last_activity?: string
          location?: string | null
          login_time?: string
          metadata?: Json | null
          session_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_waiting_students_to_kiosk: {
        Args: { p_kiosk_id: number }
        Returns: undefined
      }
      clear_teacher_queue: {
        Args: { p_teacher_id?: string }
        Returns: number
      }
      create_user_session: {
        Args: {
          p_user_id: string
          p_device_type: string
          p_location?: string
          p_kiosk_id?: number
          p_device_identifier?: string
          p_metadata?: Json
        }
        Returns: string
      }
      end_user_session: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      get_active_sessions_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          device_type: string
          active_count: number
          idle_count: number
          total_count: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      reassign_waiting_students: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_session_activity: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      update_student_kiosk_status: {
        Args: { p_behavior_request_id: string; p_new_kiosk_status: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
