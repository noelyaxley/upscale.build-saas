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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      action_items: {
        Row: {
          assigned_to_user_id: string | null
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          description: string
          due_date: string | null
          id: string
          org_id: string
          project_id: string
          status: Database["public"]["Enums"]["action_status"]
          updated_at: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description: string
          due_date?: string | null
          id?: string
          org_id: string
          project_id: string
          status?: Database["public"]["Enums"]["action_status"]
          updated_at?: string
        }
        Update: {
          assigned_to_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string
          due_date?: string | null
          id?: string
          org_id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["action_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_items_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_line_items: {
        Row: {
          certified_this_claim: number
          claim_id: string
          contract_item_id: string | null
          contract_value: number
          created_at: string
          description: string
          id: string
          percent_complete: number | null
          previous_claimed: number
          sort_order: number | null
          this_claim: number
          total_claimed: number
        }
        Insert: {
          certified_this_claim?: number
          claim_id: string
          contract_item_id?: string | null
          contract_value?: number
          created_at?: string
          description: string
          id?: string
          percent_complete?: number | null
          previous_claimed?: number
          sort_order?: number | null
          this_claim?: number
          total_claimed?: number
        }
        Update: {
          certified_this_claim?: number
          claim_id?: string
          contract_item_id?: string | null
          contract_value?: number
          created_at?: string
          description?: string
          id?: string
          percent_complete?: number | null
          previous_claimed?: number
          sort_order?: number | null
          this_claim?: number
          total_claimed?: number
        }
        Relationships: [
          {
            foreignKeyName: "claim_line_items_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "progress_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_line_items_contract_item_id_fkey"
            columns: ["contract_item_id"]
            isOneToOne: false
            referencedRelation: "contract_items"
            referencedColumns: ["id"]
          },
        ]
      }
      client_portal_links: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          name: string
          org_id: string
          project_id: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id: string
          project_id: string
          token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          name?: string
          org_id?: string
          project_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_portal_links_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_links_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_portal_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          abn: string | null
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          org_id: string
          phone: string | null
          type: string
          updated_at: string
        }
        Insert: {
          abn?: string | null
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          org_id: string
          phone?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          abn?: string | null
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          org_id?: string
          phone?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "companies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultant_phases: {
        Row: {
          amount_paid: number
          consultant_id: string
          created_at: string
          disbursements: number
          fee: number
          id: string
          notes: string | null
          phase_name: string
          sort_order: number | null
          status: Database["public"]["Enums"]["phase_status"]
          updated_at: string
          variations: number
        }
        Insert: {
          amount_paid?: number
          consultant_id: string
          created_at?: string
          disbursements?: number
          fee?: number
          id?: string
          notes?: string | null
          phase_name: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["phase_status"]
          updated_at?: string
          variations?: number
        }
        Update: {
          amount_paid?: number
          consultant_id?: string
          created_at?: string
          disbursements?: number
          fee?: number
          id?: string
          notes?: string | null
          phase_name?: string
          sort_order?: number | null
          status?: Database["public"]["Enums"]["phase_status"]
          updated_at?: string
          variations?: number
        }
        Relationships: [
          {
            foreignKeyName: "consultant_phases_consultant_id_fkey"
            columns: ["consultant_id"]
            isOneToOne: false
            referencedRelation: "consultants"
            referencedColumns: ["id"]
          },
        ]
      }
      consultants: {
        Row: {
          budget: number | null
          company_id: string | null
          consultant_number: number
          contract_ref: string | null
          contract_value: number | null
          created_at: string
          created_by_user_id: string | null
          discipline: string
          id: string
          notes: string | null
          org_id: string
          project_id: string
          status: Database["public"]["Enums"]["consultant_status"]
          updated_at: string
        }
        Insert: {
          budget?: number | null
          company_id?: string | null
          consultant_number: number
          contract_ref?: string | null
          contract_value?: number | null
          created_at?: string
          created_by_user_id?: string | null
          discipline: string
          id?: string
          notes?: string | null
          org_id: string
          project_id: string
          status?: Database["public"]["Enums"]["consultant_status"]
          updated_at?: string
        }
        Update: {
          budget?: number | null
          company_id?: string | null
          consultant_number?: number
          contract_ref?: string | null
          contract_value?: number | null
          created_at?: string
          created_by_user_id?: string | null
          discipline?: string
          id?: string
          notes?: string | null
          org_id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["consultant_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultants_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultants_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultants_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_items: {
        Row: {
          contract_id: string
          contract_value: number
          created_at: string
          description: string
          id: string
          parent_id: string | null
          sort_order: number
          updated_at: string
          variation_id: string | null
        }
        Insert: {
          contract_id: string
          contract_value?: number
          created_at?: string
          description: string
          id?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
          variation_id?: string | null
        }
        Update: {
          contract_id?: string
          contract_value?: number
          created_at?: string
          description?: string
          id?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
          variation_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_items_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "contract_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_items_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "variations"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          company_id: string | null
          contract_number: number
          contract_ref: string | null
          contract_value: number
          created_at: string
          created_by_user_id: string | null
          description: string | null
          id: string
          name: string
          org_id: string
          project_id: string
          status: Database["public"]["Enums"]["contract_status"]
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          contract_number: number
          contract_ref?: string | null
          contract_value?: number
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          name: string
          org_id: string
          project_id: string
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          contract_number?: number
          contract_ref?: string | null
          contract_value?: number
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          name?: string
          org_id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["contract_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          decided_by_user_id: string | null
          decision_date: string | null
          description: string
          due_date: string | null
          id: string
          notes: string | null
          org_id: string
          project_id: string
          status: Database["public"]["Enums"]["decision_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          decided_by_user_id?: string | null
          decision_date?: string | null
          description: string
          due_date?: string | null
          id?: string
          notes?: string | null
          org_id: string
          project_id: string
          status?: Database["public"]["Enums"]["decision_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          decided_by_user_id?: string | null
          decision_date?: string | null
          description?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["decision_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_decided_by_user_id_fkey"
            columns: ["decided_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      defects: {
        Row: {
          assigned_to_company_id: string | null
          contractor_comment: string | null
          contractor_photo_url: string | null
          created_at: string
          date_closed: string | null
          date_contractor_complete: string | null
          defect_number: number
          description: string | null
          id: string
          location: string | null
          name: string
          org_id: string
          photo_url: string | null
          project_id: string
          reported_by_user_id: string | null
          status: Database["public"]["Enums"]["defect_status"]
          updated_at: string
        }
        Insert: {
          assigned_to_company_id?: string | null
          contractor_comment?: string | null
          contractor_photo_url?: string | null
          created_at?: string
          date_closed?: string | null
          date_contractor_complete?: string | null
          defect_number: number
          description?: string | null
          id?: string
          location?: string | null
          name: string
          org_id: string
          photo_url?: string | null
          project_id: string
          reported_by_user_id?: string | null
          status?: Database["public"]["Enums"]["defect_status"]
          updated_at?: string
        }
        Update: {
          assigned_to_company_id?: string | null
          contractor_comment?: string | null
          contractor_photo_url?: string | null
          created_at?: string
          date_closed?: string | null
          date_contractor_complete?: string | null
          defect_number?: number
          description?: string | null
          id?: string
          location?: string | null
          name?: string
          org_id?: string
          photo_url?: string | null
          project_id?: string
          reported_by_user_id?: string | null
          status?: Database["public"]["Enums"]["defect_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "defects_assigned_to_company_id_fkey"
            columns: ["assigned_to_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "defects_reported_by_user_id_fkey"
            columns: ["reported_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_equipment_entries: {
        Row: {
          company_id: string | null
          created_at: string
          diary_entry_id: string
          equipment_name: string
          hours_used: number | null
          id: string
          notes: string | null
          quantity: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          diary_entry_id: string
          equipment_name: string
          hours_used?: number | null
          id?: string
          notes?: string | null
          quantity?: number
        }
        Update: {
          company_id?: string | null
          created_at?: string
          diary_entry_id?: string
          equipment_name?: string
          hours_used?: number | null
          id?: string
          notes?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "diary_equipment_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diary_equipment_entries_diary_entry_id_fkey"
            columns: ["diary_entry_id"]
            isOneToOne: false
            referencedRelation: "site_diary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_labor_entries: {
        Row: {
          company_id: string | null
          created_at: string
          diary_entry_id: string
          hours_worked: number
          id: string
          notes: string | null
          trade: string
          worker_count: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          diary_entry_id: string
          hours_worked?: number
          id?: string
          notes?: string | null
          trade: string
          worker_count?: number
        }
        Update: {
          company_id?: string | null
          created_at?: string
          diary_entry_id?: string
          hours_worked?: number
          id?: string
          notes?: string | null
          trade?: string
          worker_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "diary_labor_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diary_labor_entries_diary_entry_id_fkey"
            columns: ["diary_entry_id"]
            isOneToOne: false
            referencedRelation: "site_diary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_visitors: {
        Row: {
          company: string | null
          created_at: string
          diary_entry_id: string
          id: string
          purpose: string | null
          time_in: string | null
          time_out: string | null
          visitor_name: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          diary_entry_id: string
          id?: string
          purpose?: string | null
          time_in?: string | null
          time_out?: string | null
          visitor_name: string
        }
        Update: {
          company?: string | null
          created_at?: string
          diary_entry_id?: string
          id?: string
          purpose?: string | null
          time_in?: string | null
          time_out?: string | null
          visitor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_visitors_diary_entry_id_fkey"
            columns: ["diary_entry_id"]
            isOneToOne: false
            referencedRelation: "site_diary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      document_folders: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          id: string
          name: string
          org_id: string
          parent_folder_id: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          name: string
          org_id: string
          parent_folder_id?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          name?: string
          org_id?: string
          parent_folder_id?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_folders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          current_revision: string | null
          discipline: string | null
          document_number: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          folder_id: string | null
          id: string
          org_id: string
          project_id: string
          title: string
          updated_at: string
          uploaded_at: string
          uploaded_by_user_id: string | null
        }
        Insert: {
          created_at?: string
          current_revision?: string | null
          discipline?: string | null
          document_number: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          folder_id?: string | null
          id?: string
          org_id: string
          project_id: string
          title: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by_user_id?: string | null
        }
        Update: {
          created_at?: string
          current_revision?: string | null
          discipline?: string | null
          document_number?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          folder_id?: string | null
          id?: string
          org_id?: string
          project_id?: string
          title?: string
          updated_at?: string
          uploaded_at?: string
          uploaded_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_user_id_fkey"
            columns: ["uploaded_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dropbox_connections: {
        Row: {
          access_token_encrypted: string
          connected_by_user_id: string | null
          created_at: string
          dropbox_account_id: string
          dropbox_folder_id: string | null
          dropbox_folder_path: string | null
          id: string
          org_id: string
          project_id: string
          refresh_token_encrypted: string
          token_expires_at: string
          updated_at: string
        }
        Insert: {
          access_token_encrypted: string
          connected_by_user_id?: string | null
          created_at?: string
          dropbox_account_id: string
          dropbox_folder_id?: string | null
          dropbox_folder_path?: string | null
          id?: string
          org_id: string
          project_id: string
          refresh_token_encrypted: string
          token_expires_at: string
          updated_at?: string
        }
        Update: {
          access_token_encrypted?: string
          connected_by_user_id?: string | null
          created_at?: string
          dropbox_account_id?: string
          dropbox_folder_id?: string | null
          dropbox_folder_path?: string | null
          id?: string
          org_id?: string
          project_id?: string
          refresh_token_encrypted?: string
          token_expires_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dropbox_connections_connected_by_user_id_fkey"
            columns: ["connected_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dropbox_connections_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dropbox_connections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      extension_of_time: {
        Row: {
          approved_at: string | null
          approved_by_user_id: string | null
          attachments: string[] | null
          created_at: string
          created_by_user_id: string | null
          days_approved: number | null
          days_claimed: number
          delay_end_date: string | null
          delay_start_date: string | null
          description: string | null
          eot_number: number
          id: string
          new_completion_date: string | null
          org_id: string
          original_completion_date: string | null
          project_id: string
          reason: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["eot_status"]
          submitted_at: string | null
          submitted_by_company_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          attachments?: string[] | null
          created_at?: string
          created_by_user_id?: string | null
          days_approved?: number | null
          days_claimed?: number
          delay_end_date?: string | null
          delay_start_date?: string | null
          description?: string | null
          eot_number?: number
          id?: string
          new_completion_date?: string | null
          org_id: string
          original_completion_date?: string | null
          project_id: string
          reason?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["eot_status"]
          submitted_at?: string | null
          submitted_by_company_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          attachments?: string[] | null
          created_at?: string
          created_by_user_id?: string | null
          days_approved?: number | null
          days_claimed?: number
          delay_end_date?: string | null
          delay_start_date?: string | null
          description?: string | null
          eot_number?: number
          id?: string
          new_completion_date?: string | null
          org_id?: string
          original_completion_date?: string | null
          project_id?: string
          reason?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["eot_status"]
          submitted_at?: string | null
          submitted_by_company_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extension_of_time_approved_by_user_id_fkey"
            columns: ["approved_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extension_of_time_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extension_of_time_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extension_of_time_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extension_of_time_submitted_by_company_id_fkey"
            columns: ["submitted_by_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      feasibility_debt_facilities: {
        Row: {
          calculation_type: string | null
          created_at: string
          id: string
          interest_provision: number | null
          interest_rate: number | null
          lvr_method: string | null
          lvr_pct: number | null
          name: string
          priority: string | null
          scenario_id: string
          sort_order: number | null
          term_months: number | null
          total_facility: number | null
          updated_at: string
        }
        Insert: {
          calculation_type?: string | null
          created_at?: string
          id?: string
          interest_provision?: number | null
          interest_rate?: number | null
          lvr_method?: string | null
          lvr_pct?: number | null
          name?: string
          priority?: string | null
          scenario_id: string
          sort_order?: number | null
          term_months?: number | null
          total_facility?: number | null
          updated_at?: string
        }
        Update: {
          calculation_type?: string | null
          created_at?: string
          id?: string
          interest_provision?: number | null
          interest_rate?: number | null
          lvr_method?: string | null
          lvr_pct?: number | null
          name?: string
          priority?: string | null
          scenario_id?: string
          sort_order?: number | null
          term_months?: number | null
          total_facility?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feasibility_debt_facilities_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "feasibility_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      feasibility_debt_loans: {
        Row: {
          created_at: string
          id: string
          interest_rate: number | null
          loan_type: string | null
          name: string
          payment_period: string | null
          principal_amount: number | null
          scenario_id: string
          sort_order: number | null
          term_months: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          interest_rate?: number | null
          loan_type?: string | null
          name?: string
          payment_period?: string | null
          principal_amount?: number | null
          scenario_id: string
          sort_order?: number | null
          term_months?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          interest_rate?: number | null
          loan_type?: string | null
          name?: string
          payment_period?: string | null
          principal_amount?: number | null
          scenario_id?: string
          sort_order?: number | null
          term_months?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feasibility_debt_loans_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "feasibility_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      feasibility_equity_partners: {
        Row: {
          created_at: string
          distribution_type: string | null
          equity_amount: number | null
          id: string
          is_developer_equity: boolean | null
          name: string
          return_percentage: number | null
          scenario_id: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          distribution_type?: string | null
          equity_amount?: number | null
          id?: string
          is_developer_equity?: boolean | null
          name?: string
          return_percentage?: number | null
          scenario_id: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          distribution_type?: string | null
          equity_amount?: number | null
          id?: string
          is_developer_equity?: boolean | null
          name?: string
          return_percentage?: number | null
          scenario_id?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feasibility_equity_partners_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "feasibility_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      feasibility_land_lots: {
        Row: {
          address: string | null
          created_at: string
          deposit_amount: number | null
          deposit_pct: number | null
          entity_gst_registered: boolean | null
          id: string
          land_purchase_gst_included: boolean | null
          land_rate: number | null
          land_size_m2: number | null
          margin_scheme_applied: boolean | null
          name: string
          postcode: string | null
          purchase_price: number | null
          scenario_id: string
          sort_order: number | null
          state: string | null
          suburb: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          deposit_amount?: number | null
          deposit_pct?: number | null
          entity_gst_registered?: boolean | null
          id?: string
          land_purchase_gst_included?: boolean | null
          land_rate?: number | null
          land_size_m2?: number | null
          margin_scheme_applied?: boolean | null
          name?: string
          postcode?: string | null
          purchase_price?: number | null
          scenario_id: string
          sort_order?: number | null
          state?: string | null
          suburb?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          deposit_amount?: number | null
          deposit_pct?: number | null
          entity_gst_registered?: boolean | null
          id?: string
          land_purchase_gst_included?: boolean | null
          land_rate?: number | null
          land_size_m2?: number | null
          margin_scheme_applied?: boolean | null
          name?: string
          postcode?: string | null
          purchase_price?: number | null
          scenario_id?: string
          sort_order?: number | null
          state?: string | null
          suburb?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feasibility_land_lots_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "feasibility_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      feasibility_line_items: {
        Row: {
          amount_ex_gst: number | null
          cashflow_span_months: number | null
          cashflow_start_month: number | null
          created_at: string
          gst_status: string | null
          id: string
          land_lot_id: string | null
          name: string
          parent_entity_id: string | null
          quantity: number | null
          rate: number | null
          rate_type: string | null
          scenario_id: string
          section: string
          sort_order: number | null
          tab_name: string
          updated_at: string
        }
        Insert: {
          amount_ex_gst?: number | null
          cashflow_span_months?: number | null
          cashflow_start_month?: number | null
          created_at?: string
          gst_status?: string | null
          id?: string
          land_lot_id?: string | null
          name?: string
          parent_entity_id?: string | null
          quantity?: number | null
          rate?: number | null
          rate_type?: string | null
          scenario_id: string
          section: string
          sort_order?: number | null
          tab_name?: string
          updated_at?: string
        }
        Update: {
          amount_ex_gst?: number | null
          cashflow_span_months?: number | null
          cashflow_start_month?: number | null
          created_at?: string
          gst_status?: string | null
          id?: string
          land_lot_id?: string | null
          name?: string
          parent_entity_id?: string | null
          quantity?: number | null
          rate?: number | null
          rate_type?: string | null
          scenario_id?: string
          section?: string
          sort_order?: number | null
          tab_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feasibility_line_items_land_lot_id_fkey"
            columns: ["land_lot_id"]
            isOneToOne: false
            referencedRelation: "feasibility_land_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feasibility_line_items_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "feasibility_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      feasibility_sales_units: {
        Row: {
          amount_ex_gst: number | null
          area_m2: number | null
          bathrooms: number | null
          bedrooms: number | null
          car_spaces: number | null
          created_at: string
          gst_status: string | null
          id: string
          name: string
          sale_price: number | null
          scenario_id: string
          sort_order: number | null
          status: string | null
          tab_name: string
          updated_at: string
        }
        Insert: {
          amount_ex_gst?: number | null
          area_m2?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          car_spaces?: number | null
          created_at?: string
          gst_status?: string | null
          id?: string
          name?: string
          sale_price?: number | null
          scenario_id: string
          sort_order?: number | null
          status?: string | null
          tab_name?: string
          updated_at?: string
        }
        Update: {
          amount_ex_gst?: number | null
          area_m2?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          car_spaces?: number | null
          created_at?: string
          gst_status?: string | null
          id?: string
          name?: string
          sale_price?: number | null
          scenario_id?: string
          sort_order?: number | null
          status?: string | null
          tab_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feasibility_sales_units_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "feasibility_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      feasibility_scenarios: {
        Row: {
          construction_cost: number | null
          contingency: number | null
          created_at: string
          created_by_user_id: string | null
          development_type: string | null
          efficiency: number | null
          finance_costs: number | null
          fsr: number | null
          gfa: number | null
          id: string
          marketing_costs: number | null
          max_height: number | null
          name: string
          notes: string | null
          nsa: number | null
          org_id: string
          professional_fees: number | null
          profit: number | null
          profit_on_cost: number | null
          project_id: string
          project_length_months: number | null
          project_lots: number | null
          sale_rate: number | null
          site_area: number | null
          site_cost: number | null
          start_date: string | null
          state: string | null
          statutory_fees: number | null
          total_costs: number | null
          total_revenue: number | null
          updated_at: string
          zoning: string | null
        }
        Insert: {
          construction_cost?: number | null
          contingency?: number | null
          created_at?: string
          created_by_user_id?: string | null
          development_type?: string | null
          efficiency?: number | null
          finance_costs?: number | null
          fsr?: number | null
          gfa?: number | null
          id?: string
          marketing_costs?: number | null
          max_height?: number | null
          name: string
          notes?: string | null
          nsa?: number | null
          org_id: string
          professional_fees?: number | null
          profit?: number | null
          profit_on_cost?: number | null
          project_id: string
          project_length_months?: number | null
          project_lots?: number | null
          sale_rate?: number | null
          site_area?: number | null
          site_cost?: number | null
          start_date?: string | null
          state?: string | null
          statutory_fees?: number | null
          total_costs?: number | null
          total_revenue?: number | null
          updated_at?: string
          zoning?: string | null
        }
        Update: {
          construction_cost?: number | null
          contingency?: number | null
          created_at?: string
          created_by_user_id?: string | null
          development_type?: string | null
          efficiency?: number | null
          finance_costs?: number | null
          fsr?: number | null
          gfa?: number | null
          id?: string
          marketing_costs?: number | null
          max_height?: number | null
          name?: string
          notes?: string | null
          nsa?: number | null
          org_id?: string
          professional_fees?: number | null
          profit?: number | null
          profit_on_cost?: number | null
          project_id?: string
          project_length_months?: number | null
          project_lots?: number | null
          sale_rate?: number | null
          site_area?: number | null
          site_cost?: number | null
          start_date?: string | null
          state?: string | null
          statutory_fees?: number | null
          total_costs?: number | null
          total_revenue?: number | null
          updated_at?: string
          zoning?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feasibility_scenarios_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feasibility_scenarios_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feasibility_scenarios_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          aspect: string | null
          bathrooms: number | null
          bedrooms: number | null
          car_spaces: number | null
          created_at: string
          created_by_user_id: string | null
          external_area: number | null
          id: string
          internal_area: number | null
          level: number | null
          list_price: number | null
          lot_number: string
          notes: string | null
          org_id: string
          project_id: string
          sold_price: number | null
          status: Database["public"]["Enums"]["lot_status"]
          total_area: number | null
          updated_at: string
        }
        Insert: {
          aspect?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          car_spaces?: number | null
          created_at?: string
          created_by_user_id?: string | null
          external_area?: number | null
          id?: string
          internal_area?: number | null
          level?: number | null
          list_price?: number | null
          lot_number: string
          notes?: string | null
          org_id: string
          project_id: string
          sold_price?: number | null
          status?: Database["public"]["Enums"]["lot_status"]
          total_area?: number | null
          updated_at?: string
        }
        Update: {
          aspect?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          car_spaces?: number | null
          created_at?: string
          created_by_user_id?: string | null
          external_area?: number | null
          id?: string
          internal_area?: number | null
          level?: number | null
          list_price?: number | null
          lot_number?: string
          notes?: string | null
          org_id?: string
          project_id?: string
          sold_price?: number | null
          status?: Database["public"]["Enums"]["lot_status"]
          total_area?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lots_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          org_id: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          org_id?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          org_id?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_dependencies: {
        Row: {
          created_at: string
          dependency_type: string
          id: string
          lag_days: number
          predecessor_id: string
          successor_id: string
        }
        Insert: {
          created_at?: string
          dependency_type?: string
          id?: string
          lag_days?: number
          predecessor_id: string
          successor_id: string
        }
        Update: {
          created_at?: string
          dependency_type?: string
          id?: string
          lag_days?: number
          predecessor_id?: string
          successor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_dependencies_predecessor_id_fkey"
            columns: ["predecessor_id"]
            isOneToOne: false
            referencedRelation: "programme_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programme_dependencies_successor_id_fkey"
            columns: ["successor_id"]
            isOneToOne: false
            referencedRelation: "programme_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      programme_tasks: {
        Row: {
          color: string | null
          created_at: string
          created_by_user_id: string | null
          end_date: string
          id: string
          name: string
          notes: string | null
          org_id: string
          parent_id: string | null
          progress: number
          project_id: string
          sort_order: number
          start_date: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by_user_id?: string | null
          end_date: string
          id?: string
          name: string
          notes?: string | null
          org_id: string
          parent_id?: string | null
          progress?: number
          project_id: string
          sort_order?: number
          start_date: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by_user_id?: string | null
          end_date?: string
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          parent_id?: string | null
          progress?: number
          project_id?: string
          sort_order?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programme_tasks_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programme_tasks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programme_tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "programme_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programme_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_claims: {
        Row: {
          certification_notes: string | null
          certified_amount: number | null
          certified_at: string | null
          certified_by_user_id: string | null
          claim_number: number
          claimed_amount: number
          contract_id: string | null
          created_at: string
          created_by_user_id: string | null
          id: string
          notes: string | null
          org_id: string
          paid_at: string | null
          period_end: string
          period_start: string
          previous_claims_total: number
          project_id: string
          status: Database["public"]["Enums"]["claim_status"]
          submitted_at: string | null
          submitted_by_company_id: string | null
          updated_at: string
        }
        Insert: {
          certification_notes?: string | null
          certified_amount?: number | null
          certified_at?: string | null
          certified_by_user_id?: string | null
          claim_number: number
          claimed_amount?: number
          contract_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          notes?: string | null
          org_id: string
          paid_at?: string | null
          period_end: string
          period_start: string
          previous_claims_total?: number
          project_id: string
          status?: Database["public"]["Enums"]["claim_status"]
          submitted_at?: string | null
          submitted_by_company_id?: string | null
          updated_at?: string
        }
        Update: {
          certification_notes?: string | null
          certified_amount?: number | null
          certified_at?: string | null
          certified_by_user_id?: string | null
          claim_number?: number
          claimed_amount?: number
          contract_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          previous_claims_total?: number
          project_id?: string
          status?: Database["public"]["Enums"]["claim_status"]
          submitted_at?: string | null
          submitted_by_company_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_claims_certified_by_user_id_fkey"
            columns: ["certified_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_claims_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_claims_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_claims_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_claims_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_claims_submitted_by_company_id_fkey"
            columns: ["submitted_by_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          description: string | null
          id: string
          images: string[] | null
          org_id: string
          project_id: string
          title: string
          update_type: Database["public"]["Enums"]["update_type"]
          updated_at: string
          visibility: Database["public"]["Enums"]["update_visibility"]
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          org_id: string
          project_id: string
          title: string
          update_type?: Database["public"]["Enums"]["update_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["update_visibility"]
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          org_id?: string
          project_id?: string
          title?: string
          update_type?: Database["public"]["Enums"]["update_type"]
          updated_at?: string
          visibility?: Database["public"]["Enums"]["update_visibility"]
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          address: string | null
          budget: number | null
          client_company_id: string | null
          code: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          org_id: string
          stage: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          budget?: number | null
          client_company_id?: string | null
          code: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          org_id: string
          stage?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          budget?: number | null
          client_company_id?: string | null
          code?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          org_id?: string
          stage?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_company_id_fkey"
            columns: ["client_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      rfi_messages: {
        Row: {
          author_user_id: string
          body: string
          created_at: string
          id: string
          rfi_id: string
        }
        Insert: {
          author_user_id: string
          body: string
          created_at?: string
          id?: string
          rfi_id: string
        }
        Update: {
          author_user_id?: string
          body?: string
          created_at?: string
          id?: string
          rfi_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfi_messages_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfi_messages_rfi_id_fkey"
            columns: ["rfi_id"]
            isOneToOne: false
            referencedRelation: "rfis"
            referencedColumns: ["id"]
          },
        ]
      }
      rfis: {
        Row: {
          assignee_user_id: string | null
          closed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          number: number
          org_id: string
          originator_user_id: string
          project_id: string
          question: string
          status: Database["public"]["Enums"]["rfi_status"]
          subject: string
          updated_at: string
        }
        Insert: {
          assignee_user_id?: string | null
          closed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          number: number
          org_id: string
          originator_user_id: string
          project_id: string
          question: string
          status?: Database["public"]["Enums"]["rfi_status"]
          subject: string
          updated_at?: string
        }
        Update: {
          assignee_user_id?: string | null
          closed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          number?: number
          org_id?: string
          originator_user_id?: string
          project_id?: string
          question?: string
          status?: Database["public"]["Enums"]["rfi_status"]
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rfis_assignee_user_id_fkey"
            columns: ["assignee_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_originator_user_id_fkey"
            columns: ["originator_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          description: string
          id: string
          level: Database["public"]["Enums"]["risk_level"]
          mitigation: string | null
          org_id: string
          project_id: string
          status: Database["public"]["Enums"]["risk_status"]
          type: Database["public"]["Enums"]["risk_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          description: string
          id?: string
          level?: Database["public"]["Enums"]["risk_level"]
          mitigation?: string | null
          org_id: string
          project_id: string
          status?: Database["public"]["Enums"]["risk_status"]
          type?: Database["public"]["Enums"]["risk_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          description?: string
          id?: string
          level?: Database["public"]["Enums"]["risk_level"]
          mitigation?: string | null
          org_id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["risk_status"]
          type?: Database["public"]["Enums"]["risk_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "risks_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_transactions: {
        Row: {
          agent_id: string | null
          buyer_email: string | null
          buyer_name: string
          buyer_phone: string | null
          commission_amount: number | null
          contract_date: string | null
          created_at: string
          created_by_user_id: string | null
          deposit_amount: number | null
          deposit_date: string | null
          id: string
          lot_id: string
          notes: string | null
          sale_price: number
          settlement_date: string | null
          unconditional_date: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          buyer_email?: string | null
          buyer_name: string
          buyer_phone?: string | null
          commission_amount?: number | null
          contract_date?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deposit_amount?: number | null
          deposit_date?: string | null
          id?: string
          lot_id: string
          notes?: string | null
          sale_price?: number
          settlement_date?: string | null
          unconditional_date?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          buyer_email?: string | null
          buyer_name?: string
          buyer_phone?: string | null
          commission_amount?: number | null
          contract_date?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deposit_amount?: number | null
          deposit_date?: string | null
          id?: string
          lot_id?: string
          notes?: string | null
          sale_price?: number
          settlement_date?: string | null
          unconditional_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_transactions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "sales_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_transactions_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_transactions_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_agents: {
        Row: {
          commission_rate: number | null
          company: string | null
          created_at: string
          created_by_user_id: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          org_id: string
          phone: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          commission_rate?: number | null
          company?: string | null
          created_at?: string
          created_by_user_id?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          org_id: string
          phone?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          commission_rate?: number | null
          company?: string | null
          created_at?: string
          created_by_user_id?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          org_id?: string
          phone?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_agents_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_agents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_agents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_diary_entries: {
        Row: {
          created_at: string
          created_by_user_id: string | null
          delay_reason: string | null
          delays_hours: number | null
          entry_date: string
          id: string
          notes: string | null
          org_id: string
          photos: string[] | null
          project_id: string
          safety_incidents: number | null
          safety_notes: string | null
          temperature_high: number | null
          temperature_low: number | null
          updated_at: string
          weather_condition:
            | Database["public"]["Enums"]["weather_condition"]
            | null
          weather_notes: string | null
          work_summary: string | null
        }
        Insert: {
          created_at?: string
          created_by_user_id?: string | null
          delay_reason?: string | null
          delays_hours?: number | null
          entry_date: string
          id?: string
          notes?: string | null
          org_id: string
          photos?: string[] | null
          project_id: string
          safety_incidents?: number | null
          safety_notes?: string | null
          temperature_high?: number | null
          temperature_low?: number | null
          updated_at?: string
          weather_condition?:
            | Database["public"]["Enums"]["weather_condition"]
            | null
          weather_notes?: string | null
          work_summary?: string | null
        }
        Update: {
          created_at?: string
          created_by_user_id?: string | null
          delay_reason?: string | null
          delays_hours?: number | null
          entry_date?: string
          id?: string
          notes?: string | null
          org_id?: string
          photos?: string[] | null
          project_id?: string
          safety_incidents?: number | null
          safety_notes?: string | null
          temperature_high?: number | null
          temperature_low?: number | null
          updated_at?: string
          weather_condition?:
            | Database["public"]["Enums"]["weather_condition"]
            | null
          weather_notes?: string | null
          work_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_diary_entries_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_diary_entries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_diary_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      submittal_comments: {
        Row: {
          author_user_id: string | null
          body: string
          created_at: string
          id: string
          submittal_id: string
        }
        Insert: {
          author_user_id?: string | null
          body: string
          created_at?: string
          id?: string
          submittal_id: string
        }
        Update: {
          author_user_id?: string | null
          body?: string
          created_at?: string
          id?: string
          submittal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submittal_comments_author_user_id_fkey"
            columns: ["author_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submittal_comments_submittal_id_fkey"
            columns: ["submittal_id"]
            isOneToOne: false
            referencedRelation: "submittals"
            referencedColumns: ["id"]
          },
        ]
      }
      submittals: {
        Row: {
          assigned_reviewer_id: string | null
          created_at: string
          created_by_user_id: string | null
          date_required: string | null
          date_returned: string | null
          date_submitted: string | null
          description: string | null
          id: string
          org_id: string
          project_id: string
          reviewer_notes: string | null
          revision: number
          spec_section: string | null
          status: Database["public"]["Enums"]["submittal_status"]
          submittal_number: number
          submittal_type: string
          submitted_by_company_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_reviewer_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          date_required?: string | null
          date_returned?: string | null
          date_submitted?: string | null
          description?: string | null
          id?: string
          org_id: string
          project_id: string
          reviewer_notes?: string | null
          revision?: number
          spec_section?: string | null
          status?: Database["public"]["Enums"]["submittal_status"]
          submittal_number: number
          submittal_type: string
          submitted_by_company_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_reviewer_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          date_required?: string | null
          date_returned?: string | null
          date_submitted?: string | null
          description?: string | null
          id?: string
          org_id?: string
          project_id?: string
          reviewer_notes?: string | null
          revision?: number
          spec_section?: string | null
          status?: Database["public"]["Enums"]["submittal_status"]
          submittal_number?: number
          submittal_type?: string
          submitted_by_company_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submittals_assigned_reviewer_id_fkey"
            columns: ["assigned_reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submittals_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submittals_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submittals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submittals_submitted_by_company_id_fkey"
            columns: ["submitted_by_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_submissions: {
        Row: {
          amount: number
          company_id: string
          created_at: string
          id: string
          is_awarded: boolean
          notes: string | null
          submitted_at: string | null
          tender_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          company_id: string
          created_at?: string
          id?: string
          is_awarded?: boolean
          notes?: string | null
          submitted_at?: string | null
          tender_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          company_id?: string
          created_at?: string
          id?: string
          is_awarded?: boolean
          notes?: string | null
          submitted_at?: string | null
          tender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tender_submissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tender_submissions_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tenders: {
        Row: {
          awarded_amount: number | null
          awarded_company_id: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          due_date: string | null
          estimated_value: number | null
          id: string
          notes: string | null
          org_id: string
          project_id: string
          status: Database["public"]["Enums"]["tender_status"]
          tender_number: number
          title: string
          trade: string
          updated_at: string
        }
        Insert: {
          awarded_amount?: number | null
          awarded_company_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
          org_id: string
          project_id: string
          status?: Database["public"]["Enums"]["tender_status"]
          tender_number: number
          title: string
          trade: string
          updated_at?: string
        }
        Update: {
          awarded_amount?: number | null
          awarded_company_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
          org_id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["tender_status"]
          tender_number?: number
          title?: string
          trade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenders_awarded_company_id_fkey"
            columns: ["awarded_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenders_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenders_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      variations: {
        Row: {
          approved_at: string | null
          approved_by_user_id: string | null
          contract_id: string | null
          cost_impact: number | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          id: string
          org_id: string
          project_id: string
          reason: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["variation_status"]
          submitted_at: string | null
          submitted_by_company_id: string | null
          time_impact: number | null
          title: string
          updated_at: string
          variation_number: number
        }
        Insert: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          contract_id?: string | null
          cost_impact?: number | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          org_id: string
          project_id: string
          reason?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["variation_status"]
          submitted_at?: string | null
          submitted_by_company_id?: string | null
          time_impact?: number | null
          title: string
          updated_at?: string
          variation_number: number
        }
        Update: {
          approved_at?: string | null
          approved_by_user_id?: string | null
          contract_id?: string | null
          cost_impact?: number | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          id?: string
          org_id?: string
          project_id?: string
          reason?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["variation_status"]
          submitted_at?: string | null
          submitted_by_company_id?: string | null
          time_impact?: number | null
          title?: string
          updated_at?: string
          variation_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "variations_approved_by_user_id_fkey"
            columns: ["approved_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variations_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variations_submitted_by_company_id_fkey"
            columns: ["submitted_by_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_id: { Args: never; Returns: string }
    }
    Enums: {
      action_status: "pending" | "completed"
      claim_status: "draft" | "submitted" | "certified" | "paid" | "disputed"
      consultant_status: "draft" | "engaged" | "completed" | "terminated"
      contract_status: "draft" | "active" | "completed" | "terminated"
      decision_status: "pending" | "approved" | "rejected"
      defect_status: "open" | "contractor_complete" | "closed"
      eot_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "withdrawn"
      lot_status:
        | "available"
        | "hold"
        | "deposit_paid"
        | "unconditional"
        | "settled"
        | "withdrawn"
      phase_status: "pending" | "in_progress" | "completed"
      rfi_status: "draft" | "open" | "closed"
      risk_level: "low" | "medium" | "high"
      risk_status: "open" | "mitigated" | "closed"
      risk_type: "risk" | "opportunity"
      submittal_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "approved_as_noted"
        | "revise_resubmit"
        | "rejected"
      tender_status: "draft" | "open" | "evaluation" | "awarded" | "cancelled"
      update_type: "milestone" | "progress" | "issue" | "general"
      update_visibility: "internal" | "client"
      variation_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "cancelled"
      weather_condition:
        | "sunny"
        | "partly_cloudy"
        | "cloudy"
        | "light_rain"
        | "heavy_rain"
        | "storm"
        | "windy"
        | "hot"
        | "cold"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      action_status: ["pending", "completed"],
      claim_status: ["draft", "submitted", "certified", "paid", "disputed"],
      consultant_status: ["draft", "engaged", "completed", "terminated"],
      contract_status: ["draft", "active", "completed", "terminated"],
      decision_status: ["pending", "approved", "rejected"],
      defect_status: ["open", "contractor_complete", "closed"],
      eot_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "withdrawn",
      ],
      lot_status: [
        "available",
        "hold",
        "deposit_paid",
        "unconditional",
        "settled",
        "withdrawn",
      ],
      phase_status: ["pending", "in_progress", "completed"],
      rfi_status: ["draft", "open", "closed"],
      risk_level: ["low", "medium", "high"],
      risk_status: ["open", "mitigated", "closed"],
      risk_type: ["risk", "opportunity"],
      submittal_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "approved_as_noted",
        "revise_resubmit",
        "rejected",
      ],
      tender_status: ["draft", "open", "evaluation", "awarded", "cancelled"],
      update_type: ["milestone", "progress", "issue", "general"],
      update_visibility: ["internal", "client"],
      variation_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "cancelled",
      ],
      weather_condition: [
        "sunny",
        "partly_cloudy",
        "cloudy",
        "light_rain",
        "heavy_rain",
        "storm",
        "windy",
        "hot",
        "cold",
      ],
    },
  },
} as const
