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
  paidAt?: string; // ISO string date - Specifically for when payment was made
  notes?: string; // General job notes

  // New fields for detailed payment registration
  paymentDate?: string; // The actual date payment was registered/received
  paymentMethod?: string;
  paymentAttachmentName?: string; // Filename of the attachment
  paymentAttachmentData?: string; // Optional: base64 data if storing file content
  paymentNotes?: string; // Notes specific to the payment
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
  userName?: string; 
  primaryColor?: string; 
  accentColor?: string; 
  splashScreenBackgroundColor?: string;
  privacyModeEnabled?: boolean; // New: For obfuscating monetary values
}