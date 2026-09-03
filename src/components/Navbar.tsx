import React, { useState } from 'react';
import { 
  Boxes, 
  Download, 
  GitCommit, 
  Image as ImageIcon, 
  Shield, 
  ShieldCheck, 
  Terminal, 
  ExternalLink, 
  Menu, 
  X,
  Sparkles,
  UserCheck,
  Pickaxe,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GameInfo } from '../types';
import { BetterCraftLogo } from './BetterCraftLogo';

interface NavbarProps {
  gameInfo: GameInfo;
  onOpenAdminPanel: () => void;
  onOpenAdminLogin: () => void;
  onOpenAddScreenshot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  gameInfo,
  onOpenAdminPanel,
  onOpenAdminLogin,
  onOpenAddScreenshot
}) => {
  const { user, isAdmin, isSuperAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (window.history.pushState) {
        window.history.pushState(null, '', `#${id}`);
      } else {
        window.location.hash = id;
      }
    }
  };

  const handleQuickDownload = () => {
    window.open('https://github.com/wrxxnch/bettercraft/archive/refs/heads/main.zip', '_blank');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-4 border-[#241f30] bg-[#120f1c]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Project Name */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
            >
              <div className="w-10 h-10 mc-slot bg-[#1b1726] flex items-center justify-center border-2 border-[#55ffff] p-1 overflow-hidden">
                <BetterCraftLogo />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-wider text-white group-hover:text-[#55ffff] transition-colors mc-text-shadow font-minecraft">
                  BETTERCRAFT
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 mc-slot text-[#55ff55]">
                  LUANTI
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => scrollToSection('recursos')}
              className="px-3 py-1.5 text-xs font-bold uppercase text-[#cfcbd9] hover:text-white hover:bg-[#201c2b] transition-colors cursor-pointer"
            >
              Recursos
            </button>
            <button
              onClick={() => scrollToSection('galeria')}
              className="px-3 py-1.5 text-xs font-bold uppercase text-[#cfcbd9] hover:text-white hover:bg-[#201c2b] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#55ffff]" />
              Capturas
            </button>
            <button
              onClick={() => scrollToSection('changelog')}
              className="px-3 py-1.5 text-xs font-bold uppercase text-[#cfcbd9] hover:text-white hover:bg-[#201c2b] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <GitCommit className="w-3.5 h-3.5 text-[#ffaa00]" />
              Changelog & Commits
            </button>
            <button
              onClick={() => scrollToSection('instalacao')}
              className="px-3 py-1.5 text-xs font-bold uppercase text-[#cfcbd9] hover:text-white hover:bg-[#201c2b] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5 text-[#ffff55]" />
              Como Jogar
            </button>
            <a
              href="https://github.com/wrxxnch/bettercraft"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-bold uppercase text-[#8e8999] hover:text-[#55ffff] hover:bg-[#201c2b] transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </nav>

          {/* Right Action Area (Admin & Download) */}
          <div className="hidden sm:flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAdminPanel}
                  id="btn-nav-admin-panel"
                  className="mc-btn mc-btn-diamond px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Abrir Painel Administrativo"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Painel Admin</span>
                </button>

                <button
                  onClick={onOpenAdminLogin}
                  className="mc-btn px-2.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
                  title={`Conectado como: ${user?.email}`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#55ff55]" />
                  <span className="max-w-[100px] truncate font-mono text-[10px]">
                    {user?.email.split('@')[0]}
                  </span>
                </button>
              </div>
            ) : !gameInfo.hidePublicAdminLogin ? (
              <button
                onClick={onOpenAdminLogin}
                className="mc-btn px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer text-[#cfcbd9]"
              >
                <Shield className="w-3.5 h-3.5 text-[#8e8999]" />
                <span>Login</span>
              </button>
            ) : null}

            {/* Main Download CTA Button */}
            <button
              onClick={handleQuickDownload}
              className="mc-btn mc-btn-green px-4 py-2 text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>JOGAR AGORA (ZIP)</span>
            </button>
          </div>

          {/* Mobile Menu Button & Mobile Quick Logout */}
          <div className="flex md:hidden items-center gap-1.5">
            {isAdmin && (
              <>
                <button
                  onClick={onOpenAdminPanel}
                  className="mc-btn mc-btn-diamond px-2 py-1.5 text-xs flex items-center gap-1"
                  title="Painel Admin"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-mono max-w-[60px] truncate hidden xs:inline">
                    {user?.name?.split(' ')[0] || 'Admin'}
                  </span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Deseja realmente sair da sua conta de administrador?')) {
                      logout();
                    }
                  }}
                  className="mc-btn mc-btn-red p-1.5 text-xs flex items-center justify-center cursor-pointer"
                  title="Sair da Conta (Logout)"
                  aria-label="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mc-btn p-1.5 text-xs ml-0.5"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b-2 border-[#241f30] bg-[#171321] px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => scrollToSection('recursos')}
            className="w-full text-left px-3 py-2 text-xs font-bold uppercase text-[#cfcbd9] hover:bg-[#221c2e]"
          >
            Recursos do Jogo
          </button>
          <button
            onClick={() => scrollToSection('galeria')}
            className="w-full text-left px-3 py-2 text-xs font-bold uppercase text-[#cfcbd9] hover:bg-[#221c2e] flex items-center gap-2"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#55ffff]" />
            <span>Capturas de Tela</span>
          </button>
          <button
            onClick={() => scrollToSection('changelog')}
            className="w-full text-left px-3 py-2 text-xs font-bold uppercase text-[#cfcbd9] hover:bg-[#221c2e] flex items-center gap-2"
          >
            <GitCommit className="w-3.5 h-3.5 text-[#ffaa00]" />
            <span>Changelog & Commits</span>
          </button>
          <button
            onClick={() => scrollToSection('instalacao')}
            className="w-full text-left px-3 py-2 text-xs font-bold uppercase text-[#cfcbd9] hover:bg-[#221c2e] flex items-center gap-2"
          >
            <Terminal className="w-3.5 h-3.5 text-[#ffff55]" />
            <span>Como Instalar & Jogar</span>
          </button>
          <a
            href="https://github.com/wrxxnch/bettercraft"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase text-[#8e8999] hover:bg-[#221c2e]"
          >
            <span>GitHub: wrxxnch/bettercraft</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <div className="pt-3 border-t-2 border-[#2b2438] flex flex-col gap-2">
            {isAdmin ? (
              <div className="space-y-2">
                <div className="p-2.5 mc-slot bg-[#120f1a] border border-[#3b344a] flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <UserCheck className="w-4 h-4 text-[#55ff55] flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-bold text-white truncate font-mono">
                        {user?.name || user?.email}
                      </p>
                      <p className="text-[9px] text-[#55ffff] font-mono uppercase">
                        {user?.role === 'owner' ? 'Proprietário' : 'Administrador'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (window.confirm('Deseja realmente sair da sua conta de administrador?')) {
                        logout();
                      }
                    }}
                    className="mc-btn mc-btn-red px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
                    title="Desconectar da conta"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminPanel();
                  }}
                  className="mc-btn mc-btn-diamond w-full py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Abrir Painel Admin</span>
                </button>
              </div>
            ) : !gameInfo.hidePublicAdminLogin ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="mc-btn w-full py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                <span>Login</span>
              </button>
            ) : null}

            <button
              onClick={handleQuickDownload}
              className="mc-btn mc-btn-green w-full py-2.5 text-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 stroke-[3]" />
              <span>Baixar BetterCraft (ZIP)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
