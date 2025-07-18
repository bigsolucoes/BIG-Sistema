import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Job, Client, AppSettings, JobObservation, DraftNote, Payment, CalendarEvent, JobStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';

// Default theme colors
const DEFAULT_PRIMARY_COLOR = '#f8fafc'; // slate-50
const DEFAULT_ACCENT_COLOR = '#1e293b'; // slate-800
const DEFAULT_SPLASH_BACKGROUND_COLOR = '#111827'; // Dark Slate (e.g., gray-900)

const defaultInitialSettings: AppSettings = {
  customLogo: undefined,
  asaasUrl: 'https://www.asaas.com/login',
  userName: '',
  primaryColor: DEFAULT_PRIMARY_COLOR,
  accentColor: DEFAULT_ACCENT_COLOR,
  splashScreenBackgroundColor: DEFAULT_SPLASH_BACKGROUND_COLOR,
  privacyModeEnabled: false,
  googleCalendarConnected: false,
};


interface AppDataContextType {
  jobs: Job[];
  clients: Client[];
  draftNotes: DraftNote[];
  settings: AppSettings;
  calendarEvents: CalendarEvent[];
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'isDeleted' | 'observationsLog' | 'payments' | 'cloudLinks' | 'createCalendarEvent' | 'calendarEventId'> & Partial<Pick<Job, 'cloudLinks' | 'createCalendarEvent' | 'cost' | 'isRecurring'>>) => void;
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

// These will be used only for the FIRST time a user logs in.
const initialClientsForNewUser: Client[] = [
    { id: 'client1', name: 'Ana Silva', company: 'TechCorp Solutions', email: 'ana.silva@techcorp.com', phone: '11987654321', createdAt: new Date().toISOString(), cpf: '111.222.333-44', observations: 'Prefere comunicação por email.' },
];
const initialDraftNotesForNewUser: DraftNote[] = [
    {id: uuidv4(), title: "Exemplo de Roteiro", type: 'SCRIPT', content: "", scriptLines: [{id: uuidv4(), scene: "1", description: "CENA DE ABERTURA: Um dia ensolarado no parque.", duration: 15}], attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
];


export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [draftNotes, setDraftNotes] = useState<DraftNote[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultInitialSettings);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const getUserDataKey = useCallback((baseKey: string) => {
    if (!currentUser) return null;
    return `big_${baseKey}_${currentUser.id}`;
  }, [currentUser]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-main-bg', settings.primaryColor || DEFAULT_PRIMARY_COLOR);
    const currentAccentColor = settings.accentColor || DEFAULT_ACCENT_COLOR;
    document.documentElement.style.setProperty('--color-accent', currentAccentColor);
    document.documentElement.style.setProperty('--color-input-focus-border', currentAccentColor);
  }, [settings.primaryColor, settings.accentColor]);

  // Main data loading effect, triggered by user change
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setJobs([]);
      setClients([]);
      setDraftNotes([]);
      setSettings(defaultInitialSettings);
      setCalendarEvents([]);
      return;
    }
    
    setLoading(true);
    try {
      const jobsKey = getUserDataKey('jobs');
      const clientsKey = getUserDataKey('clients');
      const draftsKey = getUserDataKey('draftNotes');
      const settingsKey = getUserDataKey('settings');
      const calendarKey = getUserDataKey('calendarEvents');

      if(!jobsKey || !clientsKey || !draftsKey || !settingsKey || !calendarKey) {
        throw new Error("User key not available");
      }

      const storedJobs = localStorage.getItem(jobsKey);
      const storedClients = localStorage.getItem(clientsKey);
      const storedDrafts = localStorage.getItem(draftsKey);
      const storedSettings = localStorage.getItem(settingsKey);
      const storedCalendarEvents = localStorage.getItem(calendarKey);

      // Onboard new user with default data if they have no stored data
      const isNewUser = !storedJobs && !storedClients && !storedDrafts && !storedSettings;

      // Load Jobs
      const parsedJobs = storedJobs ? JSON.parse(storedJobs) : [];
      const migratedJobs = parsedJobs.map((job: any): Job => ({
        ...job, id: job.id || uuidv4(), isDeleted: job.isDeleted ?? false, observationsLog: job.observationsLog || [], cloudLinks: job.cloudLinks || (job.cloudLink ? [job.cloudLink] : []), createCalendarEvent: job.createCalendarEvent ?? false, cost: job.cost ?? undefined, payments: job.payments || [], calendarEventId: job.calendarEventId, isRecurring: job.isRecurring ?? false,
      }));
      setJobs(migratedJobs);

      // Load Clients
      setClients(isNewUser ? initialClientsForNewUser : (storedClients ? JSON.parse(storedClients) : []));
      
      // Load Drafts
      const parsedDrafts = isNewUser ? initialDraftNotesForNewUser : (storedDrafts ? JSON.parse(storedDrafts) : []);
      setDraftNotes(parsedDrafts.map((draft: any): DraftNote => ({
        ...draft, type: draft.type || 'SCRIPT', scriptLines: draft.scriptLines || (draft.content ? [{id: uuidv4(), scene: "1", description: draft.content, duration: 0}] : []), content: draft.content || '', attachments: draft.attachments || [],
      })));
      
      // Load Settings
      const loadedSettings = storedSettings ? JSON.parse(storedSettings) : defaultInitialSettings;
      setSettings({
        ...defaultInitialSettings,
        ...loadedSettings,
        userName: loadedSettings.userName || currentUser.username, // Default to auth username
      });

      // Load Calendar Events
      setCalendarEvents(storedCalendarEvents ? JSON.parse(storedCalendarEvents) : []);

    } catch (error) {
      console.error("Failed to load or migrate data from localStorage for user", currentUser.id, error);
      setJobs([]); setClients([]); setDraftNotes([]); setSettings(defaultInitialSettings); setCalendarEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, getUserDataKey]);

  // Data saving effects, now user-specific
  useEffect(() => { const key = getUserDataKey('jobs'); if (!loading && key) localStorage.setItem(key, JSON.stringify(jobs)); }, [jobs, loading, getUserDataKey]);
  useEffect(() => { const key = getUserDataKey('clients'); if (!loading && key) localStorage.setItem(key, JSON.stringify(clients)); }, [clients, loading, getUserDataKey]);
  useEffect(() => { const key = getUserDataKey('draftNotes'); if (!loading && key) localStorage.setItem(key, JSON.stringify(draftNotes)); }, [draftNotes, loading, getUserDataKey]);
  useEffect(() => { const key = getUserDataKey('settings'); if (!loading && key) localStorage.setItem(key, JSON.stringify(settings)); }, [settings, loading, getUserDataKey]);
  useEffect(() => { const key = getUserDataKey('calendarEvents'); if (!loading && key) localStorage.setItem(key, JSON.stringify(calendarEvents)); }, [calendarEvents, loading, getUserDataKey]);


 const addJob = useCallback((jobData: Omit<Job, 'id' | 'createdAt' | 'isDeleted' | 'observationsLog' | 'payments' | 'cloudLinks' | 'createCalendarEvent' | 'calendarEventId'> & Partial<Pick<Job, 'cloudLinks' | 'createCalendarEvent' | 'cost' | 'isRecurring'>>) => {
    const newJob: Job = {
        ...jobData,
        id: uuidv4(), createdAt: new Date().toISOString(), isDeleted: false, observationsLog: [], payments: [], cloudLinks: jobData.cloudLinks || [], createCalendarEvent: jobData.createCalendarEvent || false, isRecurring: jobData.isRecurring || false,
    };
    setJobs(prev => [...prev, newJob]);
  }, []);

  const updateJob = useCallback((updatedJob: Job) => {
    const previousJob = jobs.find(j => j.id === updatedJob.id);

    if (previousJob && previousJob.status !== JobStatus.PAID && updatedJob.status === JobStatus.PAID && updatedJob.isRecurring) {
        setJobs(prevJobs => {
            const deadlineDate = new Date(updatedJob.deadline);
            deadlineDate.setMonth(deadlineDate.getMonth() + 1);

            const newRecurringJob: Job = {
                ...updatedJob,
                id: uuidv4(),
                createdAt: new Date().toISOString(),
                deadline: deadlineDate.toISOString(),
                status: JobStatus.BRIEFING, 
                payments: [],
                observationsLog: [],
                calendarEventId: undefined, 
                name: `${updatedJob.name.replace(/ \(Mês Seguinte\)$/i, '')}`,
            };

            toast.success(`Job recorrente "${newRecurringJob.name}" criado para o próximo mês.`);
            
            return [...prevJobs.map(job => job.id === updatedJob.id ? updatedJob : job), newRecurringJob];
        });
    } else {
        setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
    }
}, [jobs]);


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

    const googleEvents: CalendarEvent[] = []; // In real app, fetch from Google API
    allEvents = allEvents.filter(e => e.source !== 'google').concat(googleEvents);
    
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

    const jobIdsWithRequest = new Set(jobsWithCalendarRequest.map(j => j.id));
    allEvents = allEvents.filter(event => !(event.source === 'big' && !jobIdsWithRequest.has(event.jobId)));

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
    }, 500);
    return () => clearTimeout(syncTimeout);
  }, [jobs, settings.googleCalendarConnected, loading, syncCalendar]);

  const connectGoogleCalendar = useCallback(async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const success = Math.random() > 0.2;
    if (success) {
      updateSettings({ googleCalendarConnected: true, googleCalendarLastSync: new Date().toISOString() });
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