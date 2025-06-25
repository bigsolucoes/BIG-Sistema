
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS, APP_NAME, ACCENT_COLOR } from '../constants';
import { LucideProps } from 'lucide-react'; // For typing item.icon

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ComponentType<LucideProps>; // Ensure icon is a component type
}

const Sidebar: React.FC = () => {

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
      <div className="text-center text-xs text-slate-400 mt-auto pb-2">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}</p>
        <p>BIG Soluções</p>
      </div>
    </div>
  );
};

export default Sidebar;
