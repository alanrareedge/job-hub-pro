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
          about_business: string | null;
          archived_at: string | null;
          company_registration_number: string | null;
          country: string | null;
          county: string | null;
          created_at: string;
          email: string | null;
          id: string;
          mobile: string | null;
          name: string;
          phone: string | null;
          postcode: string | null;
          public_contact_email: string | null;
          public_contact_phone: string | null;
          short_company_description: string | null;
          subscription_status: "trial" | "active" | "past_due" | "cancelled";
          town: string | null;
          trading_name: string | null;
          updated_at: string;
          vat_registration_number: string | null;
          website: string | null;
        };
        Insert: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          about_business?: string | null;
          archived_at?: string | null;
          company_registration_number?: string | null;
          country?: string | null;
          county?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          mobile?: string | null;
          name: string;
          phone?: string | null;
          postcode?: string | null;
          public_contact_email?: string | null;
          public_contact_phone?: string | null;
          short_company_description?: string | null;
          subscription_status?: "trial" | "active" | "past_due" | "cancelled";
          town?: string | null;
          trading_name?: string | null;
          updated_at?: string;
          vat_registration_number?: string | null;
          website?: string | null;
        };
        Update: {
          address_line_1?: string | null;
          address_line_2?: string | null;
          about_business?: string | null;
          archived_at?: string | null;
          company_registration_number?: string | null;
          country?: string | null;
          county?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          mobile?: string | null;
          name?: string;
          phone?: string | null;
          postcode?: string | null;
          public_contact_email?: string | null;
          public_contact_phone?: string | null;
          short_company_description?: string | null;
          subscription_status?: "trial" | "active" | "past_due" | "cancelled";
          town?: string | null;
          trading_name?: string | null;
          updated_at?: string;
          vat_registration_number?: string | null;
          website?: string | null;
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
      jobs: {
        Row: {
          archived_at: string | null;
          business_id: string;
          created_at: string;
          created_by_user_id: string | null;
          customer_id: string;
          description: string | null;
          id: string;
          priority: "low" | "normal" | "urgent";
          property_id: string;
          reference: string | null;
          status: "new" | "in_progress" | "completed" | "cancelled";
          target_date: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          business_id: string;
          created_at?: string;
          created_by_user_id?: string | null;
          customer_id: string;
          description?: string | null;
          id?: string;
          priority?: "low" | "normal" | "urgent";
          property_id: string;
          reference?: string | null;
          status?: "new" | "in_progress" | "completed" | "cancelled";
          target_date?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          business_id?: string;
          created_at?: string;
          created_by_user_id?: string | null;
          customer_id?: string;
          description?: string | null;
          id?: string;
          priority?: "low" | "normal" | "urgent";
          property_id?: string;
          reference?: string | null;
          status?: "new" | "in_progress" | "completed" | "cancelled";
          target_date?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "jobs_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "jobs_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      opportunities: {
        Row: {
          archived_at: string | null;
          business_id: string;
          created_at: string;
          created_by_user_id: string | null;
          customer_id: string;
          description: string | null;
          estimated_value: number | null;
          id: string;
          property_id: string;
          status:
            | "new"
            | "site_visit_required"
            | "pricing"
            | "proposal_sent"
            | "won"
            | "lost";
          target_date: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          business_id: string;
          created_at?: string;
          created_by_user_id?: string | null;
          customer_id: string;
          description?: string | null;
          estimated_value?: number | null;
          id?: string;
          property_id: string;
          status?:
            | "new"
            | "site_visit_required"
            | "pricing"
            | "proposal_sent"
            | "won"
            | "lost";
          target_date?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          business_id?: string;
          created_at?: string;
          created_by_user_id?: string | null;
          customer_id?: string;
          description?: string | null;
          estimated_value?: number | null;
          id?: string;
          property_id?: string;
          status?:
            | "new"
            | "site_visit_required"
            | "pricing"
            | "proposal_sent"
            | "won"
            | "lost";
          target_date?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "opportunities_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      opportunity_pricing: {
        Row: {
          archived_at: string | null;
          assumptions: string | null;
          business_id: string;
          created_at: string;
          created_by_user_id: string | null;
          customer_id: string;
          customer_outcome: string | null;
          exclusions: string | null;
          id: string;
          labour_fixed_cost: number;
          labour_hours: number;
          labour_people_count: number;
          labour_rate: number;
          labour_rate_type: "hourly" | "daily" | "fixed";
          labour_units: number;
          materials_cost: number;
          opportunity_id: string;
          other_cost: number;
          plant_cost: number;
          property_id: string;
          proposal_notes: string | null;
          risk_allowance_percent: number;
          scope_notes: string | null;
          subcontractor_cost: number;
          target_margin_percent: number;
          updated_at: string;
          updated_by_user_id: string | null;
          waste_cost: number;
          work_type: string | null;
        };
        Insert: {
          archived_at?: string | null;
          assumptions?: string | null;
          business_id: string;
          created_at?: string;
          created_by_user_id?: string | null;
          customer_id: string;
          customer_outcome?: string | null;
          exclusions?: string | null;
          id?: string;
          labour_fixed_cost?: number;
          labour_hours?: number;
          labour_people_count?: number;
          labour_rate?: number;
          labour_rate_type?: "hourly" | "daily" | "fixed";
          labour_units?: number;
          materials_cost?: number;
          opportunity_id: string;
          other_cost?: number;
          plant_cost?: number;
          property_id: string;
          proposal_notes?: string | null;
          risk_allowance_percent?: number;
          scope_notes?: string | null;
          subcontractor_cost?: number;
          target_margin_percent?: number;
          updated_at?: string;
          updated_by_user_id?: string | null;
          waste_cost?: number;
          work_type?: string | null;
        };
        Update: {
          archived_at?: string | null;
          assumptions?: string | null;
          business_id?: string;
          created_at?: string;
          created_by_user_id?: string | null;
          customer_id?: string;
          customer_outcome?: string | null;
          exclusions?: string | null;
          id?: string;
          labour_fixed_cost?: number;
          labour_hours?: number;
          labour_people_count?: number;
          labour_rate?: number;
          labour_rate_type?: "hourly" | "daily" | "fixed";
          labour_units?: number;
          materials_cost?: number;
          opportunity_id?: string;
          other_cost?: number;
          plant_cost?: number;
          property_id?: string;
          proposal_notes?: string | null;
          risk_allowance_percent?: number;
          scope_notes?: string | null;
          subcontractor_cost?: number;
          target_margin_percent?: number;
          updated_at?: string;
          updated_by_user_id?: string | null;
          waste_cost?: number;
          work_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "opportunity_pricing_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunity_pricing_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunity_pricing_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunity_pricing_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunity_pricing_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunity_pricing_updated_by_user_id_fkey";
            columns: ["updated_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      proposal_options: {
        Row: {
          archived_at: string | null;
          business_id: string;
          created_at: string;
          description: string | null;
          id: string;
          is_recommended: boolean;
          label: string;
          option_number: number;
          price: number;
          proposal_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          archived_at?: string | null;
          business_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_recommended?: boolean;
          label: string;
          option_number: number;
          price?: number;
          proposal_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          archived_at?: string | null;
          business_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_recommended?: boolean;
          label?: string;
          option_number?: number;
          price?: number;
          proposal_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "proposal_options_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposal_options_proposal_id_fkey";
            columns: ["proposal_id"];
            isOneToOne: false;
            referencedRelation: "proposals";
            referencedColumns: ["id"];
          },
        ];
      };
      proposals: {
        Row: {
          archived_at: string | null;
          business_id: string;
          created_at: string;
          created_by_user_id: string | null;
          customer_id: string;
          id: string;
          internal_reference: string | null;
          is_current: boolean;
          opportunity_id: string;
          pricing_id: string;
          property_id: string;
          proposal_number: string;
          recommended_option_number: number;
          section_assumptions: string | null;
          section_exclusions: string | null;
          section_next_steps: string | null;
          section_recommendation: string | null;
          section_scope: string | null;
          section_understanding: string | null;
          sections_updated_at: string | null;
          sections_updated_by_user_id: string | null;
          snapshot_business_address_line_1: string | null;
          snapshot_business_address_line_2: string | null;
          snapshot_business_company_registration_number: string | null;
          snapshot_business_contact_email: string | null;
          snapshot_business_contact_phone: string | null;
          snapshot_business_country: string | null;
          snapshot_business_county: string | null;
          snapshot_business_name: string;
          snapshot_business_postcode: string | null;
          snapshot_business_short_company_description: string | null;
          snapshot_business_town: string | null;
          snapshot_business_trading_name: string | null;
          snapshot_business_vat_registration_number: string | null;
          snapshot_customer_email: string | null;
          snapshot_customer_first_name: string;
          snapshot_customer_last_name: string;
          snapshot_customer_phone: string | null;
          snapshot_opportunity_description: string | null;
          snapshot_opportunity_estimated_value: number | null;
          snapshot_opportunity_status: string;
          snapshot_opportunity_target_date: string | null;
          snapshot_opportunity_title: string;
          snapshot_pricing_assumptions: string | null;
          snapshot_pricing_cost_before_profit: number;
          snapshot_pricing_customer_outcome: string | null;
          snapshot_pricing_exclusions: string | null;
          snapshot_pricing_profit_target_percent: number;
          snapshot_pricing_projected_profit: number;
          snapshot_pricing_proposal_notes: string | null;
          snapshot_pricing_recommended_selling_price: number;
          snapshot_pricing_scope_notes: string | null;
          snapshot_pricing_work_type: string | null;
          snapshot_property_address_line_1: string;
          snapshot_property_address_line_2: string | null;
          snapshot_property_county: string | null;
          snapshot_property_name: string | null;
          snapshot_property_postcode: string;
          snapshot_property_town: string | null;
          status:
            | "draft"
            | "ready_to_send"
            | "sent"
            | "viewed"
            | "accepted"
            | "declined"
            | "expired"
            | "archived";
          structure_type: "single" | "two_options" | "three_options";
          title: string;
          updated_at: string;
          updated_by_user_id: string | null;
          valid_until: string;
          version_number: number;
        };
        Insert: {
          archived_at?: string | null;
          business_id: string;
          created_at?: string;
          created_by_user_id?: string | null;
          customer_id: string;
          id?: string;
          internal_reference?: string | null;
          is_current?: boolean;
          opportunity_id: string;
          pricing_id: string;
          property_id: string;
          proposal_number?: string;
          recommended_option_number?: number;
          section_assumptions?: string | null;
          section_exclusions?: string | null;
          section_next_steps?: string | null;
          section_recommendation?: string | null;
          section_scope?: string | null;
          section_understanding?: string | null;
          sections_updated_at?: string | null;
          sections_updated_by_user_id?: string | null;
          snapshot_business_address_line_1?: string | null;
          snapshot_business_address_line_2?: string | null;
          snapshot_business_company_registration_number?: string | null;
          snapshot_business_contact_email?: string | null;
          snapshot_business_contact_phone?: string | null;
          snapshot_business_country?: string | null;
          snapshot_business_county?: string | null;
          snapshot_business_name: string;
          snapshot_business_postcode?: string | null;
          snapshot_business_short_company_description?: string | null;
          snapshot_business_town?: string | null;
          snapshot_business_trading_name?: string | null;
          snapshot_business_vat_registration_number?: string | null;
          snapshot_customer_email?: string | null;
          snapshot_customer_first_name: string;
          snapshot_customer_last_name: string;
          snapshot_customer_phone?: string | null;
          snapshot_opportunity_description?: string | null;
          snapshot_opportunity_estimated_value?: number | null;
          snapshot_opportunity_status: string;
          snapshot_opportunity_target_date?: string | null;
          snapshot_opportunity_title: string;
          snapshot_pricing_assumptions?: string | null;
          snapshot_pricing_cost_before_profit?: number;
          snapshot_pricing_customer_outcome?: string | null;
          snapshot_pricing_exclusions?: string | null;
          snapshot_pricing_profit_target_percent?: number;
          snapshot_pricing_projected_profit?: number;
          snapshot_pricing_proposal_notes?: string | null;
          snapshot_pricing_recommended_selling_price?: number;
          snapshot_pricing_scope_notes?: string | null;
          snapshot_pricing_work_type?: string | null;
          snapshot_property_address_line_1: string;
          snapshot_property_address_line_2?: string | null;
          snapshot_property_county?: string | null;
          snapshot_property_name?: string | null;
          snapshot_property_postcode: string;
          snapshot_property_town?: string | null;
          status?:
            | "draft"
            | "ready_to_send"
            | "sent"
            | "viewed"
            | "accepted"
            | "declined"
            | "expired"
            | "archived";
          structure_type?: "single" | "two_options" | "three_options";
          title: string;
          updated_at?: string;
          updated_by_user_id?: string | null;
          valid_until: string;
          version_number?: number;
        };
        Update: {
          archived_at?: string | null;
          business_id?: string;
          created_at?: string;
          created_by_user_id?: string | null;
          customer_id?: string;
          id?: string;
          internal_reference?: string | null;
          is_current?: boolean;
          opportunity_id?: string;
          pricing_id?: string;
          property_id?: string;
          proposal_number?: string;
          recommended_option_number?: number;
          section_assumptions?: string | null;
          section_exclusions?: string | null;
          section_next_steps?: string | null;
          section_recommendation?: string | null;
          section_scope?: string | null;
          section_understanding?: string | null;
          sections_updated_at?: string | null;
          sections_updated_by_user_id?: string | null;
          snapshot_business_address_line_1?: string | null;
          snapshot_business_address_line_2?: string | null;
          snapshot_business_company_registration_number?: string | null;
          snapshot_business_contact_email?: string | null;
          snapshot_business_contact_phone?: string | null;
          snapshot_business_country?: string | null;
          snapshot_business_county?: string | null;
          snapshot_business_name?: string;
          snapshot_business_postcode?: string | null;
          snapshot_business_short_company_description?: string | null;
          snapshot_business_town?: string | null;
          snapshot_business_trading_name?: string | null;
          snapshot_business_vat_registration_number?: string | null;
          snapshot_customer_email?: string | null;
          snapshot_customer_first_name?: string;
          snapshot_customer_last_name?: string;
          snapshot_customer_phone?: string | null;
          snapshot_opportunity_description?: string | null;
          snapshot_opportunity_estimated_value?: number | null;
          snapshot_opportunity_status?: string;
          snapshot_opportunity_target_date?: string | null;
          snapshot_opportunity_title?: string;
          snapshot_pricing_assumptions?: string | null;
          snapshot_pricing_cost_before_profit?: number;
          snapshot_pricing_customer_outcome?: string | null;
          snapshot_pricing_exclusions?: string | null;
          snapshot_pricing_profit_target_percent?: number;
          snapshot_pricing_projected_profit?: number;
          snapshot_pricing_proposal_notes?: string | null;
          snapshot_pricing_recommended_selling_price?: number;
          snapshot_pricing_scope_notes?: string | null;
          snapshot_pricing_work_type?: string | null;
          snapshot_property_address_line_1?: string;
          snapshot_property_address_line_2?: string | null;
          snapshot_property_county?: string | null;
          snapshot_property_name?: string | null;
          snapshot_property_postcode?: string;
          snapshot_property_town?: string | null;
          status?:
            | "draft"
            | "ready_to_send"
            | "sent"
            | "viewed"
            | "accepted"
            | "declined"
            | "expired"
            | "archived";
          structure_type?: "single" | "two_options" | "three_options";
          title?: string;
          updated_at?: string;
          updated_by_user_id?: string | null;
          valid_until?: string;
          version_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "proposals_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "opportunities";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_pricing_id_fkey";
            columns: ["pricing_id"];
            isOneToOne: false;
            referencedRelation: "opportunity_pricing";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_sections_updated_by_user_id_fkey";
            columns: ["sections_updated_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "proposals_updated_by_user_id_fkey";
            columns: ["updated_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      properties: {
        Row: {
          access_notes: string | null;
          address_line_1: string;
          address_line_2: string | null;
          archived_at: string | null;
          business_id: string;
          county: string | null;
          created_at: string;
          created_by_user_id: string | null;
          customer_id: string;
          id: string;
          notes: string | null;
          postcode: string;
          property_name: string | null;
          town: string | null;
          updated_at: string;
        };
        Insert: {
          access_notes?: string | null;
          address_line_1: string;
          address_line_2?: string | null;
          archived_at?: string | null;
          business_id: string;
          county?: string | null;
          created_at?: string;
          created_by_user_id?: string | null;
          customer_id: string;
          id?: string;
          notes?: string | null;
          postcode: string;
          property_name?: string | null;
          town?: string | null;
          updated_at?: string;
        };
        Update: {
          access_notes?: string | null;
          address_line_1?: string;
          address_line_2?: string | null;
          archived_at?: string | null;
          business_id?: string;
          county?: string | null;
          created_at?: string;
          created_by_user_id?: string | null;
          customer_id?: string;
          id?: string;
          notes?: string | null;
          postcode?: string;
          property_name?: string | null;
          town?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "properties_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
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
