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
      game_limits: {
        Row: {
          base_cpu_percent: number
          base_ram_mb: number
          created_at: string
          game_name: string
          is_active: boolean
          max_slots: number
          unlimited: boolean
          updated_at: string
        }
        Insert: {
          base_cpu_percent?: number
          base_ram_mb?: number
          created_at?: string
          game_name: string
          is_active?: boolean
          max_slots?: number
          unlimited?: boolean
          updated_at?: string
        }
        Update: {
          base_cpu_percent?: number
          base_ram_mb?: number
          created_at?: string
          game_name?: string
          is_active?: boolean
          max_slots?: number
          unlimited?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      panel_stats_cache: {
        Row: {
          id: number
          nodes_online: number
          total_ram_mb: number
          total_servers: number
          total_users: number
          updated_at: string
        }
        Insert: {
          id?: number
          nodes_online?: number
          total_ram_mb?: number
          total_servers?: number
          total_users?: number
          updated_at?: string
        }
        Update: {
          id?: number
          nodes_online?: number
          total_ram_mb?: number
          total_servers?: number
          total_users?: number
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          token: string
          used: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          token: string
          used?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "password_reset_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string
          id: string
          is_admin_online: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin_online?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin_online?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          discord_username: string | null
          email: string
          full_name: string | null
          id: string
          is_banned: boolean
          is_verified: boolean
          stripe_customer_id: string | null
          updated_at: string
          username: string | null
          wallet_balance: number
        }
        Insert: {
          created_at?: string
          discord_username?: string | null
          email: string
          full_name?: string | null
          id: string
          is_banned?: boolean
          is_verified?: boolean
          stripe_customer_id?: string | null
          updated_at?: string
          username?: string | null
          wallet_balance?: number
        }
        Update: {
          created_at?: string
          discord_username?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_banned?: boolean
          is_verified?: boolean
          stripe_customer_id?: string | null
          updated_at?: string
          username?: string | null
          wallet_balance?: number
        }
        Relationships: []
      }
      server_requests: {
        Row: {
          assigned_ip: string | null
          cpu_boost: number
          created_at: string
          credentials_encrypted: boolean | null
          description: string | null
          discord_username: string
          expires_at: string | null
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          ip_address: string | null
          panel_password: string | null
          panel_url: string | null
          panel_username: string | null
          port: number | null
          pterodactyl_server_id: string | null
          ram_boost: number
          rejection_reason: string | null
          server_config: Json | null
          server_name: string
          status: Database["public"]["Enums"]["request_status"]
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_ip?: string | null
          cpu_boost?: number
          created_at?: string
          credentials_encrypted?: boolean | null
          description?: string | null
          discord_username: string
          expires_at?: string | null
          game_type: Database["public"]["Enums"]["game_type"]
          id?: string
          ip_address?: string | null
          panel_password?: string | null
          panel_url?: string | null
          panel_username?: string | null
          port?: number | null
          pterodactyl_server_id?: string | null
          ram_boost?: number
          rejection_reason?: string | null
          server_config?: Json | null
          server_name: string
          status?: Database["public"]["Enums"]["request_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_ip?: string | null
          cpu_boost?: number
          created_at?: string
          credentials_encrypted?: boolean | null
          description?: string | null
          discord_username?: string
          expires_at?: string | null
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          ip_address?: string | null
          panel_password?: string | null
          panel_url?: string | null
          panel_username?: string | null
          port?: number | null
          pterodactyl_server_id?: string | null
          ram_boost?: number
          rejection_reason?: string | null
          server_config?: Json | null
          server_name?: string
          status?: Database["public"]["Enums"]["request_status"]
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_announcements: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          global_alert_message: string | null
          id: string
          maintenance_mode: boolean
          total_slots: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          global_alert_message?: string | null
          id?: string
          maintenance_mode?: boolean
          total_slots?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          global_alert_message?: string | null
          id?: string
          maintenance_mode?: boolean
          total_slots?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          created_at: string
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          id: string
          message: string
          rating: number
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          id?: string
          message: string
          rating: number
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_type?: Database["public"]["Enums"]["feedback_type"]
          id?: string
          message?: string
          rating?: number
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
          role?: Database["public"]["Enums"]["app_role"]
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrypt_credential: {
        Args: { ciphertext: string; encryption_key: string }
        Returns: string
      }
      encrypt_credential: {
        Args: { encryption_key: string; plaintext: string }
        Returns: string
      }
      get_active_slots_count: { Args: never; Returns: number }
      get_game_slot_usage: {
        Args: { game_name_param: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      renew_server_lease: { Args: { request_id: string }; Returns: boolean }
      toggle_permanent_server: {
        Args: { make_permanent: boolean; target_request_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      feedback_type: "bug" | "feature" | "general"
      game_type:
        | "minecraft"
        | "terraria"
        | "satisfactory"
        | "cs2"
        | "factorio"
        | "rust"
      request_status: "pending" | "active" | "rejected" | "suspended"
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
      feedback_type: ["bug", "feature", "general"],
      game_type: [
        "minecraft",
        "terraria",
        "satisfactory",
        "cs2",
        "factorio",
        "rust",
      ],
      request_status: ["pending", "active", "rejected", "suspended"],
    },
  },
} as const
