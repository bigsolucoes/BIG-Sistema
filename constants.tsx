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

function LinkIconComponent() { // Renamed to avoid conflict
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0l-.707-.707a2 2 0 010-2.828l3-3zm-5.172 9.172a2 2 0 112.828 2.828l3-3a2 2 0 010-2.828l-.707-.707a2 2 0 01-2.828 0l-3 3zM10 12a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

function FolderIconComponent() { // Renamed to avoid conflict
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
    );
}

// Actual WhatsApp Icon
function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.173.200-.296.300-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
    </svg>
  );
}


export const NAVIGATION_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: <HomeIcon /> },
  { name: 'Jobs', path: '/jobs', icon: <BriefcaseIcon /> },
  { name: 'Clientes', path: '/clients', icon: <UsersIcon /> },
  { name: 'Financeiro', path: '/financials', icon: <CreditCardIcon /> },
  { name: 'Desempenho', path: '/performance', icon: <ChartBarIcon /> },
  { name: 'WhatsApp', path: '/communication', icon: <WhatsAppIcon /> }, // Corrected icon
  { name: 'Pagamentos (Asaas)', path: '/asaas', icon: <LinkIconComponent /> },
  { name: 'Arquivos (Drive)', path: '/drive', icon: <FolderIconComponent /> },
  { name: 'Assistente AI', path: '/ai-assistant', icon: <SparklesIcon /> },
  { name: 'Configurações', path: '/settings', icon: <CogIconComponent /> }, 
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
export function HomeIcon() { // Exporting for potential future use or consistency
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
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}> 
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-6h6m-6.364 4.636A9 9 0 1116.636 7.364 9 9 0 017.364 16.636z" />
      </svg>
    );
}

export function EyeOpenIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

export function EyeClosedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.242M9.879 9.879l4.242 4.242M9.75 9.75L3 3m12 12l1.875-1.875M17.25 6.75L21 3" />
    </svg>
  );
}

export function ListBulletIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}


// Export new icons
export const CogIcon = CogIconComponent; 
export const LinkIcon = LinkIconComponent;
export const FolderIcon = FolderIconComponent;
export const WhatsAppIconExport = WhatsAppIcon; // Exporting the new icon
// TableCellsIcon could be added if a specific table icon is desired for Kanban view toggle. For now, BriefcaseIcon can represent Kanban.
// export function TableCellsIcon() { ... }