import React, { useState, useMemo } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Maximize2, 
  X, 
  Tag, 
  Calendar, 
  User, 
  Star,
  Check,
  Layers,
  Sparkles,
  Search,
  RotateCcw,
  Wallpaper
} from 'lucide-react';
import { Screenshot } from '../types';
import { useAuth } from '../context/AuthContext';

interface ScreenshotsGalleryProps {
  screenshots: Screenshot[];
  allowPublicScreenshots?: boolean;
  currentWallpaperUrl?: string | null;
  onOpenAddScreenshot: () => void;
  onEditScreenshot: (screenshot: Screenshot) => void;
  onDeleteScreenshot: (id: string) => Promise<void>;
  onSetAsWallpaper?: (screenshot: Screenshot) => void | Promise<void>;
  onOpenAdminLogin?: () => void;
}

export const ScreenshotsGallery: React.FC<ScreenshotsGalleryProps> = ({
  screenshots,
  allowPublicScreenshots = false,
  currentWallpaperUrl,
  onOpenAddScreenshot,
  onEditScreenshot,
  onDeleteScreenshot,
  onSetAsWallpaper,
  onOpenAdminLogin
}) => {
  const { isAdmin, user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lightboxImage, setLightboxImage] = useState<Screenshot | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canPost = isAdmin || allowPublicScreenshots;

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(screenshots.map(s => s.category).filter(Boolean)))];
  }, [screenshots]);

  const filteredScreenshots = useMemo(() => {
    return screenshots.filter(s => {
      // Category filter
      const matchesCategory = selectedCategory === 'all' || s.category?.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchesCategory) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = s.title?.toLowerCase().includes(q);
      const matchDesc = s.description?.toLowerCase().includes(q);
      const matchAuthor = s.author?.toLowerCase().includes(q);
      const matchCategory = s.category?.toLowerCase().includes(q);
      const matchTags = s.tags?.some(t => t.toLowerCase().includes(q));

      return matchTitle || matchDesc || matchAuthor || matchCategory || matchTags;
    });
  }, [screenshots, selectedCategory, searchQuery]);

  const handleDelete = async (screenshot: Screenshot) => {
    if (window.confirm(`Tem certeza que deseja excluir a captura "${screenshot.title}"?`)) {
      setDeletingId(screenshot.id);
      try {
        await onDeleteScreenshot(screenshot.id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <section id="galeria" className="py-16 sm:py-20 bg-[#14111c] border-b-4 border-[#241f30] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mc-slot text-xs font-bold text-[#55ffff] mb-2 uppercase">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>GALERIA DE CAPTURAS DO JOGO</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide mc-title-shadow uppercase font-minecraft">
              EXPLORE O MUNDO DE BETTERCRAFT
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#b4afc4]">
              Paisagens, construções épicas, sistemas de iluminação e novos biomas criados pela comunidade.
            </p>
          </div>

          {/* Action Button: Visible for Admins OR if Public Posting is Enabled */}
          {canPost && (
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={onOpenAddScreenshot}
                id="gallery-btn-add-screenshot"
                className="mc-btn mc-btn-green px-4 py-2.5 text-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isAdmin ? 'PUBLICAR FOTO (ADMIN)' : 'ENVIAR MINHA FOTO'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mc-panel p-4 mb-8 bg-[#171322] border-2 border-[#2b2438] space-y-3.5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input Bar */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#55ffff]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título, bioma, shaders, autor ou tags..."
                className="w-full pl-9 pr-8 py-2 bg-[#0f0d17] border-2 border-[#332b42] focus:border-[#55ffff] text-xs text-white placeholder-[#78728a] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8e8999] hover:text-white cursor-pointer"
                  title="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Results Counter / Filter Stats */}
            <div className="flex items-center gap-2 text-xs text-[#8e8999] font-mono px-1">
              <span className="text-[#55ffff] font-bold">{filteredScreenshots.length}</span>
              <span>{filteredScreenshots.length === 1 ? 'foto encontrada' : 'fotos encontradas'}</span>
              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-[#ffaa00] hover:underline flex items-center gap-1 ml-2 cursor-pointer font-bold"
                  title="Redefinir todos os filtros"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpar filtros</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'mc-btn mc-btn-diamond text-white'
                    : 'mc-btn bg-[#201c2b] text-[#b4afc4] border-[#372f47] hover:text-white'
                }`}
              >
                {cat === 'all' ? '★ Todas as Fotos' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Screenshots Grid */}
        {filteredScreenshots.length === 0 ? (
          <div className="mc-panel p-12 text-center text-[#9e9aa8] space-y-4 bg-[#171322] border-2 border-[#332c42]">
            <div className="w-16 h-16 mc-slot mx-auto flex items-center justify-center text-[#55ffff]">
              {searchQuery ? <Search className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase font-minecraft">
                {searchQuery ? 'NENHUMA FOTO ENCONTRADA' : 'GALERIA VAZIA NO FIREBASE'}
              </h3>
              <p className="text-xs text-[#b4afc4] mt-1 max-w-md mx-auto">
                {searchQuery 
                  ? `Nenhuma captura de tela corresponde à pesquisa "${searchQuery}". Tente outros termos ou limpe o filtro.`
                  : 'Nenhuma foto publicada ainda. Os novos envios são gravados e sincronizados em tempo real diretamente no Firebase Firestore.'
                }
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mc-btn mc-btn-diamond px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer font-bold"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>LIMPAR BUSCA</span>
                </button>
              ) : canPost ? (
                <button
                  onClick={onOpenAddScreenshot}
                  className="mc-btn mc-btn-green px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer font-bold"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>PUBLICAR PRIMEIRA FOTO</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAdminLogin}
                  className="mc-btn mc-btn-diamond px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer font-bold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>CONECTAR COM GOOGLE / ADMIN</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScreenshots.map((item) => (
              <div
                key={item.id}
                className="mc-panel p-3 flex flex-col justify-between group hover:border-[#55ffff] transition-colors"
              >
                <div>
                  {/* Image Container with Slot Border */}
                  <div className="relative aspect-video w-full mc-slot overflow-hidden bg-black mb-3">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 mc-slot bg-black/80 text-[#55ffff] text-[10px] font-bold uppercase">
                      {item.category}
                    </div>

                    {/* Featured Star Badge */}
                    {item.featured && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 mc-slot bg-[#3d2a00] text-[#ffff55] text-[10px] font-bold uppercase flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#ffff55]" />
                        <span>Destaque</span>
                      </div>
                    )}

                    {/* Active Wallpaper Badge */}
                    {currentWallpaperUrl === item.imageUrl && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 mc-slot bg-[#122b16]/95 text-[#55ff55] border border-[#55ff55] text-[10px] font-bold uppercase flex items-center gap-1 shadow-md z-10">
                        <Wallpaper className="w-3 h-3 text-[#55ff55]" />
                        <span>Fundo Ativo</span>
                      </div>
                    )}

                    {/* View Fullscreen overlay button */}
                    <button
                      onClick={() => setLightboxImage(item)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      title="Ver em tela cheia"
                    >
                      <div className="mc-btn px-3 py-1.5 text-xs flex items-center gap-1.5 bg-[#221e2e]">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>AMPLIAR</span>
                      </div>
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-sm font-bold text-white group-hover:text-[#55ffff] transition-colors line-clamp-1 mc-text-shadow">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-[#b4afc4] mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-[#14121a] border border-[#2f293b] text-[10px] text-[#8e8999] font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer with Metadata & Admin Edit/Delete Controls */}
                <div className="mt-4 pt-2.5 border-t-2 border-[#2f293b] flex items-center justify-between text-[11px] text-[#8e8999]">
                  <span className="truncate max-w-[120px] font-mono">
                    {item.author.split('@')[0]}
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {/* Admin Direct Set as Wallpaper Button */}
                    {isAdmin && onSetAsWallpaper && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetAsWallpaper(item);
                        }}
                        className={`mc-btn px-2 py-1 text-[10px] flex items-center gap-1 cursor-pointer font-bold transition-all active:scale-95 ${
                          currentWallpaperUrl === item.imageUrl
                            ? 'mc-btn-green text-white shadow-sm'
                            : 'mc-btn-gold text-[#ffff55] hover:text-white'
                        }`}
                        title={
                          currentWallpaperUrl === item.imageUrl
                            ? 'Esta foto já está ativa no fundo da tela'
                            : 'Colocar foto deste post como wallpaper de fundo imediatamente'
                        }
                      >
                        <Wallpaper className="w-3 h-3" />
                        <span>{currentWallpaperUrl === item.imageUrl ? 'Fundo Ativo' : 'Colocar Wallpaper'}</span>
                      </button>
                    )}

                    {/* Admin Edit Button */}
                    {isAdmin && (
                      <button
                        onClick={() => onEditScreenshot(item)}
                        className="mc-btn mc-btn-diamond px-2 py-1 text-[10px] flex items-center gap-1 cursor-pointer"
                        title="Editar post desta foto"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                    )}

                    {/* Admin Delete Button */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(item)}
                        disabled={deletingId === item.id}
                        className="mc-btn mc-btn-red px-2 py-1 text-[10px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Excluir captura"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{deletingId === item.id ? '...' : 'Excluir'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-5xl w-full mc-panel p-4 bg-[#14111c]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#332c42] flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-white mc-text-shadow">
                  {lightboxImage.title}
                </h3>
                <p className="text-xs text-[#55ffff]">
                  Categoria: {lightboxImage.category} • Autor: {lightboxImage.author}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Admin Direct Set Wallpaper inside Lightbox Modal */}
                {isAdmin && onSetAsWallpaper && (
                  <button
                    type="button"
                    onClick={() => onSetAsWallpaper(lightboxImage)}
                    className={`mc-btn px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer font-bold ${
                      currentWallpaperUrl === lightboxImage.imageUrl
                        ? 'mc-btn-green text-white'
                        : 'mc-btn-gold text-[#ffff55] hover:text-white'
                    }`}
                    title="Definir foto como papel de parede de fundo"
                  >
                    <Wallpaper className="w-3.5 h-3.5" />
                    <span>{currentWallpaperUrl === lightboxImage.imageUrl ? '✓ Fundo Ativo' : 'Colocar como Wallpaper'}</span>
                  </button>
                )}
                <button
                  onClick={() => setLightboxImage(null)}
                  className="mc-btn mc-btn-red px-2.5 py-1 text-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative aspect-video w-full mc-slot overflow-hidden bg-black">
              <img
                src={lightboxImage.imageUrl}
                alt={lightboxImage.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            {lightboxImage.description && (
              <p className="mt-3 text-xs sm:text-sm text-[#cfcbd9] bg-[#1a1624] p-3 border border-[#3b344a]">
                {lightboxImage.description}
              </p>
            )}
          </div>
        </div>
      )}

    </section>
  );
};
