
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Job, Client, AppSettings, JobObservation, DraftNote, Payment, CalendarEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Default theme colors
const DEFAULT_PRIMARY_COLOR = '#f8fafc'; // slate-50
const DEFAULT_ACCENT_COLOR = '#1e293b'; // slate-800
const DEFAULT_SPLASH_BACKGROUND_COLOR = '#111827'; // Dark Slate (e.g., gray-900)


interface AppDataContextType {
  jobs: Job[];
  clients: Client[];
  draftNotes: DraftNote[];
  settings: AppSettings;
  calendarEvents: CalendarEvent[];
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'isDeleted' | 'observationsLog' | 'payments' | 'cloudLinks' | 'createCalendarEvent' | 'calendarEventId'> & Partial<Pick<Job, 'cloudLinks' | 'createCalendarEvent' | 'cost'>>) => void;
  updateJob: (job: Job) => void;
  deleteJob: (jobId: string) => void; // Soft delete
  permanentlyDeleteJob: (jobId: string) => void; // Hard delete
  getJobById: (jobId: string) => Job | undefined;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'cpf' | 'observations'> & Partial<Pick<Client, 'cpf' | 'observations'>>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  getClientById: (clientId: string) => Client | undefined;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addDraftNote: (draft: { title: string, type: 'TEXT' | 'SCRIPT' }) => DraftNote;
  updateDraftNote: (draft: DraftNote) => void;
  deleteDraftNote: (draftId: string) => void;
  connectGoogleCalendar: () => Promise<boolean>;
  disconnectGoogleCalendar: () => void;
  syncCalendar: () => void;
  loading: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const initialJobs: Job[] = [];
const initialClients: Client[] = [
    { id: 'client1', name: 'Ana Silva', company: 'TechCorp Solutions', email: 'ana.silva@techcorp.com', phone: '11987654321', createdAt: new Date().toISOString(), cpf: '111.222.333-44', observations: 'Prefere comunicação por email.' },
    { id: 'client2', name: 'Carlos Pereira', company: 'Urban Style Agency', email: 'carlos.p@urbanstyle.com', createdAt: new Date().toISOString() },
    { id: 'client3', name: 'Juliana Costa', company: 'NatureFoods Inc.', email: 'juliana.costa@naturefoods.com', phone: '21912345678', createdAt: new Date().toISOString(), observations: 'Pagamento sempre em dia.' },
];
const initialDraftNotes: DraftNote[] = [
    {id: uuidv4(), title: "Exemplo de Roteiro", type: 'SCRIPT', content: "", scriptLines: [{id: uuidv4(), scene: "1", description: "CENA DE ABERTURA: Um dia ensolarado no parque.", duration: 15}], attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
];

const initialSettings: AppSettings = {
  customLogo: undefined,
  asaasUrl: 'https://www.asaas.com/login',
  userName: '',
  primaryColor: DEFAULT_PRIMARY_COLOR,
  accentColor: DEFAULT_ACCENT_COLOR,
  splashScreenBackgroundColor: DEFAULT_SPLASH_BACKGROUND_COLOR,
  privacyModeEnabled: false,
  googleCalendarConnected: false,
};


export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [draftNotes, setDraftNotes] = useState<DraftNote[]>([]);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-main-bg', settings.primaryColor || DEFAULT_PRIMARY_COLOR);
    const currentAccentColor = settings.accentColor || DEFAULT_ACCENT_COLOR;
    document.documentElement.style.setProperty('--color-accent', currentAccentColor);
    document.documentElement.style.setProperty('--color-input-focus-border', currentAccentColor);
  }, [settings.primaryColor, settings.accentColor]);

  useEffect(() => {
    try {
      const storedJobs = localStorage.getItem('big_jobs');
      const storedClients = localStorage.getItem('big_clients');
      const storedDrafts = localStorage.getItem('big_draftNotes');
      const storedSettings = localStorage.getItem('big_settings');
      const storedCalendarEvents = localStorage.getItem('big_calendarEvents');

      let parsedJobs = storedJobs ? JSON.parse(storedJobs) : initialJobs;
      const migratedJobs = parsedJobs.map((job: any): Job => {
        // Migration logic here...
        return {
          ...job,
          id: job.id || uuidv4(),
          isDeleted: job.isDeleted ?? false,
          observationsLog: job.observationsLog || [],
          cloudLinks: job.cloudLinks || (job.cloudLink ? [job.cloudLink] : []),
          createCalendarEvent: job.createCalendarEvent ?? false,
          cost: job.cost ?? undefined,
          payments: job.payments || [],
          calendarEventId: job.calendarEventId,
        };
      });
      setJobs(migratedJobs);

      setClients(storedClients ? JSON.parse(storedClients) : initialClients);
      
      const parsedDrafts = storedDrafts ? JSON.parse(storedDrafts) : initialDraftNotes;
      setDraftNotes(parsedDrafts.map((draft: any): DraftNote => ({
        ...draft, type: draft.type || 'SCRIPT', scriptLines: draft.scriptLines || (draft.content ? [{id: uuidv4(), scene: "1", description: draft.content, duration: 0}] : []), content: draft.content || '', attachments: draft.attachments || [], imageBase64: undefined, imageMimeType: undefined,
      })));
      
      const loadedSettings = storedSettings ? JSON.parse(storedSettings) : initialSettings;
      setSettings({
        primaryColor: loadedSettings.primaryColor || DEFAULT_PRIMARY_COLOR,
        accentColor: loadedSettings.accentColor || DEFAULT_ACCENT_COLOR,
        splashScreenBackgroundColor: loadedSettings.splashScreenBackgroundColor || DEFAULT_SPLASH_BACKGROUND_COLOR,
        customLogo: loadedSettings.customLogo,
        asaasUrl: loadedSettings.asaasUrl || 'https://www.asaas.com/login',
        userName: loadedSettings.userName || '',
        privacyModeEnabled: loadedSettings.privacyModeEnabled ?? false,
        googleCalendarConnected: loadedSettings.googleCalendarConnected ?? false,
        googleCalendarLastSync: loadedSettings.googleCalendarLastSync,
      });

      setCalendarEvents(storedCalendarEvents ? JSON.parse(storedCalendarEvents) : []);

    } catch (error) {
      console.error("Failed to load or migrate data from localStorage", error);
      setJobs([]); setClients(initialClients); setDraftNotes(initialDraftNotes); setSettings(initialSettings); setCalendarEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (!loading) { localStorage.setItem('big_jobs', JSON.stringify(jobs)); } }, [jobs, loading]);
  useEffect(() => { if(!loading) { localStorage.setItem('big_clients', JSON.stringify(clients)); } }, [clients, loading]);
  useEffect(() => { if(!loading) { localStorage.setItem('big_draftNotes', JSON.stringify(draftNotes)); } }, [draftNotes, loading]);
  useEffect(() => { if(!loading) { localStorage.setItem('big_settings', JSON.stringify(settings)); } }, [settings, loading]);
  useEffect(() => { if(!loading) { localStorage.setItem('big_calendarEvents', JSON.stringify(calendarEvents)); } }, [calendarEvents, loading]);


 const addJob = useCallback((jobData: Omit<Job, 'id' | 'createdAt' | 'isDeleted' | 'observationsLog' | 'payments' | 'cloudLinks' | 'createCalendarEvent' | 'calendarEventId'> & Partial<Pick<Job, 'cloudLinks' | 'createCalendarEvent' | 'cost'>>) => {
    const newJob: Job = {
        ...jobData,
        id: uuidv4(), createdAt: new Date().toISOString(), isDeleted: false, observationsLog: [], payments: [], cloudLinks: jobData.cloudLinks || [], createCalendarEvent: jobData.createCalendarEvent || false,
    };
    setJobs(prev => [...prev, newJob]);
  }, []);

  const updateJob = useCallback((updatedJob: Job) => {
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
  }, []);

  const deleteJob = useCallback((jobId: string) => { setJobs(prev => prev.map(job => job.id === jobId ? { ...job, isDeleted: true } : job)); }, []);
  const permanentlyDeleteJob = useCallback((jobId: string) => { setJobs(prev => prev.filter(job => job.id !== jobId)); }, []);
  const getJobById = useCallback((jobId: string) => jobs.find(job => job.id === jobId), [jobs]);
  const addClient = useCallback((clientData: Omit<Client, 'id' | 'createdAt'>) => { setClients(prev => [...prev, { ...clientData, id: uuidv4(), createdAt: new Date().toISOString() }]); }, []);
  const updateClient = useCallback((updatedClient: Client) => { setClients(prev => prev.map(client => client.id === updatedClient.id ? updatedClient : client)); }, []);
  const deleteClient = useCallback((clientId: string) => { setClients(prev => prev.filter(client => client.id !== clientId)); }, []);
  const getClientById = useCallback((clientId: string) => clients.find(client => client.id === clientId), [clients]);
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => { setSettings(prev => ({ ...prev, ...newSettings })); }, []);
  const addDraftNote = useCallback((draftData: { title: string, type: 'TEXT' | 'SCRIPT' }): DraftNote => {
    const newDraft: DraftNote = { ...draftData, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), content: draftData.type === 'TEXT' ? '' : '', scriptLines: draftData.type === 'SCRIPT' ? [{ id: uuidv4(), scene: '1', description: '', duration: 0 }] : [], attachments: [], };
    setDraftNotes(prev => [newDraft, ...prev]); return newDraft;
  }, []);
  const updateDraftNote = useCallback((updatedDraft: DraftNote) => { setDraftNotes(prev => prev.map(draft => draft.id === updatedDraft.id ? { ...updatedDraft, updatedAt: new Date().toISOString() } : draft)); }, []);
  const deleteDraftNote = useCallback((draftId: string) => { setDraftNotes(prev => prev.filter(draft => draft.id !== draftId)); }, []);

  const syncCalendar = useCallback(() => {
    if (!settings.googleCalendarConnected) return;

    let allEvents = [...calendarEvents];
    let jobsToUpdate: Job[] = [];

    // Simulate fetching some events from Google Calendar
    const googleEvents: CalendarEvent[] = [
        { id: 'gcal_1', title: 'Reunião de Alinhamento', start: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), end: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), allDay: false, source: 'google' },
        { id: 'gcal_2', title: 'Aniversário Cliente X', start: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), end: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(), allDay: true, source: 'google' }
    ];
    allEvents = allEvents.filter(e => e.source !== 'google').concat(googleEvents);
    
    // Sync BIG jobs to calendar
    const jobsWithCalendarRequest = jobs.filter(j => !j.isDeleted && j.createCalendarEvent);
    const existingEventJobIds = new Set(allEvents.filter(e => e.source === 'big').map(e => e.jobId));
    
    jobsWithCalendarRequest.forEach(job => {
        if (!existingEventJobIds.has(job.id)) {
            const eventId = `big_${job.id}`;
            const newEvent: CalendarEvent = {
                id: eventId, title: `Entrega: ${job.name}`, start: job.deadline, end: job.deadline, allDay: true, source: 'big', jobId: job.id,
            };
            allEvents.push(newEvent);
            jobsToUpdate.push({ ...job, calendarEventId: eventId });
        }
    });

    // Remove events for jobs that no longer exist or have the flag unchecked
    const jobIdsWithRequest = new Set(jobsWithCalendarRequest.map(j => j.id));
    allEvents = allEvents.filter(event => {
        if (event.source === 'big') {
            return jobIdsWithRequest.has(event.jobId);
        }
        return true;
    });

    setCalendarEvents(allEvents);
    if(jobsToUpdate.length > 0){
        setJobs(prevJobs => prevJobs.map(j => jobsToUpdate.find(ju => ju.id === j.id) || j));
    }
    updateSettings({ googleCalendarLastSync: new Date().toISOString() });
  }, [jobs, settings.googleCalendarConnected, calendarEvents, updateSettings]);

  useEffect(() => {
    const syncTimeout = setTimeout(() => {
        if (settings.googleCalendarConnected && !loading) {
            syncCalendar();
        }
    }, 500); // Debounce sync
    return () => clearTimeout(syncTimeout);
  }, [jobs, settings.googleCalendarConnected, loading, syncCalendar]);

  const connectGoogleCalendar = useCallback(async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const success = Math.random() > 0.2;
    if (success) {
      updateSettings({ googleCalendarConnected: true });
      return true;
    }
    return false;
  }, [updateSettings]);
  
  const disconnectGoogleCalendar = useCallback(() => {
    updateSettings({ googleCalendarConnected: false, googleCalendarLastSync: undefined });
    setCalendarEvents([]);
    setJobs(prev => prev.map(j => ({ ...j, calendarEventId: undefined })));
  }, [updateSettings]);


  const contextValue: AppDataContextType = {
    jobs, clients, draftNotes, settings, calendarEvents, addJob, updateJob, deleteJob, permanentlyDeleteJob, getJobById, addClient, updateClient, deleteClient, getClientById, updateSettings, addDraftNote, updateDraftNote, deleteDraftNote, connectGoogleCalendar, disconnectGoogleCalendar, syncCalendar, loading
  };

  return React.createElement(AppDataContext.Provider, { value: contextValue }, children);
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
