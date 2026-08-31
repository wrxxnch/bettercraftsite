import React, { useState, useEffect } from 'react';
import { 
  Mountain, 
  Hammer, 
  Sun, 
  Sparkles, 
  Zap, 
  Code, 
  Compass, 
  ShieldCheck, 
  Layers, 
  Cpu,
  Pickaxe,
  Boxes,
  Swords,
  Trees,
  Download,
  Smartphone,
  Monitor,
  Terminal,
  ExternalLink,
  CheckCircle2,
  PackageCheck,
  HardDrive
} from 'lucide-react';
import { GameInfo, GameFeature } from '../types';

interface FeaturesSectionProps {
  gameInfo?: GameInfo;
  features?: GameFeature[];
}

const iconMap: Record<string, React.ReactNode> = {
  Mountain: <Mountain className="w-5 h-5 text-[#55ffff]" />,
  Hammer: <Pickaxe className="w-5 h-5 text-[#ffaa00]" />,
  Sun: <Sun className="w-5 h-5 text-[#ffff55]" />,
  Sparkles: <Sparkles className="w-5 h-5 text-[#ff55ff]" />,
  Zap: <Zap className="w-5 h-5 text-[#55ff55]" />,
  Code: <Code className="w-5 h-5 text-[#55ffff]" />
};

type DetectedDevice = 'android' | 'windows' | 'linux' | 'macos' | 'unknown';

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ gameInfo, features }) => {
  const featureItems: GameFeature[] = features || gameInfo?.features || [];

  const [device, setDevice] = useState<DetectedDevice>('unknown');
  const [selectedTab, setSelectedTab] = useState<DetectedDevice>('android');

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator) {
      const ua = navigator.userAgent || '';
      if (/android/i.test(ua)) {
        setDevice('android');
        setSelectedTab('android');
      } else if (/windows/i.test(ua)) {
        setDevice('windows');
        setSelectedTab('windows');
      } else if (/linux/i.test(ua)) {
        setDevice('linux');
        setSelectedTab('linux');
      } else if (/macintosh|mac os x|ipad|iphone/i.test(ua)) {
        setDevice('macos');
        setSelectedTab('macos');
      } else {
        setDevice('windows');
        setSelectedTab('windows');
      }
    }
  }, []);

  const GITHUB_ANDROID_RELEASE_URL = 'https://github.com/wrxxnch/luanti-bettercraft/releases/tag/sulphurupdate';
  const GITHUB_DESKTOP_ZIP_URL = 'https://github.com/wrxxnch/bettercraft/archive/refs/heads/main.zip';
  const GITHUB_REPO_URL = 'https://github.com/wrxxnch/bettercraft';

  return (
    <section id="recursos" className="py-16 sm:py-20 bg-[#161220] border-b-4 border-[#241f30] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mc-slot text-xs font-bold text-[#55ff55] mb-2 uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>MECÂNICAS & RECURSOS DO JOGO</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide mc-title-shadow uppercase font-minecraft">
            A EXPERIÊNCIA SANDBOX DEFINITIVA
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#b4afc4] leading-relaxed">
            BetterCraft foi projetado com gráficos aprimorados, iluminação dinâmica suave e suporte completo para criação e exploração sem limites.
          </p>
        </div>

        {/* SMART DEVICE DETECTION DOWNLOAD PANEL */}
        <div className="mb-12 mc-panel p-5 sm:p-7 bg-[#14101e] border-2 border-[#55ff55]/60 relative overflow-hidden shadow-2xl">
          {/* Subtle Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#55ff55]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 mc-slot text-[11px] font-bold text-[#55ff55] uppercase flex items-center gap-1.5 bg-[#0e1a12]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Dispositivo Detectado: {device === 'android' ? 'Android' : device === 'windows' ? 'Windows' : device === 'linux' ? 'Linux' : device === 'macos' ? 'macOS' : 'PC / Mobile'}</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#282136] text-[#ffff55] border border-[#44385c]">
                  Release Oficial: Sulphur Update
                </span>
              </div>

              <h3 className="text-lg sm:text-2xl font-bold text-white font-minecraft mc-text-shadow">
                {selectedTab === 'android' 
                  ? 'BAIXAR BETTERCRAFT PARA ANDROID (APK RELEASE)' 
                  : 'BAIXAR PACOTE DO BETTERCRAFT PARA DESKTOP'}
              </h3>
              <p className="text-xs sm:text-sm text-[#cfcbd9] max-w-2xl leading-relaxed">
                {selectedTab === 'android' ? (
                  <>
                    Detectamos que você está em um smartphone/tablet <strong>Android</strong>. 
                    Baixe diretamente a release oficial compilada do GitHub (Sulphur Update) pronta para instalar e jogar no Luanti!
                  </>
                ) : (
                  <>
                    Baixe o arquivo compactado <strong>.ZIP</strong> oficial do BetterCraft diretamente do repositório no GitHub para extrair na pasta de jogos do Luanti.
                  </>
                )}
              </p>
            </div>

            {/* Quick Action Download Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto">
              {selectedTab === 'android' ? (
                <a
                  href={GITHUB_ANDROID_RELEASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mc-btn mc-btn-green px-5 py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2 font-bold cursor-pointer whitespace-nowrap shadow-lg animate-pulse"
                >
                  <Download className="w-4 h-4 stroke-[3]" />
                  <span>BAIXAR RELEASE DO GITHUB (ANDROID) &rarr;</span>
                </a>
              ) : (
                <a
                  href={GITHUB_DESKTOP_ZIP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mc-btn mc-btn-green px-5 py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2 font-bold cursor-pointer whitespace-nowrap shadow-lg"
                >
                  <Download className="w-4 h-4 stroke-[3]" />
                  <span>BAIXAR BETTERCRAFT .ZIP &rarr;</span>
                </a>
              )}

              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mc-btn mc-btn-diamond px-4 py-3.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ver no GitHub</span>
              </a>
            </div>
          </div>

          {/* Platform Switcher Tabs */}
          <div className="mt-5 pt-4 border-t-2 border-[#2b2438] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-[#8e8999] uppercase mr-1">Outras plataformas:</span>
              
              <button
                type="button"
                onClick={() => setSelectedTab('android')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTab === 'android'
                    ? 'mc-btn mc-btn-green text-white'
                    : 'mc-btn bg-[#1e192c] text-[#b4afc4] border-[#372f47]'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Android (Release)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTab('windows')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTab === 'windows'
                    ? 'mc-btn mc-btn-diamond text-white'
                    : 'mc-btn bg-[#1e192c] text-[#b4afc4] border-[#372f47]'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span>Windows</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTab('linux')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTab === 'linux'
                    ? 'mc-btn mc-btn-diamond text-white'
                    : 'mc-btn bg-[#1e192c] text-[#b4afc4] border-[#372f47]'
                }`}
              >
                <Terminal className="w-3 h-3 text-[#ffff55]" />
                <span>Linux</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTab('macos')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedTab === 'macos'
                    ? 'mc-btn mc-btn-diamond text-white'
                    : 'mc-btn bg-[#1e192c] text-[#b4afc4] border-[#372f47]'
                }`}
              >
                <HardDrive className="w-3 h-3 text-[#ff55ff]" />
                <span>macOS</span>
              </button>
            </div>

            <div className="text-[11px] text-[#55ffff] font-mono flex items-center gap-1">
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Compatível com Luanti Engine 5.9.0+</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureItems.map((feature) => (
            <div
              key={feature.id}
              className="mc-panel p-5 flex flex-col justify-between group hover:border-[#55ffff] transition-colors"
            >
              <div>
                <div className="w-10 h-10 mc-slot flex items-center justify-center mb-4 group-hover:scale-105 transition-transform bg-[#110e19]">
                  {iconMap[feature.icon] || <Boxes className="w-5 h-5 text-[#55ffff]" />}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white mb-2 group-hover:text-[#55ffff] transition-colors mc-text-shadow">
                  {feature.title}
                </h3>

                <p className="text-xs text-[#b4afc4] leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t-2 border-[#2b2438] flex items-center justify-between text-[11px]">
                <span className="font-mono text-[#8e8999]">Voxel HD</span>
                <span className="text-[#55ff55] font-bold">Nativo Luanti</span>
              </div>
            </div>
          ))}
        </div>

        {/* Engine Tech callout bar */}
        <div className="mt-10 p-5 mc-panel-dark flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 mc-slot flex items-center justify-center flex-shrink-0 text-[#55ffff]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mc-text-shadow uppercase">
                MOTOR LUANTI C++ SUPER OTIMIZADO
              </h4>
              <p className="text-xs text-[#b4afc4] mt-0.5">
                Consumo mínimo de memória RAM, geração de terreno rápida e compatibilidade total com Windows, Linux, Android e macOS.
              </p>
            </div>
          </div>
          <a
            href="https://www.luanti.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="mc-btn mc-btn-diamond px-3.5 py-2 text-xs whitespace-nowrap"
          >
            Sobre o Luanti.org &rarr;
          </a>
        </div>

      </div>
    </section>
  );
};
