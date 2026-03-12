import React, { useState } from 'react';
import { Menu, X, MapPin, Info } from 'lucide-react';

export const BetaTenantLogo: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <a href="https://betatenant.com" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
    <img 
      src="/logo_v2.svg" 
      alt="Beta Tenant Logo" 
      className={size === 'sm' ? "h-10 w-auto object-contain" : "h-12 md:h-16 w-auto object-contain"} 
      referrerPolicy="no-referrer"
    />
  </a>
);

interface HeaderProps {
  activeTab?: 'area-gist' | 'report-agent';
}

export const Header: React.FC<HeaderProps> = ({ activeTab = 'area-gist' }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-100 z-50 h-20 md:h-24 flex items-center">
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <BetaTenantLogo />
        </div>

        {/* Center: Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <a 
            href="/" 
            className={`font-semibold text-lg relative py-2 transition-colors ${
              activeTab === 'area-gist' 
                ? "text-[#000066] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#000066] after:rounded-full" 
                : "text-slate-500 hover:text-[#000066]"
            }`}
          >
            Area Gist
          </a>
          <a 
            href="https://betatenant.com/report/search" 
            className={`font-semibold text-lg transition-colors ${
              activeTab === 'report-agent'
                ? "text-[#000066] after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#000066] after:rounded-full"
                : "text-slate-500 hover:text-[#000066]"
            }`}
          >
            Report Agent
          </a>
        </nav>

        {/* Right: Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <a 
            href="https://betatenant.com/login" 
            className="px-8 py-3 rounded-full bg-[#E8EAF0] text-[#000066] font-bold hover:bg-[#DDE0E8] transition-colors"
          >
            Sign in
          </a>
          <a 
            href="https://betatenant.com/signup" 
            className="px-8 py-3 rounded-full bg-[#000066] text-white font-bold hover:bg-[#000044] transition-colors shadow-lg shadow-blue-900/20"
          >
            Sign up
          </a>
        </div>

        {/* Hamburger Button (Mobile) */}
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="md:hidden w-10 h-10 pl-[9px] pt-[10px] rounded-full bg-[#E8EAF0] text-[#000066] hover:bg-[#DDE0E8] transition-colors"
        >
          <Menu size={22} className="-mt-[11px] p-0 m-0" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-12">
            <BetaTenantLogo size="sm" />
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="p-3 rounded-full border-2 border-[#000066] text-[#000066] hover:bg-slate-50 transition-colors"
            >
              <X size={28} />
            </button>
          </div>

          <nav className="flex flex-col gap-8 mb-12">
            <a 
              href="/" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-4 text-xl font-semibold text-slate-700 hover:text-[#000066] transition-colors"
            >
              <MapPin className="text-slate-400" size={24} />
              Area Gist
            </a>
            <a 
              href="https://betatenant.com/report/search" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-4 text-xl font-semibold text-slate-700 hover:text-[#000066] transition-colors"
            >
              <Info className="text-slate-400" size={24} />
              Report Agent
            </a>
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            <a 
              href="https://betatenant.com/login" 
              className="w-full py-5 rounded-full bg-[#E8EAF0] text-[#000066] font-bold text-center text-lg hover:bg-[#DDE0E8] transition-colors"
            >
              Sign in
            </a>
            <a 
              href="https://betatenant.com/signup" 
              className="w-full py-5 rounded-full bg-[#000066] text-white font-bold text-center text-lg hover:bg-[#000044] transition-colors shadow-lg shadow-blue-900/20"
            >
              Sign up
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
