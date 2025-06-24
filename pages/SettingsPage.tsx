import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAppData } from '../hooks/useAppData';
import toast from 'react-hot-toast';
import { APP_NAME } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner'; // Import LoadingSpinner

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, loading } = useAppData();
  
  const [customLogoPreview, setCustomLogoPreview] = useState<string | undefined>(settings.customLogo);
  const [asaasUrlInput, setAsaasUrlInput] = useState(settings.asaasUrl || '');
  const [googleDriveUrlInput, setGoogleDriveUrlInput] = useState(settings.googleDriveUrl || '');
  const [userNameInput, setUserNameInput] = useState(settings.userName || '');
  const [primaryColorInput, setPrimaryColorInput] = useState(settings.primaryColor || '#f4f4f5');
  const [accentColorInput, setAccentColorInput] = useState(settings.accentColor || '#A0522D');
  const [splashBgColorInput, setSplashBgColorInput] = useState(settings.splashScreenBackgroundColor || '#111827');

  useEffect(() => {
    if (!loading) {
      setCustomLogoPreview(settings.customLogo);
      setAsaasUrlInput(settings.asaasUrl || 'https://www.asaas.com/login');
      setGoogleDriveUrlInput(settings.googleDriveUrl || 'https://drive.google.com');
      setUserNameInput(settings.userName || '');
      setPrimaryColorInput(settings.primaryColor || '#f4f4f5');
      setAccentColorInput(settings.accentColor || '#A0522D');
      setSplashBgColorInput(settings.splashScreenBackgroundColor || '#111827');
    }
  }, [settings, loading]);

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        toast.error('O arquivo do logotipo é muito grande. Máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCustomLogoPreview(undefined);
  }

  const handleSaveChanges = () => {
    try {
        if (asaasUrlInput && !isValidHttpUrl(asaasUrlInput)) {
            toast.error('URL do Asaas inválida. Deve começar com http:// ou https://');
            return;
        }
        if (googleDriveUrlInput && !isValidHttpUrl(googleDriveUrlInput)) {
            toast.error('URL do Google Drive inválida. Deve começar com http:// ou https://');
            return;
        }
    } catch(e) {
        toast.error('Formato de URL inválido.');
        return;
    }

    updateSettings({
      customLogo: customLogoPreview,
      asaasUrl: asaasUrlInput || undefined, 
      googleDriveUrl: googleDriveUrlInput || undefined,
      userName: userNameInput || undefined,
      primaryColor: primaryColorInput,
      accentColor: accentColorInput,
      splashScreenBackgroundColor: splashBgColorInput,
    });
    toast.success('Configurações salvas com sucesso!');
  };

  const isValidHttpUrl = (string: string) => {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;  
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }
  
  const commonInputClass = "w-full p-2 border border-border-color rounded-md focus:ring-2 focus:ring-custom-brown focus:border-custom-brown text-text-primary outline-none transition-shadow bg-card-bg";
  const sectionCardClass = "bg-card-bg p-6 rounded-xl shadow-lg";
  const colorInputClass = "p-1 h-10 w-full border border-border-color rounded-md cursor-pointer";


  if (loading) return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-text-primary">Configurações</h1>

      {/* User Data Section */}
      <div className={sectionCardClass}>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Dados do Usuário</h2>
        <div>
            <label htmlFor="userName" className="block text-sm font-medium text-text-secondary mb-1">Seu Nome (para saudação no Dashboard)</label>
            <input 
              type="text" 
              id="userName" 
              value={userNameInput} 
              onChange={(e) => setUserNameInput(e.target.value)} 
              className={commonInputClass}
              placeholder="Ex: João Silva"
            />
          </div>
      </div>
      
      {/* Appearance Section */}
      <div className={sectionCardClass}>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Personalização da Aparência</h2>
        
        {/* Logo Upload */}
        <div className="mb-6">
            <h3 className="text-lg font-medium text-text-primary mb-2">Logotipo da Aplicação</h3>
            <div className="flex items-center space-x-4">
            <div>
                <p className="text-sm text-text-secondary mb-1">Prévia do Logo Atual:</p>
                {customLogoPreview ? (
                <img src={customLogoPreview} alt="Custom Logo Preview" className="h-12 border border-border-color rounded p-1 bg-slate-100"/>
                ) : (
                <span className={`text-2xl font-bold text-accent border border-border-color rounded p-2 bg-slate-100`}>{APP_NAME}</span>
                )}
            </div>
            <div className="flex-grow">
                <label htmlFor="logoUpload" className="block text-sm font-medium text-text-secondary mb-1">
                    Substituir Logotipo (PNG, JPG, SVG - Máx 2MB)
                </label>
                <input 
                    type="file" 
                    id="logoUpload" 
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleLogoUpload}
                    className={`${commonInputClass} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:brightness-90`}
                />
            </div>
            {customLogoPreview && (
                <button 
                    onClick={handleRemoveLogo}
                    className="bg-red-500 text-white px-3 py-2 rounded-lg shadow hover:bg-red-600 transition-colors text-sm self-end"
                >
                    Remover Logo
                </button>
            )}
            </div>
        </div>

        {/* Color Pickers */}
        <div className="mb-6">
            <h3 className="text-lg font-medium text-text-primary mb-2">Cores do Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-text-secondary mb-1">Cor Primária (Fundo Principal)</label>
                    <input type="color" id="primaryColor" value={primaryColorInput} onChange={(e) => setPrimaryColorInput(e.target.value)} className={colorInputClass} />
                </div>
                <div>
                    <label htmlFor="accentColor" className="block text-sm font-medium text-text-secondary mb-1">Cor de Acento (Botões, Links)</label>
                    <input type="color" id="accentColor" value={accentColorInput} onChange={(e) => setAccentColorInput(e.target.value)} className={colorInputClass} />
                </div>
                <div>
                    <label htmlFor="splashBgColor" className="block text-sm font-medium text-text-secondary mb-1">Cor Fundo Tela de Abertura</label>
                    <input type="color" id="splashBgColor" value={splashBgColorInput} onChange={(e) => setSplashBgColorInput(e.target.value)} className={colorInputClass} />
                </div>
            </div>
        </div>
      </div>


      <div className={sectionCardClass}>
        <h2 className="text-xl font-semibold text-text-primary mb-4">URLs Externas (Iframes)</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="asaasUrl" className="block text-sm font-medium text-text-secondary mb-1">URL da Página de Pagamentos (Asaas)</label>
            <input 
              type="url" 
              id="asaasUrl" 
              value={asaasUrlInput} 
              onChange={(e) => setAsaasUrlInput(e.target.value)} 
              className={commonInputClass}
              placeholder="Ex: https://www.asaas.com/login"
            />
             <p className="text-xs text-text-secondary mt-1">Deixe em branco para usar a URL padrão.</p>
          </div>
          <div>
            <label htmlFor="googleDriveUrl" className="block text-sm font-medium text-text-secondary mb-1">URL da Página de Arquivos (Google Drive)</label>
            <input 
              type="url" 
              id="googleDriveUrl" 
              value={googleDriveUrlInput} 
              onChange={(e) => setGoogleDriveUrlInput(e.target.value)} 
              className={commonInputClass}
              placeholder="Ex: https://drive.google.com"
            />
            <p className="text-xs text-text-secondary mt-1">Deixe em branco para usar a URL padrão.</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSaveChanges}
          className="bg-accent text-white px-6 py-3 rounded-lg shadow hover:brightness-90 transition-all text-lg font-semibold"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;