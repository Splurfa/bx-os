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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          confidence_score: number | null
          created_at: string
          description: string
          generated_at: string
          id: string
          insight_data: Json | null
          insight_type: string
          priority_level: string | null
          reviewed_at: string | null
          status: string | null
          student_id: string
          title: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          description: string
          generated_at?: string
          id?: string
          insight_data?: Json | null
          insight_type: string
          priority_level?: string | null
          reviewed_at?: string | null
          status?: string | null
          student_id: string
          title: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          description?: string
          generated_at?: string
          id?: string
          insight_data?: Json | null
          insight_type?: string
          priority_level?: string | null
          reviewed_at?: string | null
          status?: string | null
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      behavior_history: {
        Row: {
          archived_at: string
          behavior_request_id: string
          created_at: string
          family_notified: boolean | null
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          intervention_applied: string | null
          notification_method: string | null
          reflection_id: string
          resolution_notes: string | null
          resolution_type: string
          student_id: string
        }
        Insert: {
          archived_at?: string
          behavior_request_id: string
          created_at?: string
          family_notified?: boolean | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          intervention_applied?: string | null
          notification_method?: string | null
          reflection_id: string
          resolution_notes?: string | null
          resolution_type: string
          student_id: string
        }
        Update: {
          archived_at?: string
          behavior_request_id?: string
          created_at?: string
          family_notified?: boolean | null
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          intervention_applied?: string | null
          notification_method?: string | null
          reflection_id?: string
          resolution_notes?: string | null
          resolution_type?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavior_history_behavior_request_id_fkey"
            columns: ["behavior_request_id"]
            isOneToOne: false
            referencedRelation: "behavior_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_history_reflection_id_fkey"
            columns: ["reflection_id"]
            isOneToOne: false
            referencedRelation: "reflections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      behavior_patterns: {
        Row: {
          ai_insights: Json | null
          confidence_score: number | null
          created_at: string
          detected_at: string
          id: string
          intervention_suggestions: Json | null
          pattern_data: Json | null
          pattern_type: string
          student_id: string
        }
        Insert: {
          ai_insights?: Json | null
          confidence_score?: number | null
          created_at?: string
          detected_at?: string
          id?: string
          intervention_suggestions?: Json | null
          pattern_data?: Json | null
          pattern_type: string
          student_id: string
        }
        Update: {
          ai_insights?: Json | null
          confidence_score?: number | null
          created_at?: string
          detected_at?: string
          id?: string
          intervention_suggestions?: Json | null
          pattern_data?: Json | null
          pattern_type?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavior_patterns_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      behavior_requests: {
        Row: {
          assigned_kiosk: number | null
          behavior_type: string
          created_at: string
          description: string
          id: string
          location: string | null
          priority_level: string | null
          status: string
          student_id: string
          teacher_id: string | null
          teacher_name: string
          time_of_incident: string | null
          updated_at: string
        }
        Insert: {
          assigned_kiosk?: number | null
          behavior_type: string
          created_at?: string
          description: string
          id?: string
          location?: string | null
          priority_level?: string | null
          status?: string
          student_id: string
          teacher_id?: string | null
          teacher_name: string
          time_of_incident?: string | null
          updated_at?: string
        }
        Update: {
          assigned_kiosk?: number | null
          behavior_type?: string
          created_at?: string
          description?: string
          id?: string
          location?: string | null
          priority_level?: string | null
          status?: string
          student_id?: string
          teacher_id?: string | null
          teacher_name?: string
          time_of_incident?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavior_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          created_at: string
          delivered_at: string | null
          engagement_data: Json | null
          error_message: string | null
          guardian_id: string
          id: string
          message_body: string
          method: string
          opened_at: string | null
          recipient: string
          sent_at: string | null
          status: string
          student_id: string
          subject: string | null
          template_id: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          engagement_data?: Json | null
          error_message?: string | null
          guardian_id: string
          id?: string
          message_body: string
          method: string
          opened_at?: string | null
          recipient: string
          sent_at?: string | null
          status?: string
          student_id: string
          subject?: string | null
          template_id?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          engagement_data?: Json | null
          error_message?: string | null
          guardian_id?: string
          id?: string
          message_body?: string
          method?: string
          opened_at?: string | null
          recipient?: string
          sent_at?: string | null
          status?: string
          student_id?: string
          subject?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "communication_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          body_template: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject_template: string | null
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_template: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject_template?: string | null
          template_type: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_template?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject_template?: string | null
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      csv_import_raw: {
        Row: {
          address_parse_mode: string | null
          address_raw: string | null
          city: string | null
          class_raw: string | null
          created_at: string | null
          dob: string | null
          family_header: string | null
          household_emails: string | null
          id: number
          page_number: string | null
          parent1_cell_1: string | null
          parent1_cell_2: string | null
          parent1_name: string | null
          parent1_work_1: string | null
          parent1_work_2: string | null
          parent2_cell_1: string | null
          parent2_cell_2: string | null
          parent2_name: string | null
          parent2_work_1: string | null
          parent2_work_2: string | null
          source_excerpt: string | null
          state: string | null
          street: string | null
          street_normalized: string | null
          student_first_name: string | null
          student_full_name: string | null
          student_last_name: string | null
          zipc: string | null
        }
        Insert: {
          address_parse_mode?: string | null
          address_raw?: string | null
          city?: string | null
          class_raw?: string | null
          created_at?: string | null
          dob?: string | null
          family_header?: string | null
          household_emails?: string | null
          id?: number
          page_number?: string | null
          parent1_cell_1?: string | null
          parent1_cell_2?: string | null
          parent1_name?: string | null
          parent1_work_1?: string | null
          parent1_work_2?: string | null
          parent2_cell_1?: string | null
          parent2_cell_2?: string | null
          parent2_name?: string | null
          parent2_work_1?: string | null
          parent2_work_2?: string | null
          source_excerpt?: string | null
          state?: string | null
          street?: string | null
          street_normalized?: string | null
          student_first_name?: string | null
          student_full_name?: string | null
          student_last_name?: string | null
          zipc?: string | null
        }
        Update: {
          address_parse_mode?: string | null
          address_raw?: string | null
          city?: string | null
          class_raw?: string | null
          created_at?: string | null
          dob?: string | null
          family_header?: string | null
          household_emails?: string | null
          id?: number
          page_number?: string | null
          parent1_cell_1?: string | null
          parent1_cell_2?: string | null
          parent1_name?: string | null
          parent1_work_1?: string | null
          parent1_work_2?: string | null
          parent2_cell_1?: string | null
          parent2_cell_2?: string | null
          parent2_name?: string | null
          parent2_work_1?: string | null
          parent2_work_2?: string | null
          source_excerpt?: string | null
          state?: string | null
          street?: string | null
          street_normalized?: string | null
          student_first_name?: string | null
          student_full_name?: string | null
          student_last_name?: string | null
          zipc?: string | null
        }
        Relationships: []
      }
      data_sources: {
        Row: {
          connection_info: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          last_sync: string | null
          name: string
          sync_frequency: unknown | null
          type: string
        }
        Insert: {
          connection_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name: string
          sync_frequency?: unknown | null
          type: string
        }
        Update: {
          connection_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          name?: string
          sync_frequency?: unknown | null
          type?: string
        }
        Relationships: []
      }
      external_data: {
        Row: {
          academic_data: Json | null
          attendance_data: Json | null
          correlation_confidence: number | null
          created_at: string
          data_source_id: string
          disciplinary_data: Json | null
          external_student_id: string | null
          id: string
          last_sync: string | null
          student_id: string
        }
        Insert: {
          academic_data?: Json | null
          attendance_data?: Json | null
          correlation_confidence?: number | null
          created_at?: string
          data_source_id: string
          disciplinary_data?: Json | null
          external_student_id?: string | null
          id?: string
          last_sync?: string | null
          student_id: string
        }
        Update: {
          academic_data?: Json | null
          attendance_data?: Json | null
          correlation_confidence?: number | null
          created_at?: string
          data_source_id?: string
          disciplinary_data?: Json | null
          external_student_id?: string | null
          id?: string
          last_sync?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_data_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          family_name: string
          id: string
          notes: string | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          family_name: string
          id?: string
          notes?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          family_name?: string
          id?: string
          notes?: string | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      guardians: {
        Row: {
          can_pickup: boolean | null
          communication_preference: string | null
          created_at: string
          email: string | null
          emergency_contact: boolean | null
          family_id: string
          first_name: string
          id: string
          is_primary_contact: boolean | null
          last_name: string
          name: string | null
          notes: string | null
          phone_primary: string | null
          phone_secondary: string | null
          relationship: string
          updated_at: string
        }
        Insert: {
          can_pickup?: boolean | null
          communication_preference?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: boolean | null
          family_id: string
          first_name: string
          id?: string
          is_primary_contact?: boolean | null
          last_name: string
          name?: string | null
          notes?: string | null
          phone_primary?: string | null
          phone_secondary?: string | null
          relationship: string
          updated_at?: string
        }
        Update: {
          can_pickup?: boolean | null
          communication_preference?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: boolean | null
          family_id?: string
          first_name?: string
          id?: string
          is_primary_contact?: boolean | null
          last_name?: string
          name?: string | null
          notes?: string | null
          phone_primary?: string | null
          phone_secondary?: string | null
          relationship?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardians_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
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
          device_info: Json | null
          id: number
          is_active: boolean | null
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
          device_info?: Json | null
          id?: number
          is_active?: boolean | null
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
          device_info?: Json | null
          id?: number
          is_active?: boolean | null
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kiosks_current_behavior_request_id_fkey"
            columns: ["current_behavior_request_id"]
            isOneToOne: false
            referencedRelation: "behavior_requests"
            referencedColumns: ["id"]
          },
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
          classroom: string | null
          created_at: string
          department: string | null
          email: string
          full_name: string | null
          grade_level: string | null
          hire_date: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          classroom?: string | null
          created_at?: string
          department?: string | null
          email: string
          full_name?: string | null
          grade_level?: string | null
          hire_date?: string | null
          id: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          classroom?: string | null
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string | null
          grade_level?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          ai_analysis: Json | null
          behavior_request_id: string
          created_at: string
          id: string
          mood_rating: number | null
          question_1_response: string | null
          question_2_response: string | null
          question_3_response: string | null
          question_4_response: string | null
          reviewed_at: string | null
          revision_requested: boolean | null
          student_id: string
          submitted_at: string | null
          teacher_approved: boolean | null
          teacher_feedback: string | null
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          behavior_request_id: string
          created_at?: string
          id?: string
          mood_rating?: number | null
          question_1_response?: string | null
          question_2_response?: string | null
          question_3_response?: string | null
          question_4_response?: string | null
          reviewed_at?: string | null
          revision_requested?: boolean | null
          student_id: string
          submitted_at?: string | null
          teacher_approved?: boolean | null
          teacher_feedback?: string | null
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          behavior_request_id?: string
          created_at?: string
          id?: string
          mood_rating?: number | null
          question_1_response?: string | null
          question_2_response?: string | null
          question_3_response?: string | null
          question_4_response?: string | null
          reviewed_at?: string | null
          revision_requested?: boolean | null
          student_id?: string
          submitted_at?: string | null
          teacher_approved?: boolean | null
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
          {
            foreignKeyName: "reflections_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          allergies: string | null
          class_name: string | null
          created_at: string
          date_of_birth: string | null
          family_id: string
          first_name: string
          gender: string | null
          grade: string | null
          id: string
          last_name: string
          medications: string | null
          name: string | null
          notes: string | null
          special_needs: string | null
          student_id_external: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          class_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          family_id: string
          first_name: string
          gender?: string | null
          grade?: string | null
          id?: string
          last_name: string
          medications?: string | null
          name?: string | null
          notes?: string | null
          special_needs?: string | null
          student_id_external?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          class_name?: string | null
          created_at?: string
          date_of_birth?: string | null
          family_id?: string
          first_name?: string
          gender?: string | null
          grade?: string | null
          id?: string
          last_name?: string
          medications?: string | null
          name?: string | null
          notes?: string | null
          special_needs?: string | null
          student_id_external?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          device_type: string | null
          ended_at: string | null
          id: string
          ip_address: unknown | null
          last_activity: string
          location: string | null
          login_time: string
          session_status: string
          session_token: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          device_type?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string
          location?: string | null
          login_time?: string
          session_status?: string
          session_token?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          device_type?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown | null
          last_activity?: string
          location?: string | null
          login_time?: string
          session_status?: string
          session_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_clear_all_queues: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      assign_waiting_students_to_kiosk: {
        Args: { p_kiosk_id: number }
        Returns: undefined
      }
      create_user_session: {
        Args: {
          p_device_info?: Json
          p_device_type?: string
          p_location?: string
          p_user_id: string
        }
        Returns: string
      }
      end_user_session: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      import_complete_hillel_csv_data: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      import_hillel_csv_data: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      log_kiosk_auth_attempt: {
        Args: { p_kiosk_id: number; p_student_id?: string; p_success?: boolean }
        Returns: undefined
      }
      process_csv_to_families_and_students: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      reassign_waiting_students: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_student_kiosk_status: {
        Args: {
          p_behavior_request_id?: string
          p_kiosk_id: number
          p_student_id?: string
        }
        Returns: undefined
      }
      validate_student_birthday_password: {
        Args: { p_password: string; p_student_id: string }
        Returns: boolean
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
