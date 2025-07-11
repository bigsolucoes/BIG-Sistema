
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Job, Client, ServiceType, JobStatus, AppSettings, JobObservation, DraftNote, Payment, ScriptLine, Attachment } from '../types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Default theme colors
const DEFAULT_PRIMARY_COLOR = '#FFFFFF'; // White
const DEFAULT_ACCENT_COLOR = '#007AFF'; // Vibrant Blue
const DEFAULT_SPLASH_BACKGROUND_COLOR = '#111827'; // Dark Slate (e.g., gray-900)


interface AppDataContextType {
  jobs: Job[];
  clients: Client[];
  draftNotes: DraftNote[];
  settings: AppSettings;
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'isDeleted' | 'observationsLog' | 'payments' | 'cloudLinks' | 'createCalendarEvent'> & Partial<Pick<Job, 'cloudLinks' | 'createCalendarEvent' | 'cost'>>) => void;
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
  loading: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const initialJobs: Job[] = []; // Start with no jobs, loaded from localStorage

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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-main-bg', settings.primaryColor || DEFAULT_PRIMARY_COLOR);
    const currentAccentColor = settings.accentColor || DEFAULT_ACCENT_COLOR;
    document.documentElement.style.setProperty('--color-accent', currentAccentColor);
    document.documentElement.style.setProperty('--color-input-focus-border', currentAccentColor);
  }, [settings.primaryColor, settings.accentColor]);

  // Data Loading and Migration Effect
  useEffect(() => {
    try {
      const storedJobs = localStorage.getItem('big_jobs');
      const storedClients = localStorage.getItem('big_clients');
      const storedDrafts = localStorage.getItem('big_draftNotes');
      const storedSettings = localStorage.getItem('big_settings');

      // Migrate Jobs
      let parsedJobs = storedJobs ? JSON.parse(storedJobs) : initialJobs;
      const migratedJobs = parsedJobs.map((job: any): Job => {
        // Migration from old payment system to new `payments` array
        if (!job.payments) {
          job.payments = [];
          if (job.isPrePaid && job.prePaymentDate) {
              job.payments.push({
                  id: uuidv4(),
                  amount: job.value,
                  date: job.prePaymentDate,
                  notes: 'Pagamento antecipado (migrado)',
                  method: 'N/A'
              });
          } else if (job.paidAt || job.paymentDate) {
              job.payments.push({
                  id: uuidv4(),
                  amount: job.value,
                  date: job.paymentDate || job.paidAt,
                  notes: job.paymentNotes || 'Pagamento final (migrado)',
                  method: job.paymentMethod || 'N/A'
              });
          }
        }
        // Clean up old fields
        delete job.paidAt;
        delete job.paymentDate;
        delete job.paymentMethod;
        delete job.paymentAttachmentName;
        delete job.paymentAttachmentData;
        delete job.paymentNotes;
        delete job.isPrePaid;
        delete job.prePaymentDate;
        
        return {
          ...job,
          id: job.id || uuidv4(),
          isDeleted: job.isDeleted ?? false,
          observationsLog: job.observationsLog || [],
          cloudLinks: job.cloudLinks || (job.cloudLink ? [job.cloudLink] : []),
          createCalendarEvent: job.createCalendarEvent ?? false,
          cost: job.cost ?? undefined,
          payments: job.payments || [],
        };
      });
      setJobs(migratedJobs);


      setClients(storedClients ? JSON.parse(storedClients) : initialClients);
      
      // Migrate Drafts to new format
      const parsedDrafts = storedDrafts ? JSON.parse(storedDrafts) : initialDraftNotes;
      setDraftNotes(parsedDrafts.map((draft: any): DraftNote => ({
        ...draft,
        type: draft.type || 'SCRIPT', // Default existing drafts to SCRIPT
        scriptLines: draft.scriptLines || (draft.content ? [{id: uuidv4(), scene: "1", description: draft.content, duration: 0}] : []),
        content: draft.content || '',
        attachments: draft.attachments || [], // Add empty attachments array
        // Clear old image fields just in case
        imageBase64: undefined, 
        imageMimeType: undefined,
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
      });

    } catch (error) {
      console.error("Failed to load or migrate data from localStorage", error);
      // Set to empty or default if error
      setJobs([]);
      setClients(initialClients);
      setDraftNotes(initialDraftNotes);
      setSettings(initialSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
        localStorage.setItem('big_jobs', JSON.stringify(jobs));
    }
  }, [jobs, loading]);

  useEffect(() => {
    if(!loading) {
        localStorage.setItem('big_clients', JSON.stringify(clients));
    }
  }, [clients, loading]);

  useEffect(() => {
    if(!loading) {
        localStorage.setItem('big_draftNotes', JSON.stringify(draftNotes));
    }
  }, [draftNotes, loading]);

  useEffect(() => {
    if(!loading) {
        localStorage.setItem('big_settings', JSON.stringify(settings));
    }
  }, [settings, loading]);

 const addJob = useCallback((jobData: Omit<Job, 'id' | 'createdAt' | 'isDeleted' | 'observationsLog' | 'payments' | 'cloudLinks' | 'createCalendarEvent'> & Partial<Pick<Job, 'cloudLinks' | 'createCalendarEvent' | 'cost'>>) => {
    const newJob: Job = {
        ...jobData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        isDeleted: false,
        observationsLog: [],
        payments: [],
        cloudLinks: jobData.cloudLinks || [],
        createCalendarEvent: jobData.createCalendarEvent || false,
    };
    setJobs(prev => [...prev, newJob]);
  }, []);

  const updateJob = useCallback((updatedJob: Job) => {
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
  }, []);

  const deleteJob = useCallback((jobId: string) => { 
    setJobs(prev => prev.map(job => job.id === jobId ? { ...job, isDeleted: true } : job));
  }, []);

  const permanentlyDeleteJob = useCallback((jobId: string) => { 
    setJobs(prev => prev.filter(job => job.id !== jobId));
  }, []);
  
  const getJobById = useCallback((jobId: string) => {
    return jobs.find(job => job.id === jobId);
  }, [jobs]);

  const addClient = useCallback((clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = { ...clientData, id: uuidv4(), createdAt: new Date().toISOString() };
    setClients(prev => [...prev, newClient]);
  }, []);

  const updateClient = useCallback((updatedClient: Client) => {
    setClients(prev => prev.map(client => client.id === updatedClient.id ? updatedClient : client));
  }, []);

  const deleteClient = useCallback((clientId: string) => {
    setClients(prev => prev.filter(client => client.id !== clientId));
  }, []);

  const getClientById = useCallback((clientId: string) => {
    return clients.find(client => client.id === clientId);
  }, [clients]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const addDraftNote = useCallback((draftData: { title: string, type: 'TEXT' | 'SCRIPT' }): DraftNote => {
    const newDraft: DraftNote = {
      ...draftData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: draftData.type === 'TEXT' ? '' : '',
      scriptLines: draftData.type === 'SCRIPT' ? [{ id: uuidv4(), scene: '1', description: '', duration: 0 }] : [],
      attachments: [],
    };
    setDraftNotes(prev => [newDraft, ...prev]);
    return newDraft;
  }, []);

  const updateDraftNote = useCallback((updatedDraft: DraftNote) => {
    setDraftNotes(prev => prev.map(draft => draft.id === updatedDraft.id ? { ...updatedDraft, updatedAt: new Date().toISOString() } : draft));
  }, []);

  const deleteDraftNote = useCallback((draftId: string) => {
    setDraftNotes(prev => prev.filter(draft => draft.id !== draftId));
  }, []);


  const contextValue: AppDataContextType = {
    jobs,
    clients,
    draftNotes,
    settings,
    addJob,
    updateJob,
    deleteJob,
    permanentlyDeleteJob,
    getJobById,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
    updateSettings,
    addDraftNote,
    updateDraftNote,
    deleteDraftNote,
    loading
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
