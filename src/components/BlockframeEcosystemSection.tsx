import React, { useState } from 'react';
import { 
  Boxes, 
  ExternalLink, 
  BookOpen, 
  Users, 
  Package, 
  GitBranch, 
  Code, 
  Copy, 
  Check, 
  Sparkles, 
  Layers, 
  Network, 
  Compass, 
  ArrowRight
} from 'lucide-react';
import { GameInfo } from '../types';

interface BlockframeEcosystemSectionProps {
  gameInfo: GameInfo;
}

export const BlockframeEcosystemSection: React.FC<BlockframeEcosystemSectionProps> = ({ gameInfo }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const ecosystemLinks = [
    {
      id: 'games-repo',
      title: 'games/bettercraft (Repositório do Jogo)',
      category: 'Estrutura de Jogo Luanti',
      badge: 'PASTA GAMES/',
      badgeColor: 'text-[#55ff55] border-[#55ff55]',
      description: 'Código do jogo formatado para ser colocado direto no diretório games/ do seu Luanti Engine.',
      url: gameInfo.gamesRepoUrl || 'https://github.com/wrxxnch/bettercraft',
      displayUrl: 'github.com/wrxxnch/bettercraft',
      icon: GitBranch,
      iconColor: 'text-[#55ff55]',
      btnLabel: 'Acessar games/bettercraft'
    },
    {
      id: 'official-code',
      title: 'Luanti-BetterCraft (Código Mais Atualizado)',
      category: 'Repositório Oficial Principal',
      badge: 'CÓDIGO OFICIAL',
      badgeColor: 'text-[#55ffff] border-[#55ffff]',
      description: 'A base de código completa e mais atualizada com todos os commits, builds, automações e releases.',
      url: gameInfo.officialCodeRepoUrl || 'https://github.com/wrxxnch/luanti-bettercraft',
      displayUrl: 'github.com/wrxxnch/luanti-bettercraft',
      icon: Code,
      iconColor: 'text-[#55ffff]',
      btnLabel: 'Ver Código Atualizado'
    },
    {
      id: 'blockframe-contentdb',
      title: 'Mod Blockframe no ContentDB',
      category: 'Pacote Oficial Luanti ContentDB',
      badge: 'CONTENTDB OFICIAL',
      badgeColor: 'text-[#ffaa00] border-[#ffaa00]',
      description: 'Página oficial do pacote do mod Blockframe no catálogo ContentDB para instalação com 1 clique.',
      url: gameInfo.blockframeContentDbUrl || 'https://content.luanti.org/packages/wrxxnch/blockframe/',
      displayUrl: 'content.luanti.org/packages/wrxxnch/blockframe/',
      icon: Package,
      iconColor: 'text-[#ffaa00]',
      btnLabel: 'Abrir no ContentDB'
    },
    {
      id: 'blockframe-community',
      title: 'Blockframe Comunidade Conectada',
      category: 'Hub & Rede de Servidores',
      badge: 'TUDO CONECTADO',
      badgeColor: 'text-[#55ffff] border-[#55ffff]',
      description: 'Portal comunitário que interliga os mundos, servidores multiplayer e jogadores do ecossistema Blockframe.',
      url: gameInfo.blockframeCommunityUrl || 'https://wrxxnch.github.io/blockframecommunity/',
      displayUrl: 'wrxxnch.github.io/blockframecommunity',
      icon: Users,
      iconColor: 'text-[#55ffff]',
      btnLabel: 'Comunidade Conectada'
    },
    {
      id: 'blockframe-tutorials',
      title: 'Tutoriais do Blockframe',
      category: 'Guias & Documentação',
      badge: 'TUTORIAIS & GUIAS',
      badgeColor: 'text-[#ffff55] border-[#ffff55]',
      description: 'Aprenda como instalar, configurar blocos especiais, interagir e usar todos os recursos do Blockframe.',
      url: gameInfo.blockframeTutorialsUrl || 'https://wrxxnch.github.io/blockframesite/',
      displayUrl: 'wrxxnch.github.io/blockframesite',
      icon: BookOpen,
      iconColor: 'text-[#ffff55]',
      btnLabel: 'Ver Tutoriais do Site'
    }
  ];

  return (
    <section id="ecossistema" className="py-16 sm:py-20 bg-[#120f1a] border-b-4 border-[#241f30] relative overflow-hidden">
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1a2b_1px,transparent_1px),linear-gradient(to_bottom,#1f1a2b_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mc-slot text-xs font-bold text-[#55ffff] mb-2 uppercase">
            <Network className="w-3.5 h-3.5" />
            <span>ECOSSISTEMA & REPOSITÓRIOS OFICIAIS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide mc-title-shadow uppercase font-minecraft">
            BLOCKFRAME & REPOSITÓRIOS CONECTADOS
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#b4afc4]">
            Acesso direto a todas as ramificações oficiais do projeto: jogo para a pasta <code className="text-[#55ff55] font-mono font-bold">games/</code>, código atualizado, pacote ContentDB, comunidade e tutoriais.
          </p>
        </div>

        {/* 5 Connected Hub Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ecosystemLinks.map((item) => {
            const IconComponent = item.icon;
            const isCopied = copiedId === item.id;

            return (
              <div
                key={item.id}
                className="mc-panel p-5 flex flex-col justify-between group hover:border-[#55ffff] transition-all bg-[#171322] relative"
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 mc-slot flex items-center justify-center bg-[#100d18]">
                        <IconComponent className={`w-4 h-4 ${item.iconColor}`} />
                      </div>
                      <span className="text-[10px] font-mono text-[#8e8999]">
                        {item.category}
                      </span>
                    </div>

                    <span className={`text-[9px] font-bold px-1.5 py-0.5 mc-slot bg-black/60 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-white group-hover:text-[#55ffff] transition-colors mc-text-shadow leading-snug">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-[#cfcbd9] mt-2 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>

                  {/* URL Snippet with Copy Button */}
                  <div className="mt-3 p-2 mc-slot bg-[#0e0b16] flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-[#55ff55] truncate">
                      {item.displayUrl}
                    </span>
                    <button
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      className="p-1 mc-btn text-[10px] hover:text-[#55ffff] cursor-pointer flex-shrink-0"
                      title="Copiar Link"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-[#55ff55]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#8e8999]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-4 pt-3 border-t-2 border-[#2b2438]">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mc-btn mc-btn-diamond py-2 px-3 text-xs flex items-center justify-center gap-2"
                  >
                    <span>{item.btnLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Informative Banner */}
        <div className="mt-10 p-4 mc-panel bg-[#181326] border-2 border-[#55ffff]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 mc-slot flex items-center justify-center text-[#55ffff] bg-[#110d1c] flex-shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase mc-text-shadow">
                Como os repositórios se conectam?
              </h4>
              <p className="text-xs text-[#b4afc4] mt-0.5">
                Use <strong className="text-[#55ff55]">wrxxnch/bettercraft</strong> para copiar para a pasta <code className="bg-[#0e0b16] px-1 py-0.5 text-[#55ff55]">games/</code> e consulte <strong className="text-[#55ffff]">wrxxnch/luanti-bettercraft</strong> para o código completo e atualizado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href="https://wrxxnch.github.io/blockframesite/"
              target="_blank"
              rel="noopener noreferrer"
              className="mc-btn mc-btn-gold px-3 py-2 text-xs flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ver Tutoriais</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
