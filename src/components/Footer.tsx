import React from 'react';
import { 
  Boxes, 
  GitBranch, 
  ExternalLink, 
  ShieldCheck, 
  Heart, 
  Download, 
  ArrowUp,
  Pickaxe,
  Code,
  Package,
  Users,
  BookOpen
} from 'lucide-react';
import { GameInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import { BetterCraftLogo } from './BetterCraftLogo';

interface FooterProps {
  gameInfo: GameInfo;
  onOpenAdminPanel: () => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  gameInfo,
  onOpenAdminPanel,
  onOpenAdminLogin
}) => {
  const { user, isAdmin } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0e0b16] border-t-4 border-[#241f30] pt-12 pb-8 text-[#9e9aa8] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b-2 border-[#201b2c]">
          
          {/* Col 1: About & Logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 mc-slot bg-[#1e1929] flex items-center justify-center border-2 border-[#55ffff] p-0.5 overflow-hidden">
                <BetterCraftLogo />
              </div>
              <span className="font-extrabold text-base tracking-wide text-white mc-text-shadow font-minecraft">
                LUANTI BETTERCRAFT
              </span>
            </div>
            <p className="text-[#b4afc4] text-xs leading-relaxed">
              {gameInfo.longDescription}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2 py-0.5 mc-slot text-[#55ff55] font-mono text-[10px]">
                Luanti Engine {gameInfo.luantiVersion}
              </span>
              <span className="px-2 py-0.5 mc-slot text-[#55ffff] font-mono text-[10px]">
                {gameInfo.license}
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider font-minecraft">
              NAVEGAÇÃO DO SITE
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="#recursos" className="hover:text-[#55ffff] transition-colors">
                  ▶ Recursos do Jogo
                </a>
              </li>
              <li>
                <a href="#galeria" className="hover:text-[#55ffff] transition-colors">
                  ▶ Galeria de Capturas
                </a>
              </li>
              <li>
                <a href="#ecossistema" className="hover:text-[#55ffff] transition-colors">
                  ▶ Ecossistema Blockframe
                </a>
              </li>
              <li>
                <a href="#changelog" className="hover:text-[#55ffff] transition-colors">
                  ▶ Changelog & Commits
                </a>
              </li>
              <li>
                <a href="#instalacao" className="hover:text-[#55ffff] transition-colors">
                  ▶ Guia de Instalação
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Blockframe & Repositórios Oficiais */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[#55ffff] uppercase text-[11px] tracking-wider font-minecraft">
              ECOSSISTEMA BLOCKFRAME & REPOS
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a 
                  href={gameInfo.gamesRepoUrl || "https://github.com/wrxxnch/bettercraft"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#55ff55] transition-colors inline-flex items-center gap-1 text-[#55ff55] font-bold"
                >
                  <GitBranch className="w-3 h-3 flex-shrink-0" />
                  <span>games/bettercraft</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a 
                  href={gameInfo.officialCodeRepoUrl || "https://github.com/wrxxnch/luanti-bettercraft"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#55ffff] transition-colors inline-flex items-center gap-1 text-[#cfcbd9]"
                >
                  <Code className="w-3 h-3 text-[#55ffff] flex-shrink-0" />
                  <span>Código Oficial Luanti-BetterCraft</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a 
                  href={gameInfo.blockframeContentDbUrl || "https://content.luanti.org/packages/wrxxnch/blockframe/"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#ffaa00] transition-colors inline-flex items-center gap-1 text-[#cfcbd9]"
                >
                  <Package className="w-3 h-3 text-[#ffaa00] flex-shrink-0" />
                  <span>Mod Blockframe no ContentDB</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a 
                  href={gameInfo.blockframeCommunityUrl || "https://wrxxnch.github.io/blockframecommunity/"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#55ffff] transition-colors inline-flex items-center gap-1 text-[#cfcbd9]"
                >
                  <Users className="w-3 h-3 text-[#55ffff] flex-shrink-0" />
                  <span>Blockframe Comunidade</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a 
                  href={gameInfo.blockframeTutorialsUrl || "https://wrxxnch.github.io/blockframesite/"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#ffff55] transition-colors inline-flex items-center gap-1 text-[#cfcbd9]"
                >
                  <BookOpen className="w-3 h-3 text-[#ffff55] flex-shrink-0" />
                  <span>Tutoriais do Blockframe</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Administrador & Luanti links */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider font-minecraft">
              SISTEMA & ADMIN
            </h4>
            <ul className="space-y-1.5 text-xs">
              {isAdmin ? (
                <>
                  <li>
                    <button
                      onClick={onOpenAdminPanel}
                      className="text-[#55ffff] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#55ff55]" />
                      <span>Painel de Controle Admin</span>
                    </button>
                  </li>
                  <li className="text-[10px] text-[#8e8999] font-mono">
                    Conectado: {user?.email}
                  </li>
                </>
              ) : (
                <li>
                  <button
                    onClick={onOpenAdminLogin}
                    className="text-[#b4afc4] hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Login de Administrador</span>
                  </button>
                </li>
              )}
              <li className="pt-2">
                <a
                  href="https://www.luanti.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#55ffff] inline-flex items-center gap-1 text-[#8e8999]"
                >
                  <span>Luanti.org Engine</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="https://content.luanti.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#55ffff] inline-flex items-center gap-1 text-[#8e8999]"
                >
                  <span>ContentDB Luanti</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[#797485] text-[11px]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Luanti BetterCraft. Criado pela comunidade.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="hover:text-[#55ffff] flex items-center gap-1 cursor-pointer"
            >
              <span>Topo</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
