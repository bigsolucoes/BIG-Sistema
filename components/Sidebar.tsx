import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS, APP_NAME, ACCENT_COLOR } from '../constants';
import { useAppData } from '../hooks/useAppData'; // Import useAppData

const Sidebar: React.FC = () => {
  const { settings } = useAppData(); // Get settings from context

  const sidebarTitle = settings.userName || "Menu Principal";

  return (
    <div className={`w-64 p-5 flex flex-col space-y-6 h-full shadow-lg 
                    bg-slate-800 bg-opacity-75 backdrop-filter backdrop-blur-lg 
                    text-slate-100 border-r border-slate-700`}>
      <div className={`text-xl font-bold text-center text-${ACCENT_COLOR} py-2`}>
        {sidebarTitle}
      </div>
      <nav className="flex-grow">
        <ul>
          {NAVIGATION_ITEMS.map((item) => (
            <li key={item.name} className="mb-2">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition-colors duration-200 ease-in-out filter hover:brightness-100 ${
                    isActive ? `bg-${ACCENT_COLOR} text-white shadow-md` : 'hover:text-slate-50'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}</p>
        <p>BIG Soluções</p>
      </div>
    </div>
  );
};

export default Sidebar;