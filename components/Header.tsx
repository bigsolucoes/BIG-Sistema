
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../hooks/useAppData';
import { useAuth } from '../hooks/useAuth'; 
import { APP_NAME, SettingsIcon, EyeOpenIcon, EyeClosedIcon } from '../constants'; // Updated CogIcon to SettingsIcon

const Header: React.FC = () => {
  const { settings, updateSettings } = useAppData();
  const { logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogoClick = () => {
    logout(); 
  };

  const togglePrivacyMode = () => {
    updateSettings({ privacyModeEnabled: !settings.privacyModeEnabled });
  };

  return (
    <header className="bg-card-bg text-text-primary p-4 shadow-md flex justify-between items-center h-16 sticky top-0 z-30"> {/* Added sticky and z-index */}
      {/* Logo on the left */}
      <div 
        onClick={handleLogoClick}
        className="cursor-pointer flex items-center"
        title="Sair do Sistema"
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
          {settings.privacyModeEnabled ? <EyeClosedIcon size={20} /> : <EyeOpenIcon size={20} />}
        </button>
        <Link 
          to="/settings" 
          className="p-2 text-text-secondary hover:text-accent transition-colors"
          title="Configurações"
        >
          <SettingsIcon size={20} /> {/* Using SettingsIcon from lucide */}
        </Link>
      </div>
    </header>
  );
};

export default Header;