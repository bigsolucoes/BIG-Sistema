import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { APP_NAME, CogIcon, EyeOpenIcon, EyeClosedIcon } from '../constants';

const Header: React.FC = () => {
  const { settings, updateSettings } = useAppData();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const togglePrivacyMode = () => {
    updateSettings({ privacyModeEnabled: !settings.privacyModeEnabled });
  };

  return (
    <header className="bg-card-bg text-text-primary p-4 shadow-md flex justify-between items-center h-16">
      {/* Logo on the left */}
      <div 
        onClick={handleLogoClick}
        className="cursor-pointer flex items-center"
        title="Ir para o Dashboard"
      >
        {settings.customLogo ? (
          <img src={settings.customLogo} alt={`${APP_NAME} Logo`} className="h-8 max-h-full max-w-xs object-contain" />
        ) : (
          <span className="text-2xl font-bold text-accent">{APP_NAME}</span>
        )}
      </div>

      {/* Icons on the right */}
      <div className="flex items-center space-x-3">
        <button
          onClick={togglePrivacyMode}
          className="p-2 text-text-secondary hover:text-accent transition-colors"
          title={settings.privacyModeEnabled ? "Mostrar Valores Monetários" : "Ocultar Valores Monetários"}
        >
          {settings.privacyModeEnabled ? <EyeClosedIcon /> : <EyeOpenIcon />}
        </button>
        <Link 
          to="/settings" 
          className="p-2 text-text-secondary hover:text-accent transition-colors"
          title="Configurações"
        >
          <CogIcon />
        </Link>
      </div>
    </header>
  );
};

export default Header;