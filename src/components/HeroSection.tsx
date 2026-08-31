import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, 
  Sparkles, 
  ExternalLink, 
  Image as ImageIcon, 
  GitCommit, 
  Check, 
  Boxes,
  ShieldCheck,
  Compass,
  Smartphone,
  Layers,
  Zap,
  RefreshCw,
  Shuffle
} from 'lucide-react';
import { GameInfo, Screenshot, SplashConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import { BetterCraftLogo } from './BetterCraftLogo';

interface HeroSectionProps {
  gameInfo: GameInfo;
  featuredScreenshots: Screenshot[];
  splashConfig?: SplashConfig;
  currentWallpaperUrl?: string;
  onOpenAddScreenshot: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  gameInfo,
  featuredScreenshots,
  splashConfig,
  currentWallpaperUrl,
  onOpenAddScreenshot
}) => {
  const { isAdmin } = useAuth();
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [currentSplash, setCurrentSplash] = useState<string>('★ Experiência sandbox completa, leve e veloz! ★');
  const [splashKey, setSplashKey] = useState(0);
  const [isAndroid, setIsAndroid] = useState(false);

  // Detect Android Device
  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      const androidDetected = /android/i.test(ua);
      setIsAndroid(androidDetected);
    }
  }, []);

  // Priority vs Normal Splash Selection
  useEffect(() => {
    if (!splashConfig) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const lastVisit = localStorage.getItem('bettercraft_last_visit_date');
    const isFirstVisitToday = lastVisit !== todayStr;

    const priorityList = (splashConfig.prioritySplashes || '')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const normalList = (splashConfig.normalSplashes || '')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (isFirstVisitToday && priorityList.length > 0) {
      // Pick from priority splashes for first visit of the day
      const randomIndex = Math.floor(Math.random() * priorityList.length);
      setCurrentSplash(priorityList[randomIndex]);
      localStorage.setItem('bettercraft_last_visit_date', todayStr);
    } else if (normalList.length > 0) {
      // Pick random normal splash
      const randomIndex = Math.floor(Math.random() * normalList.length);
      setCurrentSplash(normalList[randomIndex]);
    } else if (priorityList.length > 0) {
      setCurrentSplash(priorityList[0]);
    }
  }, [splashConfig]);

  // Allow user to click and roll another splash
  const handleRollSplash = () => {
    if (!splashConfig) return;
    const combined = [
      ...(splashConfig.normalSplashes || '').split('\n'),
      ...(splashConfig.prioritySplashes || '').split('\n')
    ].map(s => s.trim()).filter(s => s.length > 0);

    if (combined.length > 0) {
      const randomSplash = combined[Math.floor(Math.random() * combined.length)];
      setCurrentSplash(randomSplash);
      setSplashKey(prev => prev + 1);
    }
  };

  const handleDownload = () => {
    setDownloadStarted(true);
    const downloadUrl = "https://github.com/wrxxnch/bettercraft/archive/refs/heads/main.zip";
    window.open(downloadUrl, '_blank');
    setTimeout(() => setDownloadStarted(false), 4000);
  };

  const primaryImage = currentWallpaperUrl || (
    featuredScreenshots.length > 0 
      ? featuredScreenshots[0].imageUrl 
      : 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1400&auto=format&fit=crop&q=80'
  );

  return (
    <section className="relative overflow-hidden pt-6 pb-16 sm:py-20 border-b-4 border-[#241f30]">
      {/* Background Wallpaper with Smooth Overlay */}
      <div className="absolute inset-0 bg-[#120f1c]/88 pointer-events-none z-0" />
      <div 
        className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none mix-blend-luminosity filter blur-[1px] transition-all duration-700 z-0"
        style={{ backgroundImage: `url(${primaryImage})` }}
      />
      
      {/* Minecraft Voxel Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#2a223a_1px,transparent_1px),linear-gradient(to_bottom,#2a223a_1px,transparent_1px)] bg-[size:32px_32px] opacity-35 pointer-events-none z-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Minecraft Voxel Hero Typography & CTAs */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            
            {/* Main Title Minecraft 3D Style */}
            <div className="space-y-2">
              <div className="flex items-center justify-center lg:justify-start gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mc-slot bg-[#1e1929] flex items-center justify-center border-2 border-[#55ffff] p-1 shadow-lg overflow-hidden flex-shrink-0">
                  <BetterCraftLogo />
                </div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-wider mc-title-shadow uppercase leading-tight font-minecraft">
                  LUANTI <span className="text-[#55ffff]">BETTERCRAFT</span>
                </h1>
              </div>
              
              {/* Interactive Minecraft Yellow Splash Text */}
              <div className="pt-1">
                <button
                  key={splashKey}
                  onClick={handleRollSplash}
                  title="Clique para trocar o texto splash!"
                  className="inline-flex items-center gap-1.5 transform -rotate-2 py-1 px-3 bg-[#1d1628]/90 border border-[#ffaa00]/60 hover:border-[#ffff55] transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md rounded-xs group"
                >
                  <span className="text-sm sm:text-base font-bold mc-yellow-splash tracking-wide text-[#ffff55] group-hover:text-[#ffffff] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {currentSplash}
                  </span>
                  <Shuffle className="w-3 h-3 text-[#ffaa00] opacity-60 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {/* Android Device Recommendation Banner */}
            {isAndroid && (
              <div className="p-3.5 mc-panel bg-[#122316] border-2 border-[#55ff55] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 mc-slot flex items-center justify-center text-[#55ff55] bg-[#0b170e] flex-shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase font-minecraft">
                        DISPOSITIVO ANDROID DETECTADO
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#2b742b] text-white font-bold border border-[#55ff55]">
                        SULPHUR UPDATE
                      </span>
                    </div>
                    <p className="text-[11px] text-[#bbf7bb] mt-0.5">
                      Para melhor experiência no celular, baixe a versão oficial com suporte a toque e desempenho otimizado:
                    </p>
                  </div>
                </div>

                <a
                  href="https://github.com/wrxxnch/luanti-bettercraft/releases/tag/sulphurupdate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mc-btn mc-btn-green px-3.5 py-2 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer flex-shrink-0 self-end sm:self-center"
                >
                  <span>Ver Release Android</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Description */}
            <p className="text-sm sm:text-base text-[#cfcbd9] max-w-2xl mx-auto lg:mx-0 leading-relaxed bg-[#171422]/80 p-3.5 border-2 border-[#2f273e]">
              {gameInfo.description}
            </p>

            {/* CTAs Minecraft Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              
              {/* Main "Jogar Agora" Button - Directly downloads from github.com/wrxxnch/bettercraft */}
              <button
                onClick={handleDownload}
                id="hero-btn-play-now"
                className="mc-btn mc-btn-green px-6 py-3.5 text-sm sm:text-base flex items-center gap-2.5 shadow-xl transition-transform active:scale-95 cursor-pointer"
              >
                {downloadStarted ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3] text-white" />
                    <span>Baixando ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 stroke-[3]" />
                    <span>JOGAR AGORA (DOWNLOAD ZIP)</span>
                  </>
                )}
              </button>

              {/* View GitHub Button */}
              <a
                href={gameInfo.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mc-btn mc-btn-diamond px-4 py-3.5 text-xs sm:text-sm flex items-center gap-2"
              >
                <span>GITHUB REPO</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              {/* View Gallery */}
              <a
                href="#galeria"
                className="mc-btn px-4 py-3.5 text-xs sm:text-sm flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4 text-[#ffaa00]" />
                <span>VER FOTOS</span>
              </a>

              {/* Admin quick add screenshot button if logged in */}
              {isAdmin && (
                <button
                  onClick={onOpenAddScreenshot}
                  className="mc-btn mc-btn-gold px-3.5 py-3 text-xs flex items-center gap-1.5 cursor-pointer"
                  title="Adicionar nova foto de captura"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>+ Postar Foto</span>
                </button>
              )}
            </div>

            {/* Download notice */}
            <p className="text-[11px] text-[#938e9e] font-mono">
              Repositório oficial: <a href="https://github.com/wrxxnch/bettercraft" target="_blank" rel="noopener noreferrer" className="text-[#55ffff] hover:underline font-bold">github.com/wrxxnch/bettercraft</a>
            </p>

          </div>

          {/* Right Column: Minecraft Item Frame Showcase */}
          <div className="lg:col-span-5 space-y-4">
            <div className="mc-panel p-3.5 relative">
              
              {/* Item Frame Label */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-[#332c42]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#ffaa00] uppercase">
                  <Boxes className="w-4 h-4" />
                  <span>Captura em Destaque</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 mc-slot text-[#55ff55]">
                  SHADERS & LUZ
                </span>
              </div>

              {/* Screenshot Image with Pixel Border */}
              <div className="relative aspect-video w-full mc-slot overflow-hidden group">
                <img
                  src={featuredScreenshots.length > 0 ? featuredScreenshots[0].imageUrl : primaryImage}
                  alt={featuredScreenshots[0]?.title || 'BetterCraft World'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white mc-text-shadow">
                      {featuredScreenshots[0]?.title || 'Mundo Voxel com Iluminação Suave'}
                    </h4>
                    <p className="text-[11px] text-[#b4afc4] line-clamp-1">
                      {featuredScreenshots[0]?.description || 'Biomas vibrantes e texturas em alta definição sobre o motor Luanti'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Features Voxel Chips */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t-2 border-[#332c42] text-center text-[10px] font-bold">
                <div className="p-1.5 mc-slot text-[#55ffff]">
                  <div>VISUAL HD</div>
                  <div className="text-[#8e8999] text-[9px] font-normal">Alta Definição</div>
                </div>
                <div className="p-1.5 mc-slot text-[#55ff55]">
                  <div>FPS ALTO</div>
                  <div className="text-[#8e8999] text-[9px] font-normal">Motor Luanti</div>
                </div>
                <div className="p-1.5 mc-slot text-[#ffaa00]">
                  <div>MULTIPLAYER</div>
                  <div className="text-[#8e8999] text-[9px] font-normal">Servidores ON</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
