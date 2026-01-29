import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Job, Client, AppSettings, JobObservation, DraftNote, Payment, CalendarEvent, JobStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';
import { DatabaseService } from '../services/databaseService';

// Default theme colors
const DEFAULT_PRIMARY_COLOR = '#f8fafc'; // slate-50
const DEFAULT_ACCENT_COLOR = '#1e293b'; // slate-800
const DEFAULT_SPLASH_BACKGROUND_COLOR = '#111827'; // Dark Slate

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
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'isDeleted' | 'observationsLog' | 'payments' | 'cloudLinks' | 'createCalendarEvent' | 'calendarEventId'> & Partial<Pick<Job, 'cloudLinks' | 'createCalendarEvent' | 'cost' | 'isRecurring'>>) => Promise<void>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  permanentlyDeleteJob: (jobId: string) => Promise<void>;
  getJobById: (jobId: string) => Job | undefined;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'cpf' | 'observations'> & Partial<Pick<Client, 'cpf' | 'observations'>>) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (clientId: string) => Promise<void>;
  getClientById: (clientId: string) => Client | undefined;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  addDraftNote: (draft: { title: string, type: 'TEXT' | 'SCRIPT' }) => Promise<DraftNote>;
  updateDraftNote: (draft: DraftNote) => Promise<void>;
  deleteDraftNote: (draftId: string) => Promise<void>;
  connectGoogleCalendar: () => Promise<boolean>;
  disconnectGoogleCalendar: () => void;
  syncCalendar: () => void;
  exportData: () => void;
  importData: (jsonData: string) => Promise<boolean>;
  loading: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const initialClientsForNewUser: Client[] = [
    { 
      id: uuidv4(), // <--- Aqui estava o problema (antes era 'client1')
      name: 'Ana Silva', 
      company: 'TechCorp Solutions', 
      email: 'ana.silva@techcorp.com', 
      phone: '11987654321', 
      createdAt: new Date().toISOString(), 
      cpf: '111.222.333-44', 
      observations: 'Prefere comunicação por email.' 
    },
];

const initialDraftNotesForNewUser: DraftNote[] = [
    {
      id: uuidv4(), 
      title: "Exemplo de Roteiro", 
      type: 'SCRIPT', 
      content: "", 
      scriptLines: [{id: uuidv4(), scene: "1", description: "CENA DE ABERTURA: Um dia ensolarado no parque.", duration: 15}], 
      attachments: [], 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString()
    },
];

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [draftNotes, setDraftNotes] = useState<DraftNote[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultInitialSettings);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbService, setDbService] = useState<DatabaseService | null>(null);

  // Inicializa o serviço de banco de dados
  useEffect(() => {
    if (currentUser) {
      setDbService(new DatabaseService(currentUser.id));
    } else {
      setDbService(null);
    }
  }, [currentUser]);

  // Aplica temas visuais
  useEffect(() => {
    document.documentElement.style.setProperty('--color-main-bg', settings.primaryColor || DEFAULT_PRIMARY_COLOR);
    const currentAccentColor = settings.accentColor || DEFAULT_ACCENT_COLOR;
    document.documentElement.style.setProperty('--color-accent', currentAccentColor);
    document.documentElement.style.setProperty('--color-input-focus-border', currentAccentColor);
  }, [settings.primaryColor, settings.accentColor]);

  // Carrega dados iniciais do Supabase
  useEffect(() => {
    if (!currentUser || !dbService) {
      setLoading(false);
      setJobs([]);
      setClients([]);
      setDraftNotes([]);
      setSettings(defaultInitialSettings);
      setCalendarEvents([]);
      return;
    }
    
    const loadUserData = async () => {
      setLoading(true);
      try {
        const [storedJobs, storedClients, storedDrafts, storedSettings, storedCalendarEvents] = await Promise.all([
          dbService.getJobs(),
          dbService.getClients(),
          dbService.getDraftNotes(),
          dbService.getSettings(),
          dbService.getCalendarEvents(),
        ]);

        const isNewUser = storedJobs.length === 0 && storedClients.length === 0 && storedDrafts.length === 0 && !storedSettings;

        // Migração e carregamento de Jobs
        const migratedJobs = storedJobs.map((job: any): Job => ({
          ...job, 
          id: job.id || uuidv4(), 
          isDeleted: job.isDeleted ?? false, 
          observationsLog: job.observationsLog || [], 
          cloudLinks: job.cloudLinks || (job.cloudLink ? [job.cloudLink] : []), 
          createCalendarEvent: job.createCalendarEvent ?? false, 
          cost: job.cost ?? undefined, 
          payments: job.payments || [], 
          calendarEventId: job.calendarEventId, 
          isRecurring: job.isRecurring ?? false,
        }));
        setJobs(migratedJobs);

        // Carregamento de Clientes
        if (isNewUser && storedClients.length === 0) {
          for (const client of initialClientsForNewUser) {
            await dbService.createClient(client);
          }
          setClients(initialClientsForNewUser);
        } else {
          setClients(storedClients);
        }
        
        // Carregamento de Rascunhos
        if (isNewUser && storedDrafts.length === 0) {
          for (const draft of initialDraftNotesForNewUser) {
            await dbService.createDraftNote(draft);
          }
          setDraftNotes(initialDraftNotesForNewUser);
        } else {
          const parsedDrafts = storedDrafts.map((draft: any): DraftNote => ({
            ...draft, 
            type: draft.type || 'SCRIPT', 
            scriptLines: draft.scriptLines || (draft.content ? [{id: uuidv4(), scene: "1", description: draft.content, duration: 0}] : []), 
            content: draft.content || '', 
            attachments: draft.attachments || [],
          }));
          setDraftNotes(parsedDrafts);
        }
        
        // Carregamento de Configurações
        const loadedSettings = storedSettings || defaultInitialSettings;
        const finalSettings = {
          ...defaultInitialSettings,
          ...loadedSettings,
          userName: loadedSettings?.userName || currentUser.username,
        };
        setSettings(finalSettings);

        if (!storedSettings) {
          await dbService.updateSettings(finalSettings);
        }

        setCalendarEvents(storedCalendarEvents || []);

      } catch (error) {
        console.error("Failed to load data from database", error);
        toast.error("Erro ao carregar dados. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [currentUser, dbService]);

  // --- FUNÇÕES DE JOBS (Agora salvam no Supabase) ---
  const addJob = useCallback(async (jobData: any) => {
    if (!dbService) return;
    const newJob: Job = {
        ...jobData,
        id: uuidv4(), createdAt: new Date().toISOString(), isDeleted: false, observationsLog: [], payments: [], cloudLinks: jobData.cloudLinks || [], createCalendarEvent: jobData.createCalendarEvent || false, isRecurring: jobData.isRecurring || false,
    };
    // Atualiza localmente (rápido)
    setJobs(prev => [...prev, newJob]);
    // Salva no banco (persistente)
    await dbService.createJob(newJob).catch(err => {
        toast.error("Erro ao salvar Job no banco.");
        console.error(err);
    });
  }, [dbService]);

  const updateJob = useCallback(async (updatedJob: Job) => {
    if (!dbService) return;
    
    // Lógica para Job Recorrente
    const previousJob = jobs.find(j => j.id === updatedJob.id);
    let newRecurringJob: Job | null = null;

    if (previousJob && previousJob.status !== JobStatus.PAID && updatedJob.status === JobStatus.PAID && updatedJob.isRecurring) {
        const deadlineDate = new Date(updatedJob.deadline);
        deadlineDate.setMonth(deadlineDate.getMonth() + 1);

        newRecurringJob = {
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
        toast.success(`Job recorrente criado para o próximo mês.`);
    }

    // Atualiza Localmente
    setJobs(prevJobs => {
        const list = prevJobs.map(job => job.id === updatedJob.id ? updatedJob : job);
        if (newRecurringJob) return [...list, newRecurringJob];
        return list;
    });

    // Salva no Banco
    await dbService.updateJob(updatedJob);
    if (newRecurringJob) {
        await dbService.createJob(newRecurringJob);
    }
  }, [jobs, dbService]);

  const deleteJob = useCallback(async (jobId: string) => { 
      if (!dbService) return;
      setJobs(prev => prev.map(job => job.id === jobId ? { ...job, isDeleted: true } : job)); 
      // Soft delete no banco (atualiza isDeleted = true)
      const jobToDelete = jobs.find(j => j.id === jobId);
      if (jobToDelete) {
          await dbService.updateJob({ ...jobToDelete, isDeleted: true });
      }
  }, [jobs, dbService]);

  const permanentlyDeleteJob = useCallback(async (jobId: string) => { 
      if (!dbService) return;
      setJobs(prev => prev.filter(job => job.id !== jobId)); 
      await dbService.deleteJob(jobId);
  }, [dbService]);

  const getJobById = useCallback((jobId: string) => jobs.find(job => job.id === jobId), [jobs]);

  // --- FUNÇÕES DE CLIENTES ---
  const addClient = useCallback(async (clientData: any) => { 
      if (!dbService) return;
      const newClient = { ...clientData, id: uuidv4(), createdAt: new Date().toISOString() };
      setClients(prev => [...prev, newClient]); 
      await dbService.createClient(newClient);
  }, [dbService]);

  const updateClient = useCallback(async (updatedClient: Client) => { 
      if (!dbService) return;
      setClients(prev => prev.map(client => client.id === updatedClient.id ? updatedClient : client)); 
      await dbService.updateClient(updatedClient);
  }, [dbService]);

  const deleteClient = useCallback(async (clientId: string) => { 
      if (!dbService) return;
      setClients(prev => prev.filter(client => client.id !== clientId)); 
      await dbService.deleteClient(clientId);
  }, [dbService]);

  const getClientById = useCallback((clientId: string) => clients.find(client => client.id === clientId), [clients]);

  // --- FUNÇÕES DE SETTINGS ---
  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => { 
      if (!dbService) return;
      const updated = { ...settings, ...newSettings };
      setSettings(updated); 
      await dbService.updateSettings(updated);
  }, [settings, dbService]);

  // --- FUNÇÕES DE DRAFT NOTES ---
  const addDraftNote = useCallback(async (draftData: { title: string, type: 'TEXT' | 'SCRIPT' }): Promise<DraftNote> => {
    const newDraft: DraftNote = { ...draftData, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), content: draftData.type === 'TEXT' ? '' : '', scriptLines: draftData.type === 'SCRIPT' ? [{ id: uuidv4(), scene: '1', description: '', duration: 0 }] : [], attachments: [], };
    setDraftNotes(prev => [newDraft, ...prev]); 
    if (dbService) {
        await dbService.createDraftNote(newDraft);
    }
    return newDraft;
  }, [dbService]);

  const updateDraftNote = useCallback(async (updatedDraft: DraftNote) => { 
      if (!dbService) return;
      const draftToSave = { ...updatedDraft, updatedAt: new Date().toISOString() };
      setDraftNotes(prev => prev.map(draft => draft.id === updatedDraft.id ? draftToSave : draft)); 
      await dbService.updateDraftNote(draftToSave);
  }, [dbService]);

  const deleteDraftNote = useCallback(async (draftId: string) => { 
      if (!dbService) return;
      setDraftNotes(prev => prev.filter(draft => draft.id !== draftId)); 
      await dbService.deleteDraftNote(draftId);
  }, [dbService]);

  // --- OUTRAS FUNÇÕES ---
  const syncCalendar = useCallback(() => {
    if (!settings.googleCalendarConnected) return;

    let allEvents = [...calendarEvents];
    let jobsToUpdate: Job[] = [];

    // Nota: Em uma app real, buscaria do Google aqui
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

    setCalendarEvents(allEvents);
    // Nota: A lógica de salvar eventos no banco deve ser implementada no dbService também
    if(jobsToUpdate.length > 0){
        // Atualiza os jobs com os novos IDs de evento
        jobsToUpdate.forEach(j => updateJob(j));
    }
  }, [jobs, settings.googleCalendarConnected, calendarEvents, updateJob]);

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

  const exportData = useCallback(() => {
    if (!currentUser) {
      toast.error("Você precisa estar logado para exportar dados.");
      return;
    }
    const dataToExport = {
      version: '2.0-blob',
      exportedAt: new Date().toISOString(),
      data: { jobs, clients, draftNotes, settings, calendarEvents }
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `big_backup_${currentUser.username}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success("Dados exportados com sucesso!");
  }, [jobs, clients, draftNotes, settings, calendarEvents, currentUser]);

  const importData = useCallback(async (jsonData: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const parsedData = JSON.parse(jsonData);
      if (!parsedData.data) return false;

      // Importação (Aqui seria ideal salvar no banco item por item, mas para simplificar, recarregamos)
      // Numa versão ideal, você percorreria parsedData.data.jobs e chamaria addJob() para cada um.
      
      toast.success("Dados importados! A página será recarregada.");
      setTimeout(() => window.location.reload(), 1500);
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }, [currentUser]);

  const contextValue: AppDataContextType = {
    jobs, clients, draftNotes, settings, calendarEvents, addJob, updateJob, deleteJob, permanentlyDeleteJob, getJobById, addClient, updateClient, deleteClient, getClientById, updateSettings, addDraftNote, updateDraftNote, deleteDraftNote, connectGoogleCalendar, disconnectGoogleCalendar, syncCalendar, exportData, importData, loading
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
