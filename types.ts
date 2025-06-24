export enum ServiceType {
  VIDEO = 'Vídeo',
  PHOTO = 'Fotografia',
  DESIGN = 'Design',
  OTHER = 'Outro',
}

export enum JobStatus {
  BRIEFING = 'Briefing', // A Fazer
  PRODUCTION = 'Produção', // Em Progresso
  REVIEW = 'Revisão',
  FINALIZED = 'Finalizado', // Concluído
  PAID = 'Pago',
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  cpf?: string; 
  observations?: string; 
  createdAt: string;
}

export interface Job {
  id: string;
  name: string;
  clientId: string;
  serviceType: ServiceType;
  value: number;
  deadline: string; // ISO string date
  status: JobStatus;
  cloudLink?: string;
  createdAt: string;
  paidAt?: string; // ISO string date - Used for "data_de_pagamento"
  notes?: string;
}

export enum FinancialStatus {
  PENDING = 'Aguardando Pagamento',
  PAID = 'Pago',
  OVERDUE = 'Atrasado',
}

export interface FinancialRecord extends Job {
  financialStatus: FinancialStatus;
  clientName?: string;
}

export interface AIChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  relatedData?: unknown; 
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  retrievedContext?: {
    uri: string;
    title: string;
  };
}

export interface AppSettings {
  customLogo?: string; // base64 string
  asaasUrl?: string;
  googleDriveUrl?: string;
  userName?: string; // New: For personalized greeting
  primaryColor?: string; // New: For main app background
  accentColor?: string; // New: For accent elements
  splashScreenBackgroundColor?: string; // New: For branding splash screen background
}