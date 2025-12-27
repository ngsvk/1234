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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_programs: {
        Row: {
          description: string | null
          display_order: number
          features: Json | null
          id: string
          is_visible: boolean
          name: string
          subjects: Json | null
        }
        Insert: {
          description?: string | null
          display_order?: number
          features?: Json | null
          id?: string
          is_visible?: boolean
          name: string
          subjects?: Json | null
        }
        Update: {
          description?: string | null
          display_order?: number
          features?: Json | null
          id?: string
          is_visible?: boolean
          name?: string
          subjects?: Json | null
        }
        Relationships: []
      }
      academics_content: {
        Row: {
          calendar_events: Json | null
          calendar_title: string | null
          hero_description: string | null
          hero_title: string | null
          id: string
        }
        Insert: {
          calendar_events?: Json | null
          calendar_title?: string | null
          hero_description?: string | null
          hero_title?: string | null
          id?: string
        }
        Update: {
          calendar_events?: Json | null
          calendar_title?: string | null
          hero_description?: string | null
          hero_title?: string | null
          id?: string
        }
        Relationships: []
      }
      admission_submissions: {
        Row: {
          address: string
          contact_number: string
          date_of_birth: string
          email: string
          gender: string
          id: string
          parent_contact: string
          parent_name: string
          preferred_language: string | null
          previous_school: string | null
          sslc_result: string | null
          status: string | null
          stream: string
          student_name: string
          submitted_at: string
        }
        Insert: {
          address: string
          contact_number: string
          date_of_birth: string
          email: string
          gender: string
          id?: string
          parent_contact: string
          parent_name: string
          preferred_language?: string | null
          previous_school?: string | null
          sslc_result?: string | null
          status?: string | null
          stream: string
          student_name: string
          submitted_at?: string
        }
        Update: {
          address?: string
          contact_number?: string
          date_of_birth?: string
          email?: string
          gender?: string
          id?: string
          parent_contact?: string
          parent_name?: string
          preferred_language?: string | null
          previous_school?: string | null
          sslc_result?: string | null
          status?: string | null
          stream?: string
          student_name?: string
          submitted_at?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_visible: boolean
          name: string
          url: string | null
        }
        Insert: {
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_visible?: boolean
          name: string
          url?: string | null
        }
        Update: {
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_visible?: boolean
          name?: string
          url?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          category: string | null
          description: string | null
          display_order: number
          id: string
          image_url: string
          is_visible: boolean
          title: string | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_visible?: boolean
          title?: string | null
        }
        Update: {
          category?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_visible?: boolean
          title?: string | null
        }
        Relationships: []
      }
      portal_users: {
        Row: {
          admission_date: string | null
          class: string | null
          department: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          password_hash: string | null
          roll_number: string | null
          section: string | null
          user_id: string
          user_type: string
          username: string
        }
        Insert: {
          admission_date?: string | null
          class?: string | null
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          password_hash?: string | null
          roll_number?: string | null
          section?: string | null
          user_id: string
          user_type: string
          username: string
        }
        Update: {
          admission_date?: string | null
          class?: string | null
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          password_hash?: string | null
          roll_number?: string | null
          section?: string | null
          user_id?: string
          user_type?: string
          username?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          data: Json
          key: string
          updated_at: string
        }
        Insert: {
          data?: Json
          key: string
          updated_at?: string
        }
        Update: {
          data?: Json
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_content_revisions: {
        Row: {
          created_at: string
          data: Json
          id: string
          key: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          key: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          key?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          department: string | null
          designation: string
          display_order: number
          email: string
          experience_years: number | null
          full_name: string
          id: string
          is_active: boolean
          joining_date: string | null
          phone: string | null
          photo_url: string | null
          qualifications: string | null
          staff_type: string | null
        }
        Insert: {
          department?: string | null
          designation: string
          display_order?: number
          email: string
          experience_years?: number | null
          full_name: string
          id?: string
          is_active?: boolean
          joining_date?: string | null
          phone?: string | null
          photo_url?: string | null
          qualifications?: string | null
          staff_type?: string | null
        }
        Update: {
          department?: string | null
          designation?: string
          display_order?: number
          email?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          is_active?: boolean
          joining_date?: string | null
          phone?: string | null
          photo_url?: string | null
          qualifications?: string | null
          staff_type?: string | null
        }
        Relationships: []
      }
      timetable_entries: {
        Row: {
          class: string
          day_of_week: string
          end_time: string | null
          id: string
          room: string | null
          section: string
          start_time: string
          subject: string
          teacher: string | null
        }
        Insert: {
          class: string
          day_of_week: string
          end_time?: string | null
          id?: string
          room?: string | null
          section: string
          start_time: string
          subject: string
          teacher?: string | null
        }
        Update: {
          class?: string
          day_of_week?: string
          end_time?: string | null
          id?: string
          room?: string | null
          section?: string
          start_time?: string
          subject?: string
          teacher?: string | null
        }
        Relationships: []
      }
      updates: {
        Row: {
          date: string
          description: string | null
          id: string
          is_published: boolean
          read_more_url: string | null
          title: string
          youtube_url: string | null
        }
        Insert: {
          date?: string
          description?: string | null
          id?: string
          is_published?: boolean
          read_more_url?: string | null
          title: string
          youtube_url?: string | null
        }
        Update: {
          date?: string
          description?: string | null
          id?: string
          is_published?: boolean
          read_more_url?: string | null
          title?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_orphaned_auth_user: {
        Args: { target_email: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
