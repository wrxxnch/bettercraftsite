import React from 'react';
import { 
  GitCommit, 
  ExternalLink, 
  RefreshCw,
  GitBranch,
  Calendar,
  User
} from 'lucide-react';
import { GitHubCommit, GameInfo } from '../types';

interface ChangelogSectionProps {
  gameInfo: GameInfo;
  commits: GitHubCommit[];
  isLoadingCommits: boolean;
  onRefreshCommits: () => void;
}

export const ChangelogSection: React.FC<ChangelogSectionProps> = ({
  gameInfo,
  commits,
  isLoadingCommits,
  onRefreshCommits
}) => {
  return (
    <section id="changelog" className="py-16 sm:py-20 bg-[#120f1a] border-b-4 border-[#241f30] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mc-slot text-xs font-bold text-[#55ff55] mb-2 uppercase">
              <GitBranch className="w-3.5 h-3.5" />
              <span>HISTÓRICO OFICIAL DE COMMITS</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide mc-title-shadow uppercase font-minecraft">
              COMMITS DO GITHUB
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#b4afc4]">
              Acompanhe as atualizações de código em tempo real sincronizadas diretamente com a branch <strong className="text-[#55ffff] font-mono">main</strong> do repositório <strong className="text-[#55ffff] font-mono">wrxxnch/bettercraft</strong>.
            </p>
          </div>

          {/* Action Buttons: Refresh & Open Repo */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={onRefreshCommits}
              disabled={isLoadingCommits}
              className="mc-btn mc-btn-diamond px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Sincronizar com a API do GitHub"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCommits ? 'animate-spin text-[#55ffff]' : 'text-[#ffffff]'}`} />
              <span>{isLoadingCommits ? 'Sincronizando...' : 'Atualizar Commits'}</span>
            </button>

            <a
              href="https://github.com/wrxxnch/bettercraft/commits/main"
              target="_blank"
              rel="noopener noreferrer"
              className="mc-btn px-3.5 py-2 text-xs flex items-center gap-1.5 hover:text-white"
            >
              <span>Ver no GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#55ffff]" />
            </a>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-3 mc-slot bg-[#171322] border-2 border-[#2b2438] flex items-center justify-between text-xs text-[#cfcbd9] mb-6 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-[#55ff55]" />
            <span>Repositório: <strong className="font-mono text-[#55ffff]">github.com/wrxxnch/bettercraft</strong></span>
          </div>
          <span className="text-[11px] text-[#8e8999] font-mono">
            {commits.length} commits sincronizados
          </span>
        </div>

        {/* Commits List */}
        {isLoadingCommits && commits.length === 0 ? (
          <div className="p-12 text-center mc-panel bg-[#161220] border-2 border-[#332c42]">
            <RefreshCw className="w-8 h-8 animate-spin text-[#55ffff] mx-auto mb-3" />
            <p className="text-sm font-bold text-white font-minecraft">BUSCANDO COMMITS NO GITHUB...</p>
            <p className="text-xs text-[#8e8999] mt-1">Conectando ao repositório wrxxnch/bettercraft</p>
          </div>
        ) : commits.length === 0 ? (
          <div className="p-12 text-center mc-panel bg-[#161220] border-2 border-[#332c42]">
            <GitCommit className="w-8 h-8 text-[#8e8999] mx-auto mb-3" />
            <p className="text-sm font-bold text-white font-minecraft">NENHUM COMMIT CARREGADO</p>
            <p className="text-xs text-[#8e8999] mt-1">Clique em "Atualizar Commits" para sincronizar com a API do GitHub.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {commits.map((c) => (
              <div
                key={c.sha}
                className="mc-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#55ffff] transition-colors bg-[#171321]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 mc-slot overflow-hidden flex-shrink-0 bg-black mt-0.5 border border-[#3b344a]">
                    {c.author.avatar_url ? (
                      <img
                        src={c.author.avatar_url}
                        alt={c.author.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#55ff55]">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-white font-mono leading-snug">
                      {c.message}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#8e8999]">
                      <span>
                        Autor: <strong className="text-[#55ffff]">{c.author.name}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#ffaa00]" />
                        {new Date(c.author.date).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={c.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 mc-slot text-xs font-mono text-[#55ffff] hover:text-white flex items-center gap-1.5 bg-[#100d18] border-[#3b344a]"
                    title="Ver commit no GitHub"
                  >
                    <GitCommit className="w-3.5 h-3.5 text-[#55ff55]" />
                    <span>{c.sha.substring(0, 7)}</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
