import React from 'react';

export const APP_NAME = "BIG";
export const ACCENT_COLOR = "custom-brown"; // This will be dynamically overridden by settings

// Placeholder Icons - replace with actual SVGs if available or desired
function CogIconComponent() { // Renamed to avoid conflict with exported CogIcon
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-.707-.707a2 2 0 010-2.828l3-3zm-5.172 9.172a2 2 0 112.828 2.828l3-3a2 2 0 010-2.828l-.707-.707a2 2 0 01-2.828 0l-3 3zM10 12a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

function FolderIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
    );
}


export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: <HomeIcon /> },
  { name: 'Jobs', path: '/jobs', icon: <BriefcaseIcon /> },
  { name: 'Clientes', path: '/clients', icon: <UsersIcon /> },
  { name: 'Financeiro', path: '/financials', icon: <CreditCardIcon /> },
  { name: 'Desempenho', path: '/performance', icon: <ChartBarIcon /> },
  { name: 'WhatsApp', path: '/communication', icon: <ChatBubbleIcon /> }, // Renamed from Comunicação
  { name: 'Pagamentos (Asaas)', path: '/asaas', icon: <LinkIcon /> },
  { name: 'Arquivos (Drive)', path: '/drive', icon: <FolderIcon /> },
  { name: 'Assistente AI', path: '/ai-assistant', icon: <SparklesIcon /> },
  { name: 'Configurações', path: '/settings', icon: <CogIconComponent /> }, // Use the local component name
];

export const JOB_STATUS_OPTIONS = [
  { value: 'BRIEFING', label: 'Briefing' },
  { value: 'PRODUCTION', label: 'Produção' },
  { value: 'REVIEW', label: 'Revisão' },
  { value: 'FINALIZED', label: 'Finalizado' },
  { value: 'PAID', label: 'Pago' },
];

export const SERVICE_TYPE_OPTIONS = [
  { value: 'VIDEO', label: 'Vídeo' },
  { value: 'PHOTO', label: 'Fotografia' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'OTHER', label: 'Outro' },
];

export const KANBAN_COLUMNS = [
  { id: 'BRIEFING', title: 'Briefing', status: 'BRIEFING' },
  { id: 'PRODUCTION', title: 'Produção', status: 'PRODUCTION' },
  { id: 'REVIEW', title: 'Revisão', status: 'REVIEW' },
  { id: 'FINALIZED', title: 'Finalizado', status: 'FINALIZED' },
  { id: 'PAID', title: 'Pago', status: 'PAID' },
];


// SVG Icons (Heroicons v1 style for simplicity)
function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
    </svg>
  );
}

export function BriefcaseIcon() { 
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v1H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2V4a2 2 0 00-2-2zm0 2H8v1h4V4z" clipRule="evenodd" />
    </svg>
  );
}
export function UsersIcon() { 
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-3 7a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5zm11-6a3 3 0 11-6 0 3 3 0 016 0zm-3 7a5 5 0 00-4.062 2.5H16v-1a5 5 0 00-4-4.5zM15 16.5a.5.5 0 11-1 0 .5.5 0 011 0z" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 4a2 2 0 012-2h10a2 2 0 012 2v2H3V4zm0 4h14v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm3 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function ChartBarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v14a1 1 0 102 0V3a1 1 0 00-1-1zM4 6a1 1 0 00-1 1v10a1 1 0 102 0V7a1 1 0 00-1-1zm12 0a1 1 0 00-1 1v10a1 1 0 102 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      {/* Updated WhatsApp-like icon */}
      <path d="M10 2C5.033 2 1 5.671 1 10.04c0 1.63.504 3.153 1.385 4.437L1 19l4.746-1.378A8.04 8.04 0 0010 18.08c4.968 0 9-3.671 9-8.04C19 5.671 14.968 2 10 2zm0 14.04c-1.403 0-2.736-.346-3.896-.967l-.278-.165L3.81 16.19l1.405-2.016-.188-.29A6.996 6.996 0 013 10.04c0-3.323 2.894-6.04 7-6.04s7 2.717 7 6.04-2.894 6.04-7 6.04z"/>
      <path d="M7.433 7.824c-.104-.26-.407-.448-.73-.456-.303-.01-.59.096-.813.296-.25.228-.432.54-.432.968 0 .54.27 1.02.576 1.416.324.408.828.976 1.68 1.824.9.912 1.764 1.576 2.796 2.052.888.424 1.5.56 1.98.512.6-.064.936-.312.936-.936s-.084-1.296-.156-1.416c-.072-.12-.228-.192-.456-.336-.228-.144-.456-.072-.648.072-.192.144-.768.912-1.008 1.056-.24.144-.468.12-.66-.048-.192-.168-1.044-.504-1.98-1.224-.888-.672-1.428-1.524-1.5-1.728-.072-.204.06-.312.192-.42.12-.096.264-.264.384-.384.12-.12.192-.264.264-.408.072-.144.036-.264-.036-.36z"/>
    </svg>
  );
}

export function SparklesIcon() { 
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zm0 14a1 1 0 00-1 1v1a1 1 0 002 0v-1a1 1 0 00-1-1zm6.071-11.071a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zm-10.707 9.293a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM2 10a1 1 0 00-1-1H0a1 1 0 000 2h1a1 1 0 001-1zm14 0a1 1 0 00-1-1h-1a1 1 0 000 2h1a1 1 0 001-1zm-6.071 3.071a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707zm-3.535-7.071a1 1 0 00-1.414 1.414l.707.707a1 1 0 001.414-1.414l-.707-.707z" clipRule="evenodd" />
    </svg>
  );
}

export function PlusCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

export function XIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

export function TrashIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    );
}

export function PencilIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    );
}

export function CheckCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    );
}

export function ExclamationCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-13a1 1 0 011 1v4a1 1 0 11-2 0V6a1 1 0 011-1zm0 8a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
        </svg>
    );
}

export function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
    );
}

export function CurrencyDollarIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}> {/* Adjusted strokeWidth for potential better look */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-6h6m-6.364 4.636A9 9 0 1116.636 7.364 9 9 0 017.364 16.636z" />
      </svg>
    );
}

// Export new icons
export const CogIcon = CogIconComponent; // Export with original intended name
export { LinkIcon, FolderIcon };