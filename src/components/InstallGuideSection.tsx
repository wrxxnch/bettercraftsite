import React, { useState } from 'react';
import { 
  Download, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  Smartphone, 
  Monitor, 
  HardDrive, 
  Cpu, 
  CheckCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { GameInfo } from '../types';

interface InstallGuideSectionProps {
  gameInfo: GameInfo;
}

type PlatformTab = 'windows' | 'linux' | 'android' | 'macos';

export const InstallGuideSection: React.FC<InstallGuideSectionProps> = ({ gameInfo }) => {
  const [activePlatform, setActivePlatform] = useState<PlatformTab>('windows');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = gameInfo.installationSteps[activePlatform] || [];

  return (
    <section id="instalacao" className="py-16 sm:py-20 bg-[#14111c] border-b-4 border-[#241f30] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mc-slot text-xs font-bold text-[#ffff55] mb-2 uppercase">
            <Download className="w-3.5 h-3.5" />
            <span>GUIA DE INSTALAÇÃO RÁPIDA</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide mc-title-shadow uppercase font-minecraft">
            COMO BAIXAR E JOGAR O BETTERCRAFT
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#b4afc4]">
            BetterCraft funciona como um jogo completo sobre o motor Luanti (antigo Minetest). Siga os passos rápidos abaixo.
          </p>
        </div>

        {/* Download Buttons Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {gameInfo.downloadLinks.map((dl) => (
            <a
              key={dl.id}
              href={dl.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 mc-panel transition-all flex flex-col justify-between group ${
                dl.recommended
                  ? 'border-[#55ff55] hover:bg-[#252033]'
                  : 'hover:border-[#55ffff]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 mc-slot text-[#cfcbd9] uppercase">
                    {dl.platform}
                  </span>
                  {dl.recommended && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-[#2b742b] text-white border border-[#55ff55]">
                      RECOMENDADO
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#55ffff] transition-colors flex items-center gap-1.5 mc-text-shadow">
                  <span>{dl.label}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </h3>
                {dl.subtext && (
                  <p className="text-xs text-[#8e8999] mt-1">
                    {dl.subtext}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-2.5 border-t-2 border-[#2b2438] flex items-center text-xs font-bold text-[#55ff55]">
                <span>Baixar Agora &rarr;</span>
              </div>
            </a>
          ))}
        </div>

        {/* Platform Selection Tabs */}
        <div className="mc-panel overflow-hidden">
          
          <div className="flex items-center border-b-2 border-[#2f283d] bg-[#171322] p-2 overflow-x-auto gap-2">
            <button
              onClick={() => setActivePlatform('windows')}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activePlatform === 'windows'
                  ? 'mc-btn mc-btn-diamond text-white'
                  : 'mc-btn bg-[#201c2b] text-[#b4afc4] border-[#372f47]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Windows</span>
            </button>

            <button
              onClick={() => setActivePlatform('linux')}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activePlatform === 'linux'
                  ? 'mc-btn mc-btn-diamond text-white'
                  : 'mc-btn bg-[#201c2b] text-[#b4afc4] border-[#372f47]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-[#ffff55]" />
              <span>Linux</span>
            </button>

            <button
              onClick={() => setActivePlatform('android')}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activePlatform === 'android'
                  ? 'mc-btn mc-btn-diamond text-white'
                  : 'mc-btn bg-[#201c2b] text-[#b4afc4] border-[#372f47]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#55ff55]" />
              <span>Android</span>
            </button>

            <button
              onClick={() => setActivePlatform('macos')}
              className={`px-3 py-1.5 text-xs font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                activePlatform === 'macos'
                  ? 'mc-btn mc-btn-diamond text-white'
                  : 'mc-btn bg-[#201c2b] text-[#b4afc4] border-[#372f47]'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5 text-[#ff55ff]" />
              <span>macOS</span>
            </button>
          </div>

          {/* Steps List */}
          <div className="p-6 sm:p-8 space-y-5 bg-[#171321]">
            {steps.map((st, index) => (
              <div key={st.step} className="flex items-start gap-3.5">
                <div className="w-7 h-7 mc-slot flex items-center justify-center text-xs font-bold text-[#55ffff] flex-shrink-0 mt-0.5">
                  {st.step}
                </div>

                <div className="flex-1 space-y-1.5">
                  <h4 className="text-sm font-bold text-white mc-text-shadow">
                    {st.title}
                  </h4>
                  <p className="text-xs text-[#cfcbd9] leading-relaxed">
                    {st.description}
                  </p>

                  {st.codeSnippet && (
                    <div className="relative mt-2 p-3 bg-[#0e0c14] border-2 border-[#2b2438] font-mono text-xs text-[#55ff55]">
                      <pre className="overflow-x-auto whitespace-pre-wrap">
                        {st.codeSnippet}
                      </pre>
                      <button
                        onClick={() => handleCopy(st.codeSnippet!, index)}
                        className="absolute top-2 right-2 mc-btn px-2 py-1 text-[10px] flex items-center gap-1 cursor-pointer"
                        title="Copiar comando"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3 h-3 text-[#55ff55]" />
                            <span className="text-[#55ff55]">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Tip box */}
            <div className="mt-6 p-3.5 mc-slot bg-[#120f1a] flex items-center gap-2.5 text-xs text-[#cfcbd9]">
              <FolderOpen className="w-4 h-4 text-[#ffaa00] flex-shrink-0" />
              <span>
                <strong>Dica:</strong> A pasta no Luanti deve ficar em <code>games/bettercraft/</code> (com o arquivo <code>game.conf</code> diretamente dentro).
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
