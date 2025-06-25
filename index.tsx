
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HashRouter } from 'react-router-dom';
import { AppDataProvider } from './hooks/useAppData';
import { AuthProvider } from './hooks/useAuth'; // Import AuthProvider

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HashRouter>
      <AppDataProvider> {/* AppDataProvider should wrap AuthProvider if AuthProvider depends on AppData */}
        <AuthProvider> {/* Or vice-versa depending on dependencies. Here, AuthProvider likely doesn't need AppData directly. */}
          <App />
        </AuthProvider>
      </AppDataProvider>
    </HashRouter>
  </React.StrictMode>
);
