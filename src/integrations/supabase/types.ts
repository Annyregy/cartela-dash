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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          address: string
          code: number | null
          created_at: string
          id: string
          map_address: string
          name: string
          neighborhood: string
          note: string
          phone: string
          place: string
        }
        Insert: {
          address?: string
          code?: number | null
          created_at?: string
          id: string
          map_address?: string
          name?: string
          neighborhood?: string
          note?: string
          phone?: string
          place?: string
        }
        Update: {
          address?: string
          code?: number | null
          created_at?: string
          id?: string
          map_address?: string
          name?: string
          neighborhood?: string
          note?: string
          phone?: string
          place?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          created_at: string
          customer_code: number | null
          customer_id: string
          customer_name: string
          delivery_note: string
          delivery_status: string
          discount_percent: number | null
          discount_value: number | null
          id: string
          items: Json
          neighborhood: string
          paid_amount: number
          payment_method: string
          payment_status: string
          phone: string
          scheduled_for: string | null
          subtotal: number | null
          surcharge_percent: number | null
          surcharge_value: number | null
          total: number
        }
        Insert: {
          address?: string
          created_at?: string
          customer_code?: number | null
          customer_id?: string
          customer_name?: string
          delivery_note?: string
          delivery_status?: string
          discount_percent?: number | null
          discount_value?: number | null
          id: string
          items?: Json
          neighborhood?: string
          paid_amount?: number
          payment_method?: string
          payment_status?: string
          phone?: string
          scheduled_for?: string | null
          subtotal?: number | null
          surcharge_percent?: number | null
          surcharge_value?: number | null
          total?: number
        }
        Update: {
          address?: string
          created_at?: string
          customer_code?: number | null
          customer_id?: string
          customer_name?: string
          delivery_note?: string
          delivery_status?: string
          discount_percent?: number | null
          discount_value?: number | null
          id?: string
          items?: Json
          neighborhood?: string
          paid_amount?: number
          payment_method?: string
          payment_status?: string
          phone?: string
          scheduled_for?: string | null
          subtotal?: number | null
          surcharge_percent?: number | null
          surcharge_value?: number | null
          total?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number
          stock: number
          unit: string
        }
        Insert: {
          created_at?: string
          id: string
          name?: string
          price?: number
          stock?: number
          unit?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number
          stock?: number
          unit?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          answer_hash: string
          created_at: string
          id: string
          question: string
          username: string
          username_norm: string
        }
        Insert: {
          answer_hash?: string
          created_at?: string
          id: string
          question?: string
          username: string
          username_norm: string
        }
        Update: {
          answer_hash?: string
          created_at?: string
          id?: string
          question?: string
          username?: string
          username_norm?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          id: string
          items: Json
          notes: string
          supplier_id: string
          supplier_name: string
          total: number
        }
        Insert: {
          created_at?: string
          id: string
          items?: Json
          notes?: string
          supplier_id?: string
          supplier_name?: string
          total?: number
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          notes?: string
          supplier_id?: string
          supplier_name?: string
          total?: number
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          contact: string
          created_at: string
          id: string
          name: string
          notes: string
          phone: string
        }
        Insert: {
          contact?: string
          created_at?: string
          id: string
          name?: string
          notes?: string
          phone?: string
        }
        Update: {
          contact?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string
          phone?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
