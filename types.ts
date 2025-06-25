
export enum ServiceType {
  VIDEO = 'Vídeo',
  PHOTO = 'Fotografia',
  DESIGN = 'Design',
  SITES = 'Sites',
  AUXILIAR_T = 'Auxiliar T.',
  FRELLA = 'Frella',
  PROGRAMACAO = 'Programação',
  REDACAO = 'Redação',
  OTHER = 'Outro',
}

export enum JobStatus {
  BRIEFING = 'Briefing',
  PRODUCTION = 'Produção',
  REVIEW = 'Revisão',
  FINALIZED = 'Finalizado',
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

export interface JobObservation {
  id: string;
  text: string;
  timestamp: string;
}

export interface Job {
  id: string;
  name: string;
  clientId: string;
  serviceType: ServiceType;
  value: number;
  deadline: string; // ISO string date
  status: JobStatus;
  cloudLinks?: string[]; 
  createdAt: string;
  paidAt?: string; // ISO string date - Specifically for when payment was made
  notes?: string; // General job notes

  // New fields for detailed payment registration
  paymentDate?: string; // The actual date payment was registered/received
  paymentMethod?: string;
  paymentAttachmentName?: string; // Filename of the attachment
  paymentAttachmentData?: string; // Optional: base64 data if storing file content
  paymentNotes?: string; // Notes specific to the payment

  // New fields for Lixeira and Observations
  isDeleted?: boolean;
  observationsLog?: JobObservation[];

  // New fields for v2.5
  isPrePaid?: boolean;
  prePaymentDate?: string; // ISO string date for advance payment
  createCalendarEvent?: boolean; // For Google Calendar integration
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
  // googleDriveUrl?: string; // Removed
  userName?: string; // This is for display name in dashboard, not auth username
  primaryColor?: string;
  accentColor?: string;
  splashScreenBackgroundColor?: string;
  privacyModeEnabled?: boolean; // New: For obfuscating monetary values
  googleCalendarConnected?: boolean; // For GCal integration status
}

export interface User {
  id:string;
  username: string; 
}

export interface DraftNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  imageBase64?: string; // For storing the low-quality image
  imageMimeType?: string; // To correctly display the image
}
