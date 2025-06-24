
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import ClientsPage from './pages/ClientsPage';
import FinancialsPage from './pages/FinancialsPage';
import PerformancePage from './pages/PerformancePage';
import CommunicationPage from './pages/CommunicationPage';
import AIAssistantPage from './pages/AIAssistantPage';
import SettingsPage from './pages/SettingsPage';
import AsaasPaymentPage from './pages/AsaasPaymentPage';
import GoogleDrivePage from './pages/GoogleDrivePage';
import { AppDataProvider, useAppData } from './hooks/useAppData';
import { Toaster } from 'react-hot-toast';
import BrandingSplashScreen from './components/BrandingSplashScreen'; 
// import LoadingSplashScreen from './components/LoadingSplashScreen'; // Removed

// This component remains largely the same, but its visibility is controlled by the App component.
const AppContent: React.FC<{ appContentVisible: boolean }> = ({ appContentVisible }) => {
  const { loading: appDataLoading } = useAppData();

  // If appDataLoading is true, content might render with empty states briefly.
  // The LoadingSplashScreen was removed as per request.
  // if (appDataLoading) {
  //   return null; // Or a very minimal text loader if desired, but not the full component
  // }

  return (
    <div 
      className={`flex flex-col h-screen bg-main-bg text-text-primary transition-opacity duration-500 ease-in-out ${appContentVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/financials" element={<FinancialsPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/communication" element={<CommunicationPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/asaas" element={<AsaasPaymentPage />} />
            <Route path="/drive" element={<GoogleDrivePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

const App: React.FC = () => {
  const [appPhase, setAppPhase] = useState<'initial' | 'branding' | 'fading' | 'application'>('initial');

  useEffect(() => {
    if (appPhase === 'initial') {
      const brandingSplashShownThisSession = sessionStorage.getItem('brandingSplashShown');
      if (brandingSplashShownThisSession) {
        setAppPhase('application'); // Skip branding, go straight to app
      } else {
        setAppPhase('branding'); // Start branding phase
      }
    }
  }, [appPhase]);

  useEffect(() => {
    let brandingDisplayTimer: NodeJS.Timeout | undefined;
    let fadeTransitionTimer: NodeJS.Timeout | undefined;

    if (appPhase === 'branding') {
      brandingDisplayTimer = setTimeout(() => {
        setAppPhase('fading'); // Move to fading phase after 2 seconds
      }, 2000);
    } else if (appPhase === 'fading') {
      fadeTransitionTimer = setTimeout(() => {
        setAppPhase('application'); // Move to application phase after 0.5 seconds
        sessionStorage.setItem('brandingSplashShown', 'true');
      }, 500);
    }

    return () => {
      if (brandingDisplayTimer) clearTimeout(brandingDisplayTimer);
      if (fadeTransitionTimer) clearTimeout(fadeTransitionTimer);
    };
  }, [appPhase]);

  // Determine what to render based on appPhase
  let brandingElement = null;
  if (appPhase === 'branding' || appPhase === 'fading') {
    brandingElement = <BrandingSplashScreen isFadingOut={appPhase === 'fading'} />;
  }

  let appContentElement = null;
  // AppContent is rendered and becomes visible during 'fading' and 'application' phases
  if (appPhase === 'fading' || appPhase === 'application') {
    // The `appContentVisible` prop being true will trigger the fade-in animation within AppContent
    appContentElement = <AppContent appContentVisible={true} />;
  }

  if (appPhase === 'initial') {
    return null; // Or a minimal non-styled loader for the brief session check.
  }

  return (
    <AppDataProvider>
      {brandingElement}
      {appContentElement}
    </AppDataProvider>
  );
};

export default App;
