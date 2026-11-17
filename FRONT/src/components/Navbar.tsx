import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Car, Users, LogOut, ExternalLink } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-[#282D36] border-b border-[#3A4250] sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center gap-8">
            <NavLink to="/vehicles" className="flex items-center gap-3 group">
              <img
                src="/assets/logo-full.png"
                alt="CarTálogo"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </NavLink>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              <NavLink
                to="/vehicles"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#20242B] text-[#F28C28] border border-[#F28C28]/30 shadow-inner'
                      : 'text-[#E9EDF2]/80 hover:text-white hover:bg-[#20242B]/50'
                  }`
                }
              >
                <Car className="w-4 h-4" />
                Veículos
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admins"
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#20242B] text-[#F28C28] border border-[#F28C28]/30 shadow-inner'
                        : 'text-[#E9EDF2]/80 hover:text-white hover:bg-[#20242B]/50'
                    }`
                  }
                >
                  <Users className="w-4 h-4" />
                  Administradores
                </NavLink>
              )}

              <a
                href="http://localhost:5231/swagger"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#E9EDF2]/60 hover:text-[#E9EDF2] hover:bg-[#20242B]/50 transition-colors"
              >
                Swagger API
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-[#E9EDF2] tracking-wide">
                {user?.email}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5 ${
                  isAdmin
                    ? 'bg-[#F28C28]/20 text-[#F28C28] border border-[#F28C28]/30'
                    : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                }`}
              >
                {user?.profile}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Sair do sistema"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
