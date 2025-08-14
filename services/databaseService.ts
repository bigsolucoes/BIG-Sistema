import { supabase } from '../lib/supabase'
import { Job, Client, AppSettings, DraftNote, CalendarEvent, User } from '../types'

export class DatabaseService {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  // Users
  async createUser(username: string, email: string, hashedPassword: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: hashedPassword,
        options: {
          data: {
            username
          }
        }
      })

      if (error) throw error

      if (data.user) {
        return {
          id: data.user.id,
          username
        }
      }
      return null
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }

  async signIn(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        return {
          id: data.user.id,
          username: data.user.user_metadata?.username || data.user.email || 'User'
        }
      }
      return null
    } catch (error) {
      console.error('Error signing in:', error)
      return null
    }
  }

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Jobs
  async getJobs(): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(this.mapJobFromDB) || []
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return []
    }
  }

  async createJob(job: Omit<Job, 'id' | 'createdAt'>): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert([this.mapJobToDB(job)])
        .select()
        .single()

      if (error) throw error

      return data ? this.mapJobFromDB(data) : null
    } catch (error) {
      console.error('Error creating job:', error)
      return null
    }
  }

  async updateJob(job: Job): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update(this.mapJobToDB(job))
        .eq('id', job.id)
        .eq('user_id', this.userId)
        .select()
        .single()

      if (error) throw error

      return data ? this.mapJobFromDB(data) : null
    } catch (error) {
      console.error('Error updating job:', error)
      return null
    }
  }

  async deleteJob(jobId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('user_id', this.userId)

      return !error
    } catch (error) {
      console.error('Error deleting job:', error)
      return false
    }
  }

  // Clients
  async getClients(): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(this.mapClientFromDB) || []
    } catch (error) {
      console.error('Error fetching clients:', error)
      return []
    }
  }

  async createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([this.mapClientToDB(client)])
        .select()
        .single()

      if (error) throw error

      return data ? this.mapClientFromDB(data) : null
    } catch (error) {
      console.error('Error creating client:', error)
      return null
    }
  }

  async updateClient(client: Client): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update(this.mapClientToDB(client))
        .eq('id', client.id)
        .eq('user_id', this.userId)
        .select()
        .single()

      if (error) throw error

      return data ? this.mapClientFromDB(data) : null
    } catch (error) {
      console.error('Error updating client:', error)
      return null
    }
  }

  async deleteClient(clientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', this.userId)

      return !error
    } catch (error) {
      console.error('Error deleting client:', error)
      return false
    }
  }

  // App Settings
  async getSettings(): Promise<AppSettings | null> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', this.userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return data ? this.mapSettingsFromDB(data) : null
    } catch (error) {
      console.error('Error fetching settings:', error)
      return null
    }
  }

  async updateSettings(settings: AppSettings): Promise<AppSettings | null> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .upsert(this.mapSettingsToDB(settings))
        .eq('user_id', this.userId)
        .select()
        .single()

      if (error) throw error

      return data ? this.mapSettingsFromDB(data) : null
    } catch (error) {
      console.error('Error updating settings:', error)
      return null
    }
  }

  // Draft Notes
  async getDraftNotes(): Promise<DraftNote[]> {
    try {
      const { data, error } = await supabase
        .from('draft_notes')
        .select('*')
        .eq('user_id', this.userId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return data?.map(this.mapDraftNoteFromDB) || []
    } catch (error) {
      console.error('Error fetching draft notes:', error)
      return []
    }
  }

  async createDraftNote(draftNote: Omit<DraftNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<DraftNote | null> {
    try {
      const { data, error } = await supabase
        .from('draft_notes')
        .insert([this.mapDraftNoteToDB(draftNote)])
        .select()
        .single()

      if (error) throw error

      return data ? this.mapDraftNoteFromDB(data) : null
    } catch (error) {
      console.error('Error creating draft note:', error)
      return null
    }
  }

  async updateDraftNote(draftNote: DraftNote): Promise<DraftNote | null> {
    try {
      const { data, error } = await supabase
        .from('draft_notes')
        .update(this.mapDraftNoteToDB(draftNote))
        .eq('id', draftNote.id)
        .eq('user_id', this.userId)
        .select()
        .single()

      if (error) throw error

      return data ? this.mapDraftNoteFromDB(data) : null
    } catch (error) {
      console.error('Error updating draft note:', error)
      return null
    }
  }

  async deleteDraftNote(draftNoteId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('draft_notes')
        .delete()
        .eq('id', draftNoteId)
        .eq('user_id', this.userId)

      return !error
    } catch (error) {
      console.error('Error deleting draft note:', error)
      return false
    }
  }

  // Calendar Events
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', this.userId)
        .order('start', { ascending: true })

      if (error) throw error

      return data?.map(this.mapCalendarEventFromDB) || []
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      return []
    }
  }

  async createCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent | null> {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert([this.mapCalendarEventToDB(event)])
        .select()
        .single()

      if (error) throw error

      return data ? this.mapCalendarEventFromDB(data) : null
    } catch (error) {
      console.error('Error creating calendar event:', error)
      return null
    }
  }

  // Mapping functions
  private mapJobFromDB(dbJob: any): Job {
    return {
      id: dbJob.id,
      name: dbJob.name,
      clientId: dbJob.client_id,
      serviceType: dbJob.service_type,
      value: dbJob.value,
      cost: dbJob.cost,
      deadline: dbJob.deadline,
      status: dbJob.status,
      cloudLinks: dbJob.cloud_links,
      createdAt: dbJob.created_at,
      notes: dbJob.notes,
      isDeleted: dbJob.is_deleted,
      payments: dbJob.payments || [],
      calendarEventId: dbJob.calendar_event_id,
      isRecurring: dbJob.is_recurring
    }
  }

  private mapJobToDB(job: any): any {
    return {
      id: job.id,
      user_id: this.userId,
      name: job.name,
      client_id: job.clientId,
      service_type: job.serviceType,
      value: job.value,
      cost: job.cost,
      deadline: job.deadline,
      status: job.status,
      cloud_links: job.cloudLinks,
      notes: job.notes,
      is_deleted: job.isDeleted || false,
      payments: job.payments || [],
      calendar_event_id: job.calendarEventId,
      is_recurring: job.isRecurring || false,
      created_at: job.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  private mapClientFromDB(dbClient: any): Client {
    return {
      id: dbClient.id,
      name: dbClient.name,
      company: dbClient.company,
      email: dbClient.email,
      phone: dbClient.phone,
      cpf: dbClient.cpf,
      observations: dbClient.observations,
      createdAt: dbClient.created_at
    }
  }

  private mapClientToDB(client: any): any {
    return {
      id: client.id,
      user_id: this.userId,
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      cpf: client.cpf,
      observations: client.observations,
      created_at: client.createdAt || new Date().toISOString()
    }
  }

  private mapSettingsFromDB(dbSettings: any): AppSettings {
    return {
      customLogo: dbSettings.custom_logo,
      asaasUrl: dbSettings.asaas_url,
      userName: dbSettings.user_name,
      primaryColor: dbSettings.primary_color,
      accentColor: dbSettings.accent_color,
      splashScreenBackgroundColor: dbSettings.splash_screen_background_color,
      privacyModeEnabled: dbSettings.privacy_mode_enabled,
      googleCalendarConnected: dbSettings.google_calendar_connected,
      googleCalendarLastSync: dbSettings.google_calendar_last_sync
    }
  }

  private mapSettingsToDB(settings: any): any {
    return {
      user_id: this.userId,
      custom_logo: settings.customLogo,
      asaas_url: settings.asaasUrl,
      user_name: settings.userName,
      primary_color: settings.primaryColor,
      accent_color: settings.accentColor,
      splash_screen_background_color: settings.splashScreenBackgroundColor,
      privacy_mode_enabled: settings.privacyModeEnabled || false,
      google_calendar_connected: settings.googleCalendarConnected || false,
      google_calendar_last_sync: settings.googleCalendarLastSync,
      updated_at: new Date().toISOString()
    }
  }

  private mapDraftNoteFromDB(dbDraftNote: any): DraftNote {
    return {
      id: dbDraftNote.id,
      title: dbDraftNote.title,
      type: dbDraftNote.type,
      content: dbDraftNote.content,
      scriptLines: dbDraftNote.script_lines || [],
      attachments: dbDraftNote.attachments || [],
      createdAt: dbDraftNote.created_at,
      updatedAt: dbDraftNote.updated_at
    }
  }

  private mapDraftNoteToDB(draftNote: any): any {
    return {
      id: draftNote.id,
      user_id: this.userId,
      title: draftNote.title,
      type: draftNote.type,
      content: draftNote.content,
      script_lines: draftNote.scriptLines || [],
      attachments: draftNote.attachments || [],
      created_at: draftNote.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  private mapCalendarEventFromDB(dbEvent: any): CalendarEvent {
    return {
      id: dbEvent.id,
      title: dbEvent.title,
      start: dbEvent.start,
      end: dbEvent.end,
      allDay: dbEvent.all_day,
      source: dbEvent.source,
      jobId: dbEvent.job_id
    }
  }

  private mapCalendarEventToDB(event: any): any {
    return {
      id: event.id,
      user_id: this.userId,
      title: event.title,
      start: event.start,
      end: event.end,
      all_day: event.allDay,
      source: event.source,
      job_id: event.jobId,
      created_at: new Date().toISOString()
    }
  }
}
