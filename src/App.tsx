/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  GameInfo, 
  Screenshot, 
  ChangelogRelease, 
  GitHubCommit, 
  AdminUser, 
  AuditLog,
  SplashConfig,
  WallpaperItem
} from './types';
import { api } from './services/api';
import { firebaseApi, DEFAULT_SPLASHES, DEFAULT_WALLPAPERS } from './services/firebaseService';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { ScreenshotsGallery } from './components/ScreenshotsGallery';
import { BlockframeEcosystemSection } from './components/BlockframeEcosystemSection';
import { ChangelogSection } from './components/ChangelogSection';
import { InstallGuideSection } from './components/InstallGuideSection';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AddScreenshotModal } from './components/AddScreenshotModal';
import { AddChangelogModal } from './components/AddChangelogModal';
import { Footer } from './components/Footer';
import { ShieldCheck, Pickaxe } from 'lucide-react';

const DEFAULT_FALLBACK_GAME_INFO: GameInfo = {
  title: "Luanti BetterCraft",
  tagline: "A evolução da experiência voxel para o motor de jogo Luanti",
  description: "BetterCraft é um jogo completo para Luanti (antigo Minetest) focado em sobrevivência aprimorada, geração de mundos deslumbrante, crafting refinado e performance impecável.",
  longDescription: "Construído sobre o poderoso e leve motor Luanti (anteriormente Minetest), BetterCraft redefine a jogabilidade sandbox com biomas diversificados, novos minérios, iluminação dinâmica, árvores com folhagens densas e ecossistema integrado com Blockframe.",
  repoUrl: "https://github.com/wrxxnch/bettercraft",
  repoOwner: "wrxxnch",
  repoName: "bettercraft",
  gamesRepoUrl: "https://github.com/wrxxnch/bettercraft",
  officialCodeRepoUrl: "https://github.com/wrxxnch/luanti-bettercraft",
  blockframeContentDbUrl: "https://content.luanti.org/packages/wrxxnch/blockframe/",
  blockframeCommunityUrl: "https://wrxxnch.github.io/blockframecommunity/",
  blockframeTutorialsUrl: "https://wrxxnch.github.io/blockframesite/",
  allowPublicScreenshots: false,
  luantiVersion: "5.9.0+",
  gameVersion: "v1.4.2",
  license: "GPL-3.0 / MIT",
  features: [
    {
      id: "world-gen",
      title: "Geração de Mundo Exuberante",
      description: "Montanhas colossais, vales verdejantes, biomas árticos e cavernas profundas com ecossistemas únicos e novas formações de rochas.",
      icon: "Mountain"
    },
    {
      id: "modern-crafting",
      title: "Sistema de Crafting Intuitivo",
      description: "Guia de receitas integrado, bancadas de trabalho especializadas, fornos de alta temperatura e automação simplificada.",
      icon: "Hammer"
    },
    {
      id: "lighting-shaders",
      title: "Iluminação & Shaders Volumétricos",
      description: "Suporte nativo aos modernos shaders do Luanti: luz solar realista, névoa volumétrica, água com reflexos e oclusão de ambiente.",
      icon: "Sun"
    },
    {
      id: "mobs-fauna",
      title: "Fauna e Monstros Balanceados",
      description: "Animais domesticáveis para fazendas, criaturas hostis com IA desafiadora em cavernas e bosses em estruturas raras.",
      icon: "Sparkles"
    },
    {
      id: "lightweight-perf",
      title: "Desempenho Ultra-Leve",
      description: "Roda suavemente até em computadores modestos e dispositivos Android, consumindo uma fração da memória de outros jogos voxel.",
      icon: "Zap"
    },
    {
      id: "moddable-luanti",
      title: "100% Modificável em Lua",
      description: "Compatível com a rica biblioteca de mods Luanti e ContentDB, facilitando criação e personalização de servidores.",
      icon: "Code"
    }
  ],
  downloadLinks: [
    {
      id: "dl-release",
      label: "Baixar Última Versão (ZIP)",
      url: "https://github.com/wrxxnch/bettercraft/archive/refs/heads/main.zip",
      platform: "Todos os Sistemas",
      subtext: "Código-fonte pronto para pasta games/",
      recommended: true,
      type: "zip"
    },
    {
      id: "dl-github",
      label: "Repositório no GitHub",
      url: "https://github.com/wrxxnch/bettercraft",
      platform: "GitHub",
      subtext: "Clonar via git ou contribuir",
      type: "github"
    },
    {
      id: "dl-luanti",
      label: "Baixar Motor Luanti Engine",
      url: "https://www.luanti.org/downloads/",
      platform: "Engine Necessária",
      subtext: "Disponível para Windows, Linux, Android e macOS",
      type: "direct"
    }
  ],
  installationSteps: {
    windows: [],
    linux: [],
    android: [],
    macos: []
  }
};

function MainContent() {
  const { user, firebaseUser, isAdmin, adminsList, refreshAdmins } = useAuth();
  
  // Data states
  const [gameInfo, setGameInfo] = useState<GameInfo>(DEFAULT_FALLBACK_GAME_INFO);
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [changelog, setChangelog] = useState<ChangelogRelease[]>([]);
  const [commits, setCommits] = useState<GitHubCommit[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [splashConfig, setSplashConfig] = useState<SplashConfig>(DEFAULT_SPLASHES);
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>(DEFAULT_WALLPAPERS);
  const [currentWallpaperUrl, setCurrentWallpaperUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingCommits, setIsRefreshingCommits] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [addScreenshotOpen, setAddScreenshotOpen] = useState(false);
  const [addReleaseOpen, setAddReleaseOpen] = useState(false);
  
  // Edit post state
  const [editingScreenshot, setEditingScreenshot] = useState<Screenshot | null>(null);
  const [editingRelease, setEditingRelease] = useState<ChangelogRelease | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [gInfo, changes, comms, lgs] = await Promise.allSettled([
        api.getGameInfo(),
        api.getChangelog(),
        api.getCommits(),
        api.getLogs()
      ]);

      if (gInfo.status === 'fulfilled') setGameInfo(gInfo.value);
      if (changes.status === 'fulfilled') setChangelog(changes.value);
      if (comms.status === 'fulfilled') setCommits(comms.value);
      if (lgs.status === 'fulfilled') setLogs(lgs.value);
    } catch (err) {
      console.error('Error loading initial app data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen to Firestore real-time screenshots
  useEffect(() => {
    const unsubscribe = firebaseApi.subscribeScreenshots((firebaseScreenshots) => {
      setScreenshots(firebaseScreenshots);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Listen to Firestore real-time splash texts
  useEffect(() => {
    const unsubscribe = firebaseApi.subscribeSplashes((splashes) => {
      setSplashConfig(splashes);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Listen to Firestore real-time wallpapers & pick random wallpaper on load
  useEffect(() => {
    const unsubscribe = firebaseApi.subscribeWallpapers((wps) => {
      setWallpapers(wps);
      if (wps.length > 0 && !currentWallpaperUrl) {
        const randomWp = wps[Math.floor(Math.random() * wps.length)];
        setCurrentWallpaperUrl(randomWp.url);
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [currentWallpaperUrl]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Keyboard shortcut Ctrl+Shift+A or URL query/hash for Admin Panel / Login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAdmin) {
          setAdminPanelOpen(prev => !prev);
        } else {
          setAdminLoginOpen(true);
        }
      }
    };

    // Check URL parameters or hash on initial load
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true' || window.location.hash === '#admin' || window.location.hash === '#login') {
      if (isAdmin) {
        setAdminPanelOpen(true);
      } else {
        setAdminLoginOpen(true);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

  // Handle Save Screenshot (Real-time in Firebase Firestore)
  const handleSaveScreenshot = async (data: Omit<Screenshot, 'id' | 'createdAt' | 'author'> & { authorName?: string }) => {
    const canPost = isAdmin || gameInfo.allowPublicScreenshots;
    if (!canPost) {
      setAdminLoginOpen(true);
      return;
    }

    if (editingScreenshot) {
      // Update existing post in Firestore
      if (!user && !isAdmin) {
        setAdminLoginOpen(true);
        return;
      }
      await firebaseApi.updateScreenshot(editingScreenshot.id, {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        category: data.category,
        tags: data.tags,
        featured: data.featured,
        ...(data.authorName ? { authorName: data.authorName } : {})
      });
      showToast(`Captura "${data.title}" atualizada no Firebase!`);
      setEditingScreenshot(null);
    } else {
      // Create new post in Firestore
      const created = await firebaseApi.createScreenshot({
        ...data,
        authorEmail: user?.email || undefined,
        authorUid: firebaseUser?.uid || undefined,
        authorName: data.authorName || user?.name
      });
      showToast(`Captura "${created.title}" salva no Firebase!`);
    }
    await refreshLogs();
  };

  const handleOpenEditScreenshot = (screenshot: Screenshot) => {
    setEditingScreenshot(screenshot);
    setAddScreenshotOpen(true);
  };

  const handleDeleteScreenshot = async (id: string) => {
    if (!user) return;
    await firebaseApi.deleteScreenshot(id);
    showToast('Captura de tela removida do Firebase.');
    await refreshLogs();
  };

  // Handle Save Release (Create or Edit)
  const handleSaveRelease = async (data: Omit<ChangelogRelease, 'id' | 'date' | 'author'>) => {
    if (!user) {
      setAdminLoginOpen(true);
      return;
    }

    if (editingRelease) {
      // Update existing release post
      const updated = await api.updateChangelogRelease(editingRelease.id, data, user.email);
      setChangelog(prev => prev.map(r => r.id === updated.id ? updated : r));
      showToast(`Versão ${updated.version} atualizada com sucesso!`);
      setEditingRelease(null);
    } else {
      // Create new release post
      const created = await api.createChangelogRelease(data, user.email);
      setChangelog(prev => [created, ...prev]);
      showToast(`Versão ${created.version} publicada no changelog!`);
    }
    await refreshLogs();
  };

  const handleOpenEditRelease = (release: ChangelogRelease) => {
    setEditingRelease(release);
    setAddReleaseOpen(true);
  };

  const handleDeleteRelease = async (id: string) => {
    if (!user) return;
    await api.deleteChangelogRelease(id, user.email);
    setChangelog(prev => prev.filter(r => r.id !== id));
    showToast('Nota de versão removida.');
    await refreshLogs();
  };

  const handleAddAdmin = async (data: { email: string; name?: string; role: string }) => {
    if (!user) return;
    await firebaseApi.addAdmin({
      email: data.email,
      name: data.name,
      role: data.role,
      addedBy: user.email
    });
    await refreshAdmins();
    showToast(`Administrador ${data.email} autorizado no Firebase.`);
    await refreshLogs();
  };

  const handleRevokeAdmin = async (id: string) => {
    if (!user) return;
    await firebaseApi.removeAdmin(id);
    await refreshAdmins();
    showToast('Acesso de administrador revogado no Firebase.');
    await refreshLogs();
  };

  const handleUpdateGameInfo = async (updates: Partial<GameInfo>) => {
    if (!user) return;
    const updated = await api.updateGameInfo(updates, user.email);
    await firebaseApi.saveGameSettings(updates);
    setGameInfo(updated);
    showToast('Informações do jogo atualizadas.');
    await refreshLogs();
  };

  // Splashes Save Handler
  const handleSaveSplashes = async (newSplashes: SplashConfig) => {
    if (!user) return;
    await firebaseApi.saveSplashes(newSplashes);
    setSplashConfig(newSplashes);
    showToast('Textos Splash salvos no Firebase.');
    await refreshLogs();
  };

  // Wallpapers Handlers
  const handleAddWallpaper = async (wpData: { url: string; title: string }) => {
    if (!user) return;
    await firebaseApi.addWallpaper({
      url: wpData.url,
      title: wpData.title,
      addedBy: user.email
    });
    showToast(`Wallpaper "${wpData.title}" adicionado.`);
    await refreshLogs();
  };

  const handleDeleteWallpaper = async (id: string) => {
    if (!user) return;
    await firebaseApi.deleteWallpaper(id);
    showToast('Wallpaper removido.');
    await refreshLogs();
  };

  const handleSelectActiveWallpaper = (url: string) => {
    setCurrentWallpaperUrl(url);
    showToast('Wallpaper de fundo ativado no site!');
  };

  const handleRefreshCommits = async () => {
    setIsRefreshingCommits(true);
    try {
      const comms = await api.getCommits();
      setCommits(comms);
      showToast('Commits do GitHub sincronizados.');
    } catch (err) {
      showToast('Erro ao atualizar commits.');
    } finally {
      setIsRefreshingCommits(false);
    }
  };

  const refreshLogs = async () => {
    try {
      const lgs = await api.getLogs();
      setLogs(lgs);
    } catch (err) {
      console.warn('Could not refresh logs:', err);
    }
  };

  const featuredScreenshots = screenshots.filter(s => s.featured).length > 0
    ? screenshots.filter(s => s.featured)
    : screenshots;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#100d18] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 mc-slot animate-bounce mb-4 text-[#55ffff] flex items-center justify-center">
          <Pickaxe className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide mc-text-shadow">
          CARREGANDO BETTERCRAFT...
        </h2>
        <p className="text-xs text-[#55ff55] font-mono mt-2">
          github.com/wrxxnch/bettercraft
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#100d18] text-[#e0dfd5] flex flex-col selection:bg-[#55ffff] selection:text-black">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 mc-panel p-3.5 bg-[#171420] border-2 border-[#55ffff] text-white shadow-2xl flex items-center gap-3 animate-fade-in">
          <div className="w-2.5 h-2.5 bg-[#55ff55] rounded-full animate-ping" />
          <span className="text-xs font-bold font-mono">{toastMessage}</span>
        </div>
      )}

      <Navbar 
        gameInfo={gameInfo}
        onOpenAdminLogin={() => setAdminLoginOpen(true)}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
      />

      <main className="flex-grow">
        <HeroSection 
          gameInfo={gameInfo}
          featuredScreenshots={featuredScreenshots}
          splashConfig={splashConfig}
          currentWallpaperUrl={currentWallpaperUrl}
          onOpenAddScreenshot={() => {
            setEditingScreenshot(null);
            setAddScreenshotOpen(true);
          }}
        />

        <FeaturesSection gameInfo={gameInfo} features={gameInfo?.features} />

        <ScreenshotsGallery 
          screenshots={screenshots}
          allowPublicScreenshots={gameInfo.allowPublicScreenshots}
          onOpenAddScreenshot={() => {
            setEditingScreenshot(null);
            setAddScreenshotOpen(true);
          }}
          onEditScreenshot={handleOpenEditScreenshot}
          onDeleteScreenshot={handleDeleteScreenshot}
          onOpenAdminLogin={() => setAdminLoginOpen(true)}
        />

        <BlockframeEcosystemSection gameInfo={gameInfo} />

        <ChangelogSection
          commits={commits}
          gameInfo={gameInfo}
          onRefreshCommits={handleRefreshCommits}
          isLoadingCommits={isRefreshingCommits}
        />

        <InstallGuideSection gameInfo={gameInfo} />
      </main>

      <Footer gameInfo={gameInfo} onOpenAdminLogin={() => setAdminLoginOpen(true)} />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={adminPanelOpen}
        onClose={() => setAdminPanelOpen(false)}
        gameInfo={gameInfo}
        screenshots={screenshots}
        changelog={changelog}
        admins={adminsList}
        logs={logs}
        splashConfig={splashConfig}
        wallpapers={wallpapers}
        currentWallpaperUrl={currentWallpaperUrl}
        onOpenAddScreenshot={() => {
          setEditingScreenshot(null);
          setAddScreenshotOpen(true);
        }}
        onOpenAddRelease={() => {
          setEditingRelease(null);
          setAddReleaseOpen(true);
        }}
        onEditScreenshot={handleOpenEditScreenshot}
        onEditRelease={handleOpenEditRelease}
        onDeleteScreenshot={handleDeleteScreenshot}
        onDeleteRelease={handleDeleteRelease}
        onAddAdmin={handleAddAdmin}
        onRevokeAdmin={handleRevokeAdmin}
        onUpdateGameInfo={handleUpdateGameInfo}
        onRefreshLogs={refreshLogs}
        onSaveSplashes={handleSaveSplashes}
        onAddWallpaper={handleAddWallpaper}
        onDeleteWallpaper={handleDeleteWallpaper}
        onSelectActiveWallpaper={handleSelectActiveWallpaper}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onOpenAdminPanel={() => setAdminPanelOpen(true)}
      />

      {/* Add / Edit Screenshot Modal */}
      <AddScreenshotModal
        isOpen={addScreenshotOpen}
        onClose={() => {
          setAddScreenshotOpen(false);
          setEditingScreenshot(null);
        }}
        onSave={handleSaveScreenshot}
        editScreenshot={editingScreenshot}
        allowPublicScreenshots={gameInfo.allowPublicScreenshots}
        onOpenAdminLogin={() => {
          setAddScreenshotOpen(false);
          setAdminLoginOpen(true);
        }}
      />

      {/* Add / Edit Changelog Release Modal */}
      <AddChangelogModal
        isOpen={addReleaseOpen}
        onClose={() => {
          setAddReleaseOpen(false);
          setEditingRelease(null);
        }}
        onSave={handleSaveRelease}
        editRelease={editingRelease}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
