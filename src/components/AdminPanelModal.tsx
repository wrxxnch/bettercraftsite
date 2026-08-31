import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Image as ImageIcon, 
  Tag, 
  UserPlus, 
  UserMinus, 
  Settings, 
  Activity, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertCircle, 
  ExternalLink, 
  Lock, 
  Unlock,
  Sparkles,
  Eye,
  RefreshCw,
  Pickaxe,
  Smartphone,
  Upload,
  Wallpaper,
  MessageSquare,
  Shuffle
} from 'lucide-react';
import { 
  AdminUser, 
  Screenshot, 
  ChangelogRelease, 
  GameInfo, 
  AuditLog,
  SplashConfig,
  WallpaperItem
} from '../types';
import { useAuth } from '../context/AuthContext';
import { compressImageForFirebase } from '../lib/imageCompressor';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameInfo: GameInfo;
  screenshots: Screenshot[];
  changelog: ChangelogRelease[];
  admins: AdminUser[];
  logs: AuditLog[];
  splashConfig: SplashConfig;
  wallpapers: WallpaperItem[];
  currentWallpaperUrl: string;
  onOpenAddScreenshot: () => void;
  onOpenAddRelease: () => void;
  onEditScreenshot: (screenshot: Screenshot) => void;
  onEditRelease: (release: ChangelogRelease) => void;
  onDeleteScreenshot: (id: string) => Promise<void>;
  onDeleteRelease: (id: string) => Promise<void>;
  onAddAdmin: (data: { email: string; name?: string; role: string }) => Promise<void>;
  onRevokeAdmin: (id: string) => Promise<void>;
  onUpdateGameInfo: (info: Partial<GameInfo>) => Promise<void>;
  onRefreshLogs: () => Promise<void>;
  onSaveSplashes: (splashes: SplashConfig) => Promise<void>;
  onAddWallpaper: (wallpaper: { url: string; title: string }) => Promise<void>;
  onDeleteWallpaper: (id: string) => Promise<void>;
  onSelectActiveWallpaper: (url: string) => void;
}

type AdminTab = 'admins' | 'screenshots' | 'changelog' | 'splashes' | 'wallpapers' | 'game' | 'logs';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  gameInfo,
  screenshots,
  changelog,
  admins,
  logs,
  splashConfig,
  wallpapers,
  currentWallpaperUrl,
  onOpenAddScreenshot,
  onOpenAddRelease,
  onEditScreenshot,
  onEditRelease,
  onDeleteScreenshot,
  onDeleteRelease,
  onAddAdmin,
  onRevokeAdmin,
  onUpdateGameInfo,
  onRefreshLogs,
  onSaveSplashes,
  onAddWallpaper,
  onDeleteWallpaper,
  onSelectActiveWallpaper
}) => {
  const { user, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('admins');
  
  // New Admin Form State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'editor'>('admin');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Game Info Edit State
  const [editableGameInfo, setEditableGameInfo] = useState<GameInfo>(gameInfo);
  const [isSavingGameInfo, setIsSavingGameInfo] = useState(false);
  const [gameInfoMessage, setGameInfoMessage] = useState<string | null>(null);

  // Splash Texts State
  const [prioritySplashesText, setPrioritySplashesText] = useState(splashConfig?.prioritySplashes || '');
  const [normalSplashesText, setNormalSplashesText] = useState(splashConfig?.normalSplashes || '');
  const [isSavingSplashes, setIsSavingSplashes] = useState(false);
  const [splashMessage, setSplashMessage] = useState<string | null>(null);
  const [splashPreviewText, setSplashPreviewText] = useState<string>('★ Experiência sandbox completa! ★');
  const [isAndroid, setIsAndroid] = useState(false);

  // Wallpapers State
  const [newWallpaperUrl, setNewWallpaperUrl] = useState('');
  const [newWallpaperTitle, setNewWallpaperTitle] = useState('');
  const [isAddingWallpaper, setIsAddingWallpaper] = useState(false);
  const [wallpaperMessage, setWallpaperMessage] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Sync state when props update
  useEffect(() => {
    setEditableGameInfo(gameInfo);
  }, [gameInfo, isOpen]);

  useEffect(() => {
    if (splashConfig) {
      setPrioritySplashesText(splashConfig.prioritySplashes || '');
      setNormalSplashesText(splashConfig.normalSplashes || '');
    }
  }, [splashConfig, isOpen]);

  // Device detection
  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator) {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
      setIsAndroid(/android/i.test(ua));
    }
  }, []);

  if (!isOpen) return null;

  const handleSaveGameInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGameInfo(true);
    setGameInfoMessage(null);
    try {
      await onUpdateGameInfo(editableGameInfo);
      setGameInfoMessage('Configurações e permissões salvas com sucesso!');
      setTimeout(() => setGameInfoMessage(null), 4000);
    } catch (err: any) {
      setGameInfoMessage(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSavingGameInfo(false);
    }
  };

  const handleSaveSplashesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSplashes(true);
    setSplashMessage(null);
    try {
      await onSaveSplashes({
        prioritySplashes: prioritySplashesText,
        normalSplashes: normalSplashesText
      });
      setSplashMessage('Textos Splash salvos com sucesso!');
      setTimeout(() => setSplashMessage(null), 4000);
    } catch (err: any) {
      setSplashMessage(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSavingSplashes(false);
    }
  };

  const handleRandomizeSplashPreview = () => {
    const combined = [
      ...prioritySplashesText.split('\n'),
      ...normalSplashesText.split('\n')
    ].map(s => s.trim()).filter(s => s.length > 0);

    if (combined.length > 0) {
      const random = combined[Math.floor(Math.random() * combined.length)];
      setSplashPreviewText(random);
    }
  };

  const handleAddWallpaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWallpaperUrl.trim()) return;

    setIsAddingWallpaper(true);
    setWallpaperMessage(null);
    try {
      await onAddWallpaper({
        url: newWallpaperUrl.trim(),
        title: newWallpaperTitle.trim() || 'Papel de Parede'
      });
      setWallpaperMessage('Wallpaper adicionado com sucesso!');
      setNewWallpaperUrl('');
      setNewWallpaperTitle('');
      setTimeout(() => setWallpaperMessage(null), 4000);
    } catch (err: any) {
      setWallpaperMessage(`Erro ao adicionar wallpaper: ${err.message}`);
    } finally {
      setIsAddingWallpaper(false);
    }
  };

  const handleWallpaperFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const dataUrl = await compressImageForFirebase(file, 1600, 0.85);
      setNewWallpaperUrl(dataUrl);
      if (!newWallpaperTitle) {
        setNewWallpaperTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    } catch (err: any) {
      alert(`Erro ao processar imagem: ${err.message}`);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleQuickAddFromScreenshot = async (screenshot: Screenshot) => {
    try {
      await onAddWallpaper({
        url: screenshot.imageUrl,
        title: `Captura: ${screenshot.title}`
      });
      setWallpaperMessage(`Foto "${screenshot.title}" adicionada aos Wallpapers!`);
      setTimeout(() => setWallpaperMessage(null), 4000);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  };

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);

    if (!newAdminEmail || !newAdminEmail.includes('@')) {
      setAdminError('Informe um e-mail válido.');
      return;
    }

    setIsAddingAdmin(true);
    try {
      await onAddAdmin({
        email: newAdminEmail.trim(),
        name: newAdminName.trim() || undefined,
        role: newAdminRole
      });
      setAdminSuccess(`Administrador "${newAdminEmail}" adicionado com sucesso!`);
      setNewAdminEmail('');
      setNewAdminName('');
    } catch (err: any) {
      setAdminError(err.message || 'Erro ao adicionar administrador.');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRevokeAdminClick = async (admin: AdminUser) => {
    if (admin.isProtected || admin.email.toLowerCase() === 'jeanpierreowner@gmail.com') {
      alert('O Administrador Principal não pode ser revogado.');
      return;
    }

    if (confirm(`Tem certeza que deseja revogar o acesso de ${admin.email} (${admin.name})?`)) {
      setRevokingId(admin.id);
      try {
        await onRevokeAdmin(admin.id);
      } catch (err: any) {
        alert(err.message || 'Erro ao revogar administrador.');
      } finally {
        setRevokingId(null);
      }
    }
  };

  const prioritySplashesCount = prioritySplashesText.split('\n').filter(s => s.trim().length > 0).length;
  const normalSplashesCount = normalSplashesText.split('\n').filter(s => s.trim().length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div 
        className="relative max-w-5xl w-full mc-panel p-0 text-[#e0dfd5] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Minecraft Style */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#171420] border-b-2 border-[#332c42]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 mc-slot flex items-center justify-center text-[#55ffff] p-1 border-2 border-[#55ffff] bg-[#120f1a] overflow-hidden">
              <img 
                src="https://raw.githubusercontent.com/wrxxnch/luanti-bettercraft/main/games/bettercraft/menu/icon.png" 
                alt="Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain [image-rendering:pixelated]" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide mc-text-shadow font-minecraft">
                  PAINEL DE CONTROLE ADMINISTRATIVO
                </h2>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#2b742b] text-white border border-[#55ff55]">
                  {user?.role === 'owner' ? 'SUPER ADMIN' : 'ADMIN'}
                </span>
              </div>
              <p className="text-xs text-[#9e9aa8] font-mono">
                Logado: <span className="text-[#55ff55] font-bold">{user?.email}</span> ({user?.name})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 mc-btn mc-btn-red text-xs flex items-center justify-center cursor-pointer p-0"
            title="Fechar Painel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-[#120f1a] border-b-2 border-[#2b2438] overflow-x-auto">
          <button
            onClick={() => setActiveTab('admins')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'admins'
                ? 'mc-btn mc-btn-diamond text-white'
                : 'mc-btn bg-[#1d1829] text-[#b4afc4] border-[#372f47]'
            }`}
          >
            Administradores ({admins.length})
          </button>

          <button
            onClick={() => setActiveTab('screenshots')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'screenshots'
                ? 'mc-btn mc-btn-diamond text-white'
                : 'mc-btn bg-[#1d1829] text-[#b4afc4] border-[#372f47]'
            }`}
          >
            Gerenciar Fotos ({screenshots.length})
          </button>

          <button
            onClick={() => setActiveTab('changelog')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'changelog'
                ? 'mc-btn mc-btn-diamond text-white'
                : 'mc-btn bg-[#1d1829] text-[#b4afc4] border-[#372f47]'
            }`}
          >
            Changelog & Versões ({changelog.length})
          </button>

          {/* NEW TAB: SPLASH TEXTS */}
          <button
            onClick={() => setActiveTab('splashes')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'splashes'
                ? 'mc-btn mc-btn-gold text-white'
                : 'mc-btn bg-[#1d1829] text-[#ffff55] border-[#372f47]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Textos Splash ({prioritySplashesCount + normalSplashesCount})</span>
          </button>

          {/* NEW TAB: WALLPAPERS */}
          <button
            onClick={() => setActiveTab('wallpapers')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'wallpapers'
                ? 'mc-btn mc-btn-diamond text-white'
                : 'mc-btn bg-[#1d1829] text-[#55ffff] border-[#372f47]'
            }`}
          >
            <Wallpaper className="w-3.5 h-3.5" />
            <span>Papéis de Parede ({wallpapers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('game')}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'game'
                ? 'mc-btn mc-btn-diamond text-white'
                : 'mc-btn bg-[#1d1829] text-[#b4afc4] border-[#372f47]'
            }`}
          >
            Configurações
          </button>

          <button
            onClick={() => {
              setActiveTab('logs');
              onRefreshLogs();
            }}
            className={`px-3 py-1.5 text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'logs'
                ? 'mc-btn mc-btn-diamond text-white'
                : 'mc-btn bg-[#1d1829] text-[#b4afc4] border-[#372f47]'
            }`}
          >
            Logs ({logs.length})
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#1a1626] space-y-6">
          
          {/* TAB 1: ADMINS MANAGEMENT */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              
              {/* Form to Add New Admin */}
              <div className="mc-panel p-5 space-y-3.5">
                <div className="flex items-center gap-2 text-white">
                  <UserPlus className="w-4 h-4 text-[#55ff55]" />
                  <h3 className="text-sm font-bold uppercase tracking-wide">
                    Adicionar Novo Administrador
                  </h3>
                </div>
                <p className="text-xs text-[#b4afc4]">
                  Conceda acesso a outros membros da equipe para gerenciar capturas de tela e publicar notas de versão.
                </p>

                {adminError && (
                  <div className="p-3 bg-[#3d1212] border-2 border-[#822222] text-[#ff8888] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{adminError}</span>
                  </div>
                )}

                {adminSuccess && (
                  <div className="p-3 bg-[#113811] border-2 border-[#2b742b] text-[#88ff88] text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>{adminSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleAddAdminSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <input
                      type="email"
                      required
                      placeholder="email@exemplo.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white placeholder-[#686278] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Nome / Nick"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white placeholder-[#686278] focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <select
                      value={newAdminRole}
                      onChange={(e) => setNewAdminRole(e.target.value as any)}
                      className="w-full px-2 py-2 bg-[#120f1a] border-2 border-[#3b344a] text-xs font-bold text-[#ffff55] focus:outline-none"
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={isAddingAdmin}
                      className="mc-btn mc-btn-green w-full py-2 text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{isAddingAdmin ? '...' : 'Adicionar'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Admins List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#b4afc4]">
                  Administradores Ativos ({admins.length})
                </h3>

                <div className="space-y-2">
                  {admins.map((admin) => {
                    const isOwner = admin.role === 'owner' || admin.email.toLowerCase() === 'jeanpierreowner@gmail.com';

                    return (
                      <div
                        key={admin.id}
                        className="mc-panel p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={admin.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name)}&background=0284c7&color=fff`}
                            alt={admin.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 mc-slot object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white mc-text-shadow">
                                {admin.name}
                              </span>
                              {isOwner ? (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#5e410a] text-[#ffff55] border border-[#ffaa00]">
                                  PROPRIETÁRIO / SUPER ADMIN
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#173e47] text-[#55ffff] border border-[#55ffff]">
                                  {admin.role.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#55ffff] font-mono mt-0.5">
                              {admin.email}
                            </p>
                            <p className="text-[10px] text-[#8e8999]">
                              Adicionado em: {new Date(admin.addedAt).toLocaleDateString('pt-BR')} por {admin.addedBy}
                            </p>
                          </div>
                        </div>

                        {/* Revoke Action */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isOwner ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-[#b4afc4] px-2.5 py-1 mc-slot">
                              <Lock className="w-3 h-3 text-[#ffff55]" />
                              Protegido
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRevokeAdminClick(admin)}
                              disabled={revokingId === admin.id}
                              className="mc-btn mc-btn-red px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              title="Revogar privilégios administrativos"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>{revokingId === admin.id ? 'Revogando...' : 'Revogar Acesso'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SCREENSHOTS MANAGEMENT (WITH EDIT SUPPORT) */}
          {activeTab === 'screenshots' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-minecraft">
                    GERENCIADOR DE CAPTURAS DE TELA
                  </h3>
                  <p className="text-xs text-[#b4afc4]">
                    Adicione, edite posts de fotos ou remova capturas exibidas no site.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddScreenshot();
                  }}
                  className="mc-btn mc-btn-green px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Nova Foto</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {screenshots.map((s) => (
                  <div
                    key={s.id}
                    className="mc-panel p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video w-full mc-slot overflow-hidden bg-black mb-2">
                        <img
                          src={s.imageUrl}
                          alt={s.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 text-[10px] font-bold mc-slot bg-black/80 text-[#55ffff]">
                          {s.category}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white truncate mc-text-shadow">
                        {s.title}
                      </h4>
                      <p className="text-[11px] text-[#b4afc4] line-clamp-1 mt-0.5">
                        {s.description || 'Sem descrição'}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t-2 border-[#2b2438] flex items-center justify-between text-[11px]">
                      <span className="text-[#8e8999] truncate max-w-[100px] font-mono">
                        {s.author.split('@')[0]}
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {/* Edit post button */}
                        <button
                          onClick={() => {
                            onClose();
                            onEditScreenshot(s);
                          }}
                          className="mc-btn mc-btn-diamond px-2 py-1 text-[10px] flex items-center gap-1 cursor-pointer"
                          title="Editar post"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Excluir captura "${s.title}"?`)) {
                              onDeleteScreenshot(s.id);
                            }
                          }}
                          className="mc-btn mc-btn-red px-2 py-1 text-[10px] cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CHANGELOG MANAGEMENT (WITH EDIT SUPPORT) */}
          {activeTab === 'changelog' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-minecraft">
                    GERENCIADOR DE NOTAS DE VERSÃO
                  </h3>
                  <p className="text-xs text-[#b4afc4]">
                    Publique novos lançamentos de versão ou edite notas existentes.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAddRelease();
                  }}
                  className="mc-btn mc-btn-green px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Publicar Nova Versão</span>
                </button>
              </div>

              <div className="space-y-3">
                {changelog.map((rel) => (
                  <div
                    key={rel.id}
                    className="mc-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 mc-slot text-xs font-mono font-bold text-[#55ffff]">
                          {rel.version}
                        </span>
                        <h4 className="text-sm font-bold text-white mc-text-shadow">
                          {rel.title}
                        </h4>
                        <span className="text-xs text-[#8e8999] font-mono">
                          ({rel.date})
                        </span>
                      </div>
                      <p className="text-xs text-[#b4afc4] mt-1 line-clamp-1">
                        {rel.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onClose();
                          onEditRelease(rel);
                        }}
                        className="mc-btn mc-btn-diamond px-2.5 py-1.5 text-xs flex items-center gap-1 cursor-pointer"
                        title="Editar post desta versão"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Post</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Excluir notas da versão ${rel.version}?`)) {
                            onDeleteRelease(rel.id);
                          }
                        }}
                        className="mc-btn mc-btn-red px-2.5 py-1.5 text-xs cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SPLASH TEXTS MANAGEMENT */}
          {activeTab === 'splashes' && (
            <form onSubmit={handleSaveSplashesSubmit} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-minecraft flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#ffff55]" />
                    <span>GERENCIADOR DE TEXTOS SPLASH</span>
                  </h3>
                  <p className="text-xs text-[#b4afc4]">
                    Configure as frases de abertura separadas por quebra de linha (Enter/Newline) com prioridade diária e rotação aleatória.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSplashes}
                  className="mc-btn mc-btn-green px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 self-end sm:self-center"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{isSavingSplashes ? 'Salvando...' : 'Salvar Textos Splash'}</span>
                </button>
              </div>

              {splashMessage && (
                <div className="p-3 bg-[#113811] border-2 border-[#2b742b] text-[#88ff88] text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{splashMessage}</span>
                </div>
              )}

              {/* DEVICE DETECTION STATUS & ANDROID RELEASE LINK */}
              <div className="p-3.5 mc-panel bg-[#131e16] border-2 border-[#55ff55]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 mc-slot flex items-center justify-center text-[#55ff55] bg-[#0c180f]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase font-minecraft">
                        DETECTOR DE DISPOSITIVO: {isAndroid ? '🤖 ANDROID DETECTADO' : '💻 DESKTOP / OUTRO'}
                      </span>
                      {isAndroid && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-[#2b742b] text-white font-bold">ATIVO</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#bbf7bb]">
                      {isAndroid 
                        ? 'O banner recomendando a release oficial do GitHub (Sulphur Update) está ativo para este dispositivo.'
                        : 'Quando um usuário acessar via Android, uma recomendação para a release do GitHub será exibida automaticamente.'}
                    </p>
                  </div>
                </div>

                <a
                  href="https://github.com/wrxxnch/luanti-bettercraft/releases/tag/sulphurupdate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mc-btn mc-btn-green px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Release Sulphur Update</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* LIVE SPLASH PREVIEW */}
              <div className="p-4 mc-panel bg-[#151122] border-2 border-[#ffff55]/50 space-y-2 text-center">
                <div className="flex items-center justify-between text-xs font-bold text-[#ffff55] uppercase pb-1 border-b border-[#2b2438]">
                  <span>Pré-visualização do Splash no Site</span>
                  <button
                    type="button"
                    onClick={handleRandomizeSplashPreview}
                    className="mc-btn px-2 py-0.5 text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Sortear Exemplo</span>
                  </button>
                </div>

                <div className="py-4">
                  <div className="inline-block transform -rotate-2 py-1.5 px-4 bg-[#1d1628] border border-[#ffaa00] shadow-xl">
                    <span className="text-base sm:text-lg font-bold mc-yellow-splash tracking-wide">
                      {splashPreviewText}
                    </span>
                  </div>
                </div>
              </div>

              {/* SPLASH TEXTS INPUTS (PRIORITY & NORMAL) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* 1. PRIORITY SPLASHES (1st visit of the day) */}
                <div className="mc-panel p-4 space-y-2 bg-[#1a1426] border-2 border-[#ffaa00]/70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-xs font-bold uppercase font-minecraft text-[#ffaa00]">
                        ★ TEXTOS SPLASH PRIORITÁRIOS
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 mc-slot text-[#ffaa00]">
                      {prioritySplashesCount} frases (1 por linha)
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-[#b4afc4]">
                    Mostrados <strong>na primeira vez do dia</strong> que o jogador entra no site. Separe cada frase com um Enter (quebra de linha).
                  </p>

                  <textarea
                    rows={8}
                    value={prioritySplashesText}
                    onChange={(e) => setPrioritySplashesText(e.target.value)}
                    placeholder={"★ Bem-vindo ao Luanti BetterCraft!\n★ Confira a atualização Sulphur Update no GitHub!\n★ Shaders volumétricos & biomas únicos ativos!"}
                    className="w-full px-3 py-2 bg-[#100d18] border-2 border-[#3b344a] focus:border-[#ffaa00] text-xs text-white font-mono leading-relaxed"
                  />
                </div>

                {/* 2. NORMAL SPLASHES (Random) */}
                <div className="mc-panel p-4 space-y-2 bg-[#141526] border-2 border-[#55ffff]/70">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                      <span className="text-xs font-bold uppercase font-minecraft text-[#55ffff]">
                        🎲 TEXTOS SPLASH NORMAIS (ALEATÓRIOS)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 mc-slot text-[#55ffff]">
                      {normalSplashesCount} frases (1 por linha)
                    </span>
                  </div>

                  <p className="text-[11px] text-[#b4afc4]">
                    Sorteados aleatoriamente nas visitas regulares e quando o jogador clica no texto splash. Separe com Enter.
                  </p>

                  <textarea
                    rows={8}
                    value={normalSplashesText}
                    onChange={(e) => setNormalSplashesText(e.target.value)}
                    placeholder={"100% Aberto e Código Limpo!\nFeito para o motor Luanti 5.9.0+!\nPerformance ultra-leve sem travamentos!\nExplore cavernas profundas com cristais!"}
                    className="w-full px-3 py-2 bg-[#100d18] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white font-mono leading-relaxed"
                  />
                </div>

              </div>
            </form>
          )}

          {/* TAB 5: WALLPAPERS MANAGEMENT */}
          {activeTab === 'wallpapers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-minecraft flex items-center gap-2">
                    <Wallpaper className="w-4 h-4 text-[#55ffff]" />
                    <span>GERENCIADOR DE PAPÉIS DE PAREDE (WALLPAPERS)</span>
                  </h3>
                  <p className="text-xs text-[#b4afc4]">
                    Adicione fotos para o fundo do site via URL, upload normal de arquivo ou selecionando diretamente das fotos de posts da galeria!
                  </p>
                </div>
              </div>

              {wallpaperMessage && (
                <div className="p-3 bg-[#113811] border-2 border-[#2b742b] text-[#88ff88] text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{wallpaperMessage}</span>
                </div>
              )}

              {/* FORM: ADD NEW WALLPAPER */}
              <div className="mc-panel p-5 space-y-4 bg-[#171424]">
                <div className="flex items-center gap-2 text-white">
                  <Plus className="w-4 h-4 text-[#55ff55]" />
                  <h4 className="text-xs font-bold uppercase font-minecraft">
                    ADICIONAR NOVO PAPEL DE PAREDE
                  </h4>
                </div>

                <form onSubmit={handleAddWallpaperSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-bold text-[#b4afc4] uppercase mb-1">
                        URL da Imagem
                      </label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/fundo.jpg"
                        value={newWallpaperUrl}
                        onChange={(e) => setNewWallpaperUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-[#100d18] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-[#b4afc4] uppercase mb-1">
                        Título do Wallpaper
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Montanhas ao Entardecer"
                        value={newWallpaperTitle}
                        onChange={(e) => setNewWallpaperTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-[#100d18] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white"
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-end gap-2">
                      <label className="mc-btn px-3 py-2 text-xs flex-1 flex items-center justify-center gap-1 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingFile ? '...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleWallpaperFileUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="submit"
                        disabled={isAddingWallpaper || !newWallpaperUrl.trim()}
                        className="mc-btn mc-btn-green px-4 py-2 text-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* QUICK SELECT FROM GALLERY POSTS */}
              <div className="mc-panel p-4 space-y-3 bg-[#151221] border-2 border-[#ffaa00]/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#ffaa00]" />
                    <h4 className="text-xs font-bold text-white uppercase font-minecraft">
                      SELECIONAR DAS FOTOS DE POSTS (GALERIA)
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#8e8999]">
                    Clique em qualquer foto para adicioná-la aos papéis de parede
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                  {screenshots.slice(0, 12).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleQuickAddFromScreenshot(s)}
                      className="mc-slot aspect-video relative overflow-hidden group hover:border-[#55ff55] transition-all cursor-pointer p-0.5 bg-black text-left"
                      title={`Adicionar "${s.title}" como wallpaper`}
                    >
                      <img
                        src={s.imageUrl}
                        alt={s.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold p-1 text-center">
                        + Usar Wallpaper
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* SAVED WALLPAPERS LIST */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#b4afc4]">
                    Papéis de Parede Ativos ({wallpapers.length})
                  </h4>
                  <span className="text-[11px] text-[#55ffff] font-mono">
                    Fundo sorteado aleatoriamente a cada visita
                  </span>
                </div>

                {wallpapers.length === 0 ? (
                  <div className="mc-panel p-8 text-center text-[#8e8999] bg-[#120f1a] border border-[#2b2438] space-y-2">
                    <Wallpaper className="w-8 h-8 mx-auto text-[#55ffff]/60" />
                    <p className="text-xs text-white font-bold uppercase">Nenhum wallpaper cadastrado no Firebase</p>
                    <p className="text-[11px] text-[#8e8999]">
                      Adicione uma imagem por URL, faça upload de arquivo acima ou selecione diretamente das fotos da galeria.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wallpapers.map((wp) => {
                      const isActive = currentWallpaperUrl === wp.url;

                      return (
                        <div
                          key={wp.id}
                          className={`mc-panel p-3 flex flex-col justify-between ${
                            isActive ? 'border-[#55ff55] bg-[#142618]' : ''
                          }`}
                        >
                          <div>
                            <div className="relative aspect-video w-full mc-slot overflow-hidden bg-black mb-2">
                              <img
                                src={wp.url}
                                alt={wp.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              {isActive && (
                                <span className="absolute top-1.5 right-1.5 px-2 py-0.5 text-[9px] font-bold mc-slot bg-[#2b742b] text-white border border-[#55ff55]">
                                  FUNDO ATUAL
                                </span>
                              )}
                            </div>

                            <h5 className="text-xs font-bold text-white truncate">
                              {wp.title}
                            </h5>
                            <p className="text-[10px] text-[#8e8999] font-mono mt-0.5">
                              Adicionado por: {wp.addedBy || 'Admin'}
                            </p>
                          </div>

                          <div className="mt-3 pt-2 border-t-2 border-[#2b2438] flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => onSelectActiveWallpaper(wp.url)}
                              className={`px-2.5 py-1 text-[10px] font-bold mc-btn cursor-pointer ${
                                isActive ? 'mc-btn-green' : 'mc-btn-diamond'
                              }`}
                            >
                              {isActive ? 'Fundo Ativo' : 'Ativar Fundo'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remover wallpaper "${wp.title}" do Firebase?`)) {
                                  onDeleteWallpaper(wp.id);
                                }
                              }}
                              className="mc-btn mc-btn-red px-2 py-1 text-[10px] cursor-pointer"
                              title="Remover do Firebase"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: GAME INFO & PERMISSION SETTINGS */}
          {activeTab === 'game' && (
            <form onSubmit={handleSaveGameInfo} className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-minecraft">
                    CONFIGURAÇÕES DO SITE & PERMISSÕES
                  </h3>
                  <p className="text-xs text-[#b4afc4]">
                    Configure permissões de postagem de fotos, links do ecossistema Blockframe e dados do jogo.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingGameInfo}
                  className="mc-btn mc-btn-green px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>{isSavingGameInfo ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </div>

              {gameInfoMessage && (
                <div className="p-3 bg-[#113811] border-2 border-[#2b742b] text-[#88ff88] text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{gameInfoMessage}</span>
                </div>
              )}

              {/* PERMISSION CARD: PHOTO POSTING CONTROL */}
              <div className="p-4 mc-panel bg-[#1a1527] border-2 border-[#ffaa00]/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 mc-slot flex items-center justify-center text-[#ffaa00] bg-[#120f1a]">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase font-minecraft">
                        PERMISSÃO DE POSTAGEM DE FOTOS / CAPTURAS
                      </h4>
                      <p className="text-[11px] text-[#b4afc4]">
                        Defina quem tem permissão para enviar fotos diretamente para a galeria do site.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditableGameInfo({
                      ...editableGameInfo,
                      allowPublicScreenshots: !editableGameInfo.allowPublicScreenshots
                    })}
                    className={`px-3 py-1.5 mc-btn text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                      editableGameInfo.allowPublicScreenshots
                        ? 'mc-btn-green text-white'
                        : 'mc-btn-red text-white'
                    }`}
                  >
                    {editableGameInfo.allowPublicScreenshots ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>TODOS PODEM POSTAR (ATIVO)</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>EXCLUSIVO ADMINS (PADRÃO)</span>
                      </>
                    )}
                  </button>
                </div>

                <div className={`p-2.5 mc-slot text-xs ${
                  editableGameInfo.allowPublicScreenshots 
                    ? 'bg-[#142814] text-[#88ff88] border-[#2b742b]' 
                    : 'bg-[#291414] text-[#ffaaaa] border-[#742b2b]'
                }`}>
                  {editableGameInfo.allowPublicScreenshots ? (
                    <span>🌍 <strong>Aberto para Todos:</strong> Visitantes e jogadores da comunidade podem fazer upload e postar capturas informando seu apelido no Luanti.</span>
                  ) : (
                    <span>🔒 <strong>Exclusivo para Admins (Padrão):</strong> Apenas administradores autenticados podem publicar capturas de tela. Usuários comuns verão aviso para entrar como admin.</span>
                  )}
                </div>
              </div>

              {/* SECTION: ECOSYSTEM & OFFICIAL REPOSITORY URLS */}
              <div className="p-4 mc-panel bg-[#151120] border-2 border-[#55ffff]/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 mc-slot flex items-center justify-center text-[#55ffff]">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase font-minecraft">
                      LINKS OFICIAIS DO ECOSSISTEMA & REPOSITÓRIOS
                    </h4>
                    <p className="text-[11px] text-[#8e8999]">
                      URLs integradas em todo o site (Hero, Navegação, Downloads e Ecossistema).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[#55ff55] uppercase mb-1">
                      1. games/bettercraft (Pasta games/ Luanti)
                    </label>
                    <input
                      type="url"
                      value={editableGameInfo.gamesRepoUrl || editableGameInfo.repoUrl}
                      onChange={(e) => setEditableGameInfo({ 
                        ...editableGameInfo, 
                        gamesRepoUrl: e.target.value,
                        repoUrl: e.target.value 
                      })}
                      placeholder="https://github.com/wrxxnch/bettercraft"
                      className="w-full px-3 py-1.5 bg-[#100d18] border-2 border-[#3b344a] focus:border-[#55ff55] text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#55ffff] uppercase mb-1">
                      2. Luanti-BetterCraft (Código Mais Atualizado)
                    </label>
                    <input
                      type="url"
                      value={editableGameInfo.officialCodeRepoUrl || 'https://github.com/wrxxnch/luanti-bettercraft'}
                      onChange={(e) => setEditableGameInfo({ 
                        ...editableGameInfo, 
                        officialCodeRepoUrl: e.target.value 
                      })}
                      placeholder="https://github.com/wrxxnch/luanti-bettercraft"
                      className="w-full px-3 py-1.5 bg-[#100d18] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#ffaa00] uppercase mb-1">
                      3. Pacote Mod Blockframe no ContentDB
                    </label>
                    <input
                      type="url"
                      value={editableGameInfo.blockframeContentDbUrl || 'https://content.luanti.org/packages/wrxxnch/blockframe/'}
                      onChange={(e) => setEditableGameInfo({ 
                        ...editableGameInfo, 
                        blockframeContentDbUrl: e.target.value 
                      })}
                      placeholder="https://content.luanti.org/packages/wrxxnch/blockframe/"
                      className="w-full px-3 py-1.5 bg-[#100d18] border-2 border-[#3b344a] focus:border-[#ffaa00] text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#55ffff] uppercase mb-1">
                      4. Blockframe Comunidade (Tudo Conectado)
                    </label>
                    <input
                      type="url"
                      value={editableGameInfo.blockframeCommunityUrl || 'https://wrxxnch.github.io/blockframecommunity/'}
                      onChange={(e) => setEditableGameInfo({ 
                        ...editableGameInfo, 
                        blockframeCommunityUrl: e.target.value 
                      })}
                      placeholder="https://wrxxnch.github.io/blockframecommunity/"
                      className="w-full px-3 py-1.5 bg-[#100d18] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#ffff55] uppercase mb-1">
                      5. Tutoriais de Como Usar o Blockframe
                    </label>
                    <input
                      type="url"
                      value={editableGameInfo.blockframeTutorialsUrl || 'https://wrxxnch.github.io/blockframesite/'}
                      onChange={(e) => setEditableGameInfo({ 
                        ...editableGameInfo, 
                        blockframeTutorialsUrl: e.target.value 
                      })}
                      placeholder="https://wrxxnch.github.io/blockframesite/"
                      className="w-full px-3 py-1.5 bg-[#100d18] border-2 border-[#3b344a] focus:border-[#ffff55] text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* General Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#b4afc4] uppercase mb-1">
                    Título do Jogo
                  </label>
                  <input
                    type="text"
                    value={editableGameInfo.title}
                    onChange={(e) => setEditableGameInfo({ ...editableGameInfo, title: e.target.value })}
                    className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#b4afc4] uppercase mb-1">
                    Licença de Distribuição
                  </label>
                  <input
                    type="text"
                    value={editableGameInfo.license}
                    onChange={(e) => setEditableGameInfo({ ...editableGameInfo, license: e.target.value })}
                    className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b4afc4] uppercase mb-1">
                  Descrição Curta
                </label>
                <textarea
                  rows={2}
                  value={editableGameInfo.description}
                  onChange={(e) => setEditableGameInfo({ ...editableGameInfo, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#b4afc4] uppercase mb-1">
                  Descrição Completa
                </label>
                <textarea
                  rows={3}
                  value={editableGameInfo.longDescription}
                  onChange={(e) => setEditableGameInfo({ ...editableGameInfo, longDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] text-xs text-white"
                />
              </div>
            </form>
          )}

          {/* TAB 7: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-minecraft">
                    REGISTROS DE ATIVIDADE & AUDITORIA
                  </h3>
                  <p className="text-xs text-[#b4afc4]">
                    Histórico de ações administrativas realizadas no sistema.
                  </p>
                </div>
                <button
                  onClick={onRefreshLogs}
                  className="mc-btn px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atualizar</span>
                </button>
              </div>

              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="mc-panel p-3 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 mc-slot font-bold text-[#55ffff]">
                          {log.action}
                        </span>
                        <span className="font-mono text-[#55ff55]">
                          {log.userEmail}
                        </span>
                      </div>
                      <p className="text-[#cfcbd9]">
                        {log.details}
                      </p>
                    </div>

                    <span className="text-[10px] text-[#8e8999] font-mono flex-shrink-0">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
