
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/media', label: 'Mídias' },
    { path: '/playlists', label: 'Playlists' },
    { path: '/devices', label: 'Dispositivos' },
  ];
  
  return (
    <header className="bg-brand-darkBlue text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center">
              <span className="font-bold">MI</span>
            </div>
            <h1 className="text-xl font-bold">Mídia Indoor</h1>
          </div>
          
          <nav>
            <ul className="flex space-x-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "px-4 py-2 rounded-md hover:bg-brand-blue/20 transition-colors",
                      location.pathname === item.path && "bg-brand-blue font-medium"
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
