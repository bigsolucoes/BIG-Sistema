import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Job, Client, ServiceType, JobStatus, AppSettings, JobObservation, DraftNote } from '../types';
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
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'paidAt' | 'paymentDate' | 'paymentMethod' | 'paymentAttachmentName' | 'paymentNotes' | 'isDeleted' | 'observationsLog' | 'cloudLinks' | 'isPrePaid' | 'prePaymentDate' | 'createCalendarEvent'> & Partial<Pick<Job, 'cloudLinks' | 'createCalendarEvent'>>) => void;
  updateJob: (job: Job) => void;
  deleteJob: (jobId: string) => void; // Soft delete
  permanentlyDeleteJob: (jobId: string) => void; // Hard delete
  getJobById: (jobId: string) => Job | undefined;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'cpf' | 'observations'> & Partial<Pick<Client, 'cpf' | 'observations'>>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  getClientById: (clientId: string) => Client | undefined;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addDraftNote: (draft: Omit<DraftNote, 'id' | 'createdAt' | 'updatedAt'>) => DraftNote;
  updateDraftNote: (draft: DraftNote) => void;
  deleteDraftNote: (draftId: string) => void;
  loading: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const initialJobs: Job[] = [
    { id: uuidv4(), name: 'Vídeo Promocional TechCorp', clientId: 'client1', serviceType: ServiceType.VIDEO, value: 2500, deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), status: JobStatus.PRODUCTION, cloudLinks: ['https://example.com/drive/techcorp_video'], createdAt: new Date().toISOString(), notes: 'Focus on new product features.', isDeleted: false, observationsLog: [], isPrePaid: false, createCalendarEvent: true },
    { id: uuidv4(), name: 'Sessão Fotográfica "Urban Style"', clientId: 'client2', serviceType: ServiceType.PHOTO, value: 800, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: JobStatus.BRIEFING, createdAt: new Date().toISOString(), isDeleted: false, observationsLog: [], cloudLinks: [], isPrePaid: true, prePaymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), createCalendarEvent: false },
    { id: uuidv4(), name: 'Redesign Logotipo "NatureFoods"', clientId: 'client3', serviceType: ServiceType.DESIGN, value: 1200, deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: JobStatus.REVIEW, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Client wants a modern, minimalist look.', isDeleted: false, observationsLog: [], cloudLinks: [], isPrePaid: false },
];

const initialClients: Client[] = [
    { id: 'client1', name: 'Ana Silva', company: 'TechCorp Solutions', email: 'ana.silva@techcorp.com', phone: '11987654321', createdAt: new Date().toISOString(), cpf: '111.222.333-44', observations: 'Prefere comunicação por email.' },
    { id: 'client2', name: 'Carlos Pereira', company: 'Urban Style Agency', email: 'carlos.p@urbanstyle.com', createdAt: new Date().toISOString() },
    { id: 'client3', name: 'Juliana Costa', company: 'NatureFoods Inc.', email: 'juliana.costa@naturefoods.com', phone: '21912345678', createdAt: new Date().toISOString(), observations: 'Pagamento sempre em dia.' },
];

const initialDraftNotes: DraftNote[] = [
    {id: uuidv4(), title: "Ideias Brainstorm", content: "Primeira ideia para o projeto X...", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
    {id: uuidv4(), title: "Roteiro Vídeo Y", content: "Cena 1: Abertura...", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
];

const initialSettings: AppSettings = {
  customLogo: undefined,
  asaasUrl: 'https://www.asaas.com/login',
  googleDriveUrl: 'https://drive.google.com',
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

  useEffect(() => {
    try {
      const storedJobs = localStorage.getItem('big_jobs');
      const storedClients = localStorage.getItem('big_clients');
      const storedDrafts = localStorage.getItem('big_draftNotes');
      const storedSettings = localStorage.getItem('big_settings');

      const parsedJobs = storedJobs ? JSON.parse(storedJobs) : initialJobs;
      setJobs(parsedJobs.map((job: any) => ({
        ...job,
        isDeleted: job.isDeleted === undefined ? false : job.isDeleted,
        observationsLog: job.observationsLog || [],
        cloudLinks: job.cloudLinks || (job.cloudLink ? [job.cloudLink] : []),
        isPrePaid: job.isPrePaid === undefined ? false : job.isPrePaid,
        prePaymentDate: job.prePaymentDate,
        createCalendarEvent: job.createCalendarEvent === undefined ? false : job.createCalendarEvent,
      })));

      setClients(storedClients ? JSON.parse(storedClients) : initialClients);
      setDraftNotes(storedDrafts ? JSON.parse(storedDrafts) : initialDraftNotes);
      
      const loadedSettings = storedSettings ? JSON.parse(storedSettings) : initialSettings;
      setSettings({
        primaryColor: loadedSettings.primaryColor || DEFAULT_PRIMARY_COLOR,
        accentColor: loadedSettings.accentColor || DEFAULT_ACCENT_COLOR,
        splashScreenBackgroundColor: loadedSettings.splashScreenBackgroundColor || DEFAULT_SPLASH_BACKGROUND_COLOR,
        customLogo: loadedSettings.customLogo,
        asaasUrl: loadedSettings.asaasUrl || 'https://www.asaas.com/login',
        googleDriveUrl: loadedSettings.googleDriveUrl || 'https://drive.google.com',
        userName: loadedSettings.userName || '',
        privacyModeEnabled: loadedSettings.privacyModeEnabled === undefined ? false : loadedSettings.privacyModeEnabled,
        googleCalendarConnected: loadedSettings.googleCalendarConnected === undefined ? false : loadedSettings.googleCalendarConnected,
      });

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setJobs(initialJobs.map(job => ({
        ...job,
        isDeleted: job.isDeleted === undefined ? false : job.isDeleted,
        observationsLog: job.observationsLog || [],
        cloudLinks: job.cloudLinks || [],
        isPrePaid: job.isPrePaid === undefined ? false : job.isPrePaid,
        prePaymentDate: job.prePaymentDate,
        createCalendarEvent: job.createCalendarEvent === undefined ? false : job.createCalendarEvent,
      })));
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

  const addJob = useCallback((jobData: Omit<Job, 'id' | 'createdAt' | 'paidAt' | 'paymentDate' | 'paymentMethod' | 'paymentAttachmentName' | 'paymentNotes' | 'isDeleted' | 'observationsLog' | 'cloudLinks' | 'isPrePaid' | 'prePaymentDate' | 'createCalendarEvent'> & Partial<Pick<Job, 'cloudLinks' | 'createCalendarEvent'>>) => {
    const newJob: Job = {
        ...jobData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        isDeleted: false,
        observationsLog: [],
        cloudLinks: jobData.cloudLinks || [],
        isPrePaid: false,
        prePaymentDate: undefined,
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

  const addDraftNote = useCallback((draftData: Omit<DraftNote, 'id' | 'createdAt' | 'updatedAt'>): DraftNote => {
    const newDraft: DraftNote = {
      ...draftData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDraftNotes(prev => [newDraft, ...prev]); // Add to beginning of list
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