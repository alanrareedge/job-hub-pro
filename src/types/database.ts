export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          business_id: string;
          created_at: string;
          details: Json;
          entity_id: string | null;
          entity_type: string;
          id: string;
          ip_address: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          business_id: string;
          created_at?: string;
          details?: Json;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "audit_logs_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      businesses: {
        Row: {
          address_line_1: string | null;
          address_line_2: string | null;
          archived_at: string | null;
          created_at: string;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          postcode: string | null;
          subscription_status: "trial" | "active" | "past_due" | "cancelled";
          town: string | null;
          updated_at: string;
        };
        Insert: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          archived_at?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name: string;
          phone?: string | null;
          postcode?: string | null;
          subscription_status?: "trial" | "active" | "past_due" | "cancelled";
          town?: string | null;
          updated_at?: string;
        };
        Update: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          archived_at?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          postcode?: string | null;
          subscription_status?: "trial" | "active" | "past_due" | "cancelled";
          town?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          archived_at: string | null;
          business_id: string;
          created_at: string;
          created_by_user_id: string | null;
          email: string | null;
          first_name: string;
          id: string;
          last_name: string;
          notes: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          business_id: string;
          created_at?: string;
          created_by_user_id?: string | null;
          email?: string | null;
          first_name: string;
          id?: string;
          last_name: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          business_id?: string;
          created_at?: string;
          created_by_user_id?: string | null;
          email?: string | null;
          first_name?: string;
          id?: string;
          last_name?: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "customers_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          archived_at: string | null;
          auth_user_id: string;
          business_id: string;
          created_at: string;
          email: string;
          id: string;
          last_login_at: string | null;
          name: string | null;
          role: "owner" | "office" | "operative";
          status: "active" | "invited" | "disabled";
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          auth_user_id: string;
          business_id: string;
          created_at?: string;
          email: string;
          id?: string;
          last_login_at?: string | null;
          name?: string | null;
          role: "owner" | "office" | "operative";
          status?: "active" | "invited" | "disabled";
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          auth_user_id?: string;
          business_id?: string;
          created_at?: string;
          email?: string;
          id?: string;
          last_login_at?: string | null;
          name?: string | null;
          role?: "owner" | "office" | "operative";
          status?: "active" | "invited" | "disabled";
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
    Functions: {
      current_business_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      current_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: "owner" | "office" | "operative" | null;
      };
      is_owner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};
