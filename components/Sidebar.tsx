

import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS, APP_NAME, ACCENT_COLOR, ExternalLinkIcon } from '../constants';
import { LucideProps } from 'lucide-react'; // For typing item.icon
import { useAppData } from '../hooks/useAppData'; // For Asaas URL from settings

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<LucideProps>; // Ensure icon is a component type
}

const Sidebar: React.FC = () => {
  const { settings } = useAppData();
  const asaasUrl = settings.asaasUrl || 'https://www.asaas.com/login';
  const googleDriveUrl = 'https://drive.google.com';
  const googlePhotosUrl = 'https://photos.google.com';

  return (
    <div className={`w-64 p-5 hidden md:flex md:flex-col space-y-2 h-full shadow-lg 
                    bg-slate-800 bg-opacity-75 backdrop-filter backdrop-blur-lg 
                    text-slate-100 border-r border-slate-700`}>
      <nav className="flex-grow mt-4"> 
        <ul>
          {(NAVIGATION_ITEMS as NavigationItem[]).map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.name} className="mb-2">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition-colors duration-200 ease-in-out filter hover:brightness-100 ${
                      isActive ? `bg-${ACCENT_COLOR} text-white shadow-md` : 'hover:text-slate-50'
                    }`
                  }
                >
                  {IconComponent && <IconComponent size={20} />}
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* External Links Section */}
      <div className="mt-4 pt-4 border-t border-slate-600 space-y-2">
        <a
          href={asaasUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white transition-colors duration-200 ease-in-out filter hover:brightness-110"
        >
          <ExternalLinkIcon size={20} />
          <span>Acessar Asaas</span>
        </a>
        <a
          href={googleDriveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white transition-colors duration-200 ease-in-out filter hover:brightness-110"
        >
          <ExternalLinkIcon size={20} />
          <span>Acessar Drive</span>
        </a>
        <a
          href={googlePhotosUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white transition-colors duration-200 ease-in-out filter hover:brightness-110"
        >
          <ExternalLinkIcon size={20} />
          <span>Acessar Google Fotos</span>
        </a>
      </div>

      <div className="text-center text-xs text-slate-400 mt-auto pt-4 pb-2"> {/* Added pt-4 to give space from external links */}
        <p>&copy; {new Date().getFullYear()} {APP_NAME}</p>
        <p>BIG Soluções</p>
      </div>
    </div>
  );
};

export default Sidebar;
