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
      analises_iniciais: {
        Row: {
          analise_completa: string | null
          caso_id: string
          complexidade: string | null
          created_at: string | null
          evidencias: string | null
          id: number
          pontos_principais: string | null
          tipo_processo: string | null
        }
        Insert: {
          analise_completa?: string | null
          caso_id: string
          complexidade?: string | null
          created_at?: string | null
          evidencias?: string | null
          id?: number
          pontos_principais?: string | null
          tipo_processo?: string | null
        }
        Update: {
          analise_completa?: string | null
          caso_id?: string
          complexidade?: string | null
          created_at?: string | null
          evidencias?: string | null
          id?: number
          pontos_principais?: string | null
          tipo_processo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analises_iniciais_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "casos"
            referencedColumns: ["caso_id"]
          },
        ]
      }
      casos: {
        Row: {
          caso_id: string
          completed_at: string | null
          created_at: string | null
          id: number
          status: string | null
          texto_original: string
          usuario_id: string | null
        }
        Insert: {
          caso_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: number
          status?: string | null
          texto_original: string
          usuario_id?: string | null
        }
        Update: {
          caso_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: number
          status?: string | null
          texto_original?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "casos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          created_at: string | null
          id: number
          max_peticoes_usuario: number | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          max_peticoes_usuario?: number | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          max_peticoes_usuario?: number | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      historico_interacoes: {
        Row: {
          agente: string
          caso_id: string
          conteudo: string
          id: number
          rodada: number
          timestamp_interacao: string | null
          tipo_interacao: string
        }
        Insert: {
          agente: string
          caso_id: string
          conteudo: string
          id?: number
          rodada: number
          timestamp_interacao?: string | null
          tipo_interacao: string
        }
        Update: {
          agente?: string
          caso_id?: string
          conteudo?: string
          id?: number
          rodada?: number
          timestamp_interacao?: string | null
          tipo_interacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_interacoes_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "casos"
            referencedColumns: ["caso_id"]
          },
        ]
      }
      logs_uso: {
        Row: {
          acao: string | null
          caso_id: string | null
          id: number
          timestamp_acao: string | null
          usuario_id: string | null
        }
        Insert: {
          acao?: string | null
          caso_id?: string | null
          id?: number
          timestamp_acao?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string | null
          caso_id?: string | null
          id?: number
          timestamp_acao?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_uso_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_melhorias: {
        Row: {
          caso_id: string
          id: number
          relatorio_completo: string
          timestamp_relatorio: string | null
        }
        Insert: {
          caso_id: string
          id?: number
          relatorio_completo: string
          timestamp_relatorio?: string | null
        }
        Update: {
          caso_id?: string
          id?: number
          relatorio_completo?: string
          timestamp_relatorio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_melhorias_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "casos"
            referencedColumns: ["caso_id"]
          },
        ]
      }
      sentencas: {
        Row: {
          analise_judicial: string
          caso_id: string
          id: number
          sentenca_final: string
          timestamp_sentenca: string | null
        }
        Insert: {
          analise_judicial: string
          caso_id: string
          id?: number
          sentenca_final: string
          timestamp_sentenca?: string | null
        }
        Update: {
          analise_judicial?: string
          caso_id?: string
          id?: number
          sentenca_final?: string
          timestamp_sentenca?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sentencas_caso_id_fkey"
            columns: ["caso_id"]
            isOneToOne: false
            referencedRelation: "casos"
            referencedColumns: ["caso_id"]
          },
        ]
      }
      usuarios: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nome: string
          peticoes_usadas: number | null
          tipo_usuario: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          nome: string
          peticoes_usadas?: number | null
          tipo_usuario?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          peticoes_usadas?: number | null
          tipo_usuario?: string | null
          updated_at?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
