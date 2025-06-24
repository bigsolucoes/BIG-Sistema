import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Job, Client, ServiceType, JobStatus, AppSettings } from '../types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Default theme colors
const DEFAULT_PRIMARY_COLOR = '#f4f4f5'; // zinc-100
const DEFAULT_ACCENT_COLOR = '#A0522D'; // Brown (Sienna)
const DEFAULT_SPLASH_BACKGROUND_COLOR = '#111827'; // Dark Slate (e.g., gray-900)


interface AppDataContextType {
  jobs: Job[];
  clients: Client[];
  settings: AppSettings;
  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => void;
  updateJob: (job: Job) => void;
  deleteJob: (jobId: string) => void;
  getJobById: (jobId: string) => Job | undefined;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'cpf' | 'observations'> & Partial<Pick<Client, 'cpf' | 'observations'>>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  getClientById: (clientId: string) => Client | undefined;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  loading: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const initialJobs: Job[] = [
    { id: uuidv4(), name: 'Vídeo Promocional TechCorp', clientId: 'client1', serviceType: ServiceType.VIDEO, value: 2500, deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), status: JobStatus.PRODUCTION, cloudLink: 'https://example.com/drive/techcorp_video', createdAt: new Date().toISOString(), notes: 'Focus on new product features.' },
    { id: uuidv4(), name: 'Sessão Fotográfica "Urban Style"', clientId: 'client2', serviceType: ServiceType.PHOTO, value: 800, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: JobStatus.BRIEFING, createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Redesign Logotipo "NatureFoods"', clientId: 'client3', serviceType: ServiceType.DESIGN, value: 1200, deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: JobStatus.REVIEW, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Client wants a modern, minimalist look.' },
    { id: uuidv4(), name: 'Cobertura Evento "MusicFest"', clientId: 'client1', serviceType: ServiceType.PHOTO, value: 1500, deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: JobStatus.BRIEFING, createdAt: new Date().toISOString() },
    { id: uuidv4(), name: 'Animação Curta "StarDust"', clientId: 'client2', serviceType: ServiceType.VIDEO, value: 3200, deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), status: JobStatus.FINALIZED, paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() },
];

const initialClients: Client[] = [
    { id: 'client1', name: 'Ana Silva', company: 'TechCorp Solutions', email: 'ana.silva@techcorp.com', phone: '11987654321', createdAt: new Date().toISOString(), cpf: '111.222.333-44', observations: 'Prefere comunicação por email.' },
    { id: 'client2', name: 'Carlos Pereira', company: 'Urban Style Agency', email: 'carlos.p@urbanstyle.com', createdAt: new Date().toISOString() },
    { id: 'client3', name: 'Juliana Costa', company: 'NatureFoods Inc.', email: 'juliana.costa@naturefoods.com', phone: '21912345678', createdAt: new Date().toISOString(), observations: 'Pagamento sempre em dia.' },
];

const initialSettings: AppSettings = {
  customLogo: undefined,
  asaasUrl: 'https://www.asaas.com/login',
  googleDriveUrl: 'https://drive.google.com',
  userName: '',
  primaryColor: DEFAULT_PRIMARY_COLOR,
  accentColor: DEFAULT_ACCENT_COLOR,
  splashScreenBackgroundColor: DEFAULT_SPLASH_BACKGROUND_COLOR,
};


export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [loading, setLoading] = useState<boolean>(true);

  // Apply theme colors from settings to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--color-main-bg', settings.primaryColor || DEFAULT_PRIMARY_COLOR);
    document.documentElement.style.setProperty('--color-accent', settings.accentColor || DEFAULT_ACCENT_COLOR);
    // Note: --color-input-focus-border might also need to be derived or made configurable
    // For now, it uses a darker shade of accent, which might not always work if accent is very light.
    // A simple approach for input focus border if accent is light: use a fixed dark gray or a darker version of primary.
    // Or, in index.html, make --color-input-focus-border also configurable or derived.
    // For simplicity, we'll keep the current derivation logic in index.html for focus border.
  }, [settings.primaryColor, settings.accentColor]);

  useEffect(() => {
    try {
      const storedJobs = localStorage.getItem('big_jobs');
      const storedClients = localStorage.getItem('big_clients');
      const storedSettings = localStorage.getItem('big_settings');

      setJobs(storedJobs ? JSON.parse(storedJobs) : initialJobs);
      setClients(storedClients ? JSON.parse(storedClients) : initialClients);
      
      const loadedSettings = storedSettings ? JSON.parse(storedSettings) : initialSettings;
      // Ensure all settings fields have defaults if not present in loadedSettings
      setSettings({
        ...initialSettings, // Start with defaults
        ...loadedSettings    // Override with loaded values
      });

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setJobs(initialJobs); 
      setClients(initialClients);
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
        localStorage.setItem('big_settings', JSON.stringify(settings));
    }
  }, [settings, loading]);


  const addJob = useCallback((jobData: Omit<Job, 'id' | 'createdAt'>) => {
    const newJob: Job = { ...jobData, id: uuidv4(), createdAt: new Date().toISOString() };
    setJobs(prev => [...prev, newJob]);
  }, []);

  const updateJob = useCallback((updatedJob: Job) => {
    setJobs(prev => prev.map(job => job.id === updatedJob.id ? updatedJob : job));
  }, []);

  const deleteJob = useCallback((jobId: string) => {
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


  const contextValue: AppDataContextType = {
    jobs,
    clients,
    settings,
    addJob,
    updateJob,
    deleteJob,
    getJobById,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
    updateSettings,
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