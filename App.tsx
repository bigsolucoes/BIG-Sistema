
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
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import CalendarPage from './pages/CalendarPage';
import ArchivePage from './pages/ArchivePage';
import DraftsPage from './pages/DraftsPage';
import { useAppData } from './hooks/useAppData';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import BrandingSplashScreen from './components/BrandingSplashScreen';
import LoadingSpinner from './components/LoadingSpinner';

// MainLayout defines the structure of the authenticated app (sidebar, header, content).
const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-main-bg text-text-primary">
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
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/drafts" element={<DraftsPage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/communication" element={<CommunicationPage />} />
            <Route path="/ai-assistant" element={<AIAssistantPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
};

// This component handles the splash screen animation after authentication.
const AnimatedAppOutlet: React.FC = () => {
    // We only get here if the user is authenticated.
    const [phase, setPhase] = useState<'initial' | 'branding' | 'fading' | 'application'>('initial');

    useEffect(() => {
        const splashShown = sessionStorage.getItem('brandingSplashShown');
        if (splashShown) {
            setPhase('application');
            return;
        }

        // Start the splash screen sequence
        setPhase('branding');
        const fadeTimer = setTimeout(() => setPhase('fading'), 2000);
        const appTimer = setTimeout(() => {
            setPhase('application');
            sessionStorage.setItem('brandingSplashShown', 'true');
        }, 2500); // 2000ms branding + 500ms fade animation

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(appTimer);
        };
    }, []);

    // Return nothing until the effect has decided the initial phase to prevent flicker
    if (phase === 'initial') {
        return null;
    }
    
    const showBranding = phase === 'branding' || phase === 'fading';
    const showApp = phase === 'application' || phase === 'fading';

    return (
        <>
            {showBranding && <BrandingSplashScreen isFadingOut={phase === 'fading'} />}
            <div className={`transition-opacity duration-500 ease-in-out ${showApp ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <MainLayout />
            </div>
        </>
    );
};

// The main router component that decides which page group to show.
const AppRouter: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const { loading: dataLoading } = useAppData();

  // Unified loading check. The app is ready only when both auth and data are loaded.
  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-main-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes for authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* All other routes are protected */}
      <Route element={<ProtectedRoute />}>
        {/* AnimatedAppOutlet handles the splash screen and then shows the MainLayout which contains all app routes */}
        <Route path="/*" element={<AnimatedAppOutlet />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return <AppRouter />;
};

export default App;
