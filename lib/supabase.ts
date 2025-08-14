import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

// For development without Supabase setup, use dummy values
const isDevelopment = !supabaseUrl || !supabaseAnonKey
const finalUrl = supabaseUrl || 'https://dummy.supabase.co'
const finalKey = supabaseAnonKey || 'dummy-key'

if (isDevelopment) {
  console.warn('⚠️  Running in development mode without Supabase. Please configure environment variables for full functionality.')
}

export const supabase = createClient(finalUrl, finalKey)
export const isSupabaseConfigured = !isDevelopment

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          company: string | null
          email: string
          phone: string | null
          cpf: string | null
          observations: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          company?: string | null
          email: string
          phone?: string | null
          cpf?: string | null
          observations?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          company?: string | null
          email?: string
          phone?: string | null
          cpf?: string | null
          observations?: string | null
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          user_id: string
          name: string
          client_id: string
          service_type: string
          value: number
          cost: number | null
          deadline: string
          status: string
          cloud_links: string[] | null
          notes: string | null
          is_deleted: boolean
          payments: any
          calendar_event_id: string | null
          is_recurring: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          client_id: string
          service_type: string
          value: number
          cost?: number | null
          deadline: string
          status: string
          cloud_links?: string[] | null
          notes?: string | null
          is_deleted?: boolean
          payments?: any
          calendar_event_id?: string | null
          is_recurring?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          client_id?: string
          service_type?: string
          value?: number
          cost?: number | null
          deadline?: string
          status?: string
          cloud_links?: string[] | null
          notes?: string | null
          is_deleted?: boolean
          payments?: any
          calendar_event_id?: string | null
          is_recurring?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      app_settings: {
        Row: {
          id: string
          user_id: string
          custom_logo: string | null
          asaas_url: string | null
          user_name: string | null
          primary_color: string | null
          accent_color: string | null
          splash_screen_background_color: string | null
          privacy_mode_enabled: boolean
          google_calendar_connected: boolean
          google_calendar_last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          custom_logo?: string | null
          asaas_url?: string | null
          user_name?: string | null
          primary_color?: string | null
          accent_color?: string | null
          splash_screen_background_color?: string | null
          privacy_mode_enabled?: boolean
          google_calendar_connected?: boolean
          google_calendar_last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          custom_logo?: string | null
          asaas_url?: string | null
          user_name?: string | null
          primary_color?: string | null
          accent_color?: string | null
          splash_screen_background_color?: string | null
          privacy_mode_enabled?: boolean
          google_calendar_connected?: boolean
          google_calendar_last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      draft_notes: {
        Row: {
          id: string
          user_id: string
          title: string
          type: string
          content: string
          script_lines: any
          attachments: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: string
          content: string
          script_lines?: any
          attachments?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: string
          content?: string
          script_lines?: any
          attachments?: any
          created_at?: string
          updated_at?: string
        }
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          title: string
          start: string
          end: string
          all_day: boolean
          source: string
          job_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          start: string
          end: string
          all_day: boolean
          source: string
          job_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          start?: string
          end?: string
          all_day?: boolean
          source?: string
          job_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
