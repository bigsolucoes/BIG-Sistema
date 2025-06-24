
import React from 'react';
import { useAppData } from '../hooks/useAppData';
import LoadingSpinner from '../components/LoadingSpinner';

const GoogleDrivePage: React.FC = () => {
  const { settings, loading } = useAppData();
  const defaultDriveUrl = 'https://drive.google.com';
  const driveUrl = settings.googleDriveUrl || defaultDriveUrl;

  if (loading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
  }

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-bold text-text-primary mb-4">Arquivos (Google Drive)</h1>
       <p className="text-sm text-text-secondary mb-1">
        URL Configurada: <a href={driveUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{driveUrl}</a>
      </p>
      <p className="text-xs text-text-secondary mb-4">
        Se a página não carregar corretamente ou para funcionalidades completas, pode ser necessário abrir o link diretamente em uma nova aba. 
        Você pode alterar esta URL na página de <a href="#/settings" className="text-accent hover:underline">Configurações</a>.
      </p>
      <div className="flex-grow bg-card-bg rounded-lg shadow-lg overflow-hidden border border-border-color">
        <iframe
          src={driveUrl}
          title="Google Drive"
          className="w-full h-full border-0"
          // Sandbox might be too restrictive for Google Drive login. Start with less restrictive.
          // sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
        ></iframe>
      </div>
    </div>
  );
};

export default GoogleDrivePage;
