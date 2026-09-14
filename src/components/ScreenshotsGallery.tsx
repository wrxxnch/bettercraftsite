import React, { useState, useMemo } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Maximize2, 
  X, 
  Star,
  Search,
  RotateCcw,
  Wallpaper,
  Video,
  Scissors,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';
import { Screenshot } from '../types';
import { useAuth } from '../context/AuthContext';
import { PostVideoPlayer, formatTime } from './PostVideoPlayer';

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
  const { isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMediaType, setSelectedMediaType] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lightboxItem, setLightboxItem] = useState<Screenshot | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canPost = isAdmin || allowPublicScreenshots;

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(screenshots.map(s => s.category).filter(Boolean)))];
  }, [screenshots]);

  const filteredScreenshots = useMemo(() => {
    return screenshots.filter(s => {
      // Media Type filter (All, Images only, Videos only)
      const isVideo = s.mediaType === 'video' || Boolean(s.videoUrl);
      if (selectedMediaType === 'video' && !isVideo) return false;
      if (selectedMediaType === 'image' && isVideo) return false;

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
  }, [screenshots, selectedCategory, selectedMediaType, searchQuery]);

  const handleDelete = async (screenshot: Screenshot) => {
    const isVid = screenshot.mediaType === 'video' || Boolean(screenshot.videoUrl);
    if (window.confirm(`Tem certeza que deseja excluir o post "${screenshot.title}"?`)) {
      setDeletingId(screenshot.id);
      try {
        await onDeleteScreenshot(screenshot.id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const videoCount = screenshots.filter(s => s.mediaType === 'video' || Boolean(s.videoUrl)).length;
  const imageCount = screenshots.length - videoCount;

  return (
    <section id="galeria" className="py-16 sm:py-20 bg-[#14111c] border-b-4 border-[#241f30] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mc-slot text-xs font-bold text-[#55ffff] mb-2 uppercase">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>GALERIA & FEED DA COMUNIDADE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide mc-title-shadow uppercase font-minecraft">
              POSTS, FOTOS & VÍDEOS DO BETTERCRAFT
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#b4afc4]">
              Vídeos com cortes precisos (Trim) e controle de som, além de paisagens e screenshots compartilhadas pela comunidade.
            </p>
          </div>

          {/* Action Button: Visible for Admins OR if Public Posting is Enabled */}
          {canPost && (
            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={onOpenAddScreenshot}
                id="gallery-btn-add-screenshot"
                className="mc-btn mc-btn-green px-4 py-2.5 text-xs flex items-center gap-2 cursor-pointer font-bold"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isAdmin ? 'PUBLICAR (FOTO OU VÍDEO)' : 'ENVIAR POST (FOTO / VÍDEO)'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Search, Media Type & Category Filter Controls */}
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
                placeholder="Buscar por título, shaders, vídeo, autor ou tags..."
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

            {/* Media Type Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#0f0c17] p-1 border border-[#30283d] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedMediaType('all')}
                className={`px-2.5 py-1 text-xs font-bold uppercase transition-all cursor-pointer ${
                  selectedMediaType === 'all'
                    ? 'mc-btn mc-btn-diamond text-white'
                    : 'text-[#8e8999] hover:text-white'
                }`}
              >
                Todos ({screenshots.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedMediaType('image')}
                className={`px-2.5 py-1 text-xs font-bold uppercase flex items-center gap-1 transition-all cursor-pointer ${
                  selectedMediaType === 'image'
                    ? 'mc-btn mc-btn-green text-white'
                    : 'text-[#8e8999] hover:text-white'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>Fotos ({imageCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMediaType('video')}
                className={`px-2.5 py-1 text-xs font-bold uppercase flex items-center gap-1 transition-all cursor-pointer ${
                  selectedMediaType === 'video'
                    ? 'mc-btn mc-btn-gold text-white'
                    : 'text-[#8e8999] hover:text-white'
                }`}
              >
                <Video className="w-3 h-3" />
                <span>Vídeos ({videoCount})</span>
              </button>
            </div>

            {/* Results Counter / Filter Stats */}
            <div className="flex items-center gap-2 text-xs text-[#8e8999] font-mono px-1">
              <span className="text-[#55ffff] font-bold">{filteredScreenshots.length}</span>
              <span>{filteredScreenshots.length === 1 ? 'post' : 'posts'}</span>
              {(searchQuery || selectedCategory !== 'all' || selectedMediaType !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedMediaType('all');
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
                {cat === 'all' ? '★ Todas as Categorias' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid (Photos & Videos Mixed Seamlessly) */}
        {filteredScreenshots.length === 0 ? (
          <div className="mc-panel p-12 text-center text-[#9e9aa8] space-y-4 bg-[#171322] border-2 border-[#332c42]">
            <div className="w-16 h-16 mc-slot mx-auto flex items-center justify-center text-[#55ffff]">
              {searchQuery ? <Search className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase font-minecraft">
                {searchQuery ? 'NENHUM POST ENCONTRADO' : 'GALERIA VAZIA'}
              </h3>
              <p className="text-xs text-[#b4afc4] mt-1 max-w-md mx-auto">
                {searchQuery 
                  ? `Nenhum post corresponde à pesquisa "${searchQuery}". Tente outros termos ou limpe o filtro.`
                  : 'Nenhum post publicado ainda. Publique a primeira foto ou vídeo no botão acima!'
                }
              </p>
            </div>
            {canPost && (
              <button
                onClick={onOpenAddScreenshot}
                className="mc-btn mc-btn-green px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer font-bold mx-auto"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>PUBLICAR PRIMEIRO POST</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScreenshots.map((item) => {
              const isVideo = item.mediaType === 'video' || Boolean(item.videoUrl);
              const videoSrc = item.videoUrl || item.imageUrl;

              return (
                <div
                  key={item.id}
                  className="mc-panel p-3 flex flex-col justify-between group hover:border-[#55ffff] transition-colors"
                >
                  <div>
                    {/* Media Container (Video Player or Image with Badges) */}
                    <div className="relative aspect-video w-full mc-slot overflow-hidden bg-black mb-3">
                      {isVideo ? (
                        <PostVideoPlayer
                          videoUrl={videoSrc}
                          posterUrl={item.imageUrl !== videoSrc ? item.imageUrl : undefined}
                          title={item.title}
                          startTime={item.startTime || 0}
                          endTime={item.endTime || 0}
                          isMutedDefault={item.isMuted !== undefined ? item.isMuted : true}
                          defaultVolume={item.defaultVolume ?? 0.8}
                          isCompact={true}
                          showAdminDetails={isAdmin}
                          onExpand={() => setLightboxItem(item)}
                        />
                      ) : (
                        <>
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />

                          {/* View Fullscreen overlay button for images */}
                          <button
                            onClick={() => setLightboxItem(item)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            title="Ver em tela cheia"
                          >
                            <div className="mc-btn px-3 py-1.5 text-xs flex items-center gap-1.5 bg-[#221e2e]">
                              <Maximize2 className="w-3.5 h-3.5" />
                              <span>AMPLIAR</span>
                            </div>
                          </button>
                        </>
                      )}

                      {/* Video vs Photo Badge */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 z-20 pointer-events-none">
                        <div className={`px-2 py-0.5 mc-slot text-[10px] font-bold uppercase flex items-center gap-1 ${
                          isVideo ? 'bg-[#351a4f]/90 text-[#ff55ff] border border-[#ff55ff]' : 'bg-black/80 text-[#55ffff]'
                        }`}>
                          {isVideo ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                          <span>{isVideo ? 'VÍDEO' : item.category}</span>
                        </div>
                      </div>

                      {/* Featured Star Badge */}
                      {item.featured && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 mc-slot bg-[#3d2a00] text-[#ffff55] text-[10px] font-bold uppercase flex items-center gap-1 z-20 pointer-events-none">
                          <Star className="w-3 h-3 fill-[#ffff55]" />
                          <span>Destaque</span>
                        </div>
                      )}

                      {/* Active Wallpaper Badge */}
                      {currentWallpaperUrl === item.imageUrl && !isVideo && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 mc-slot bg-[#122b16]/95 text-[#55ff55] border border-[#55ff55] text-[10px] font-bold uppercase flex items-center gap-1 shadow-md z-10 pointer-events-none">
                          <Wallpaper className="w-3 h-3 text-[#55ff55]" />
                          <span>Fundo Ativo</span>
                        </div>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-[#55ffff] transition-colors line-clamp-1 mc-text-shadow">
                        {item.title}
                      </h3>
                      {isVideo && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#201530] text-[#ff88ff] border border-[#5b2b80] flex-shrink-0">
                          {isAdmin && item.startTime ? `Trim: ${formatTime(item.startTime)}` : 'Clipe'}
                        </span>
                      )}
                    </div>

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
                      {/* Set as Wallpaper (for Photos) */}
                      {!isVideo && isAdmin && onSetAsWallpaper && (
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
                          title="Definir como wallpaper de fundo"
                        >
                          <Wallpaper className="w-3 h-3" />
                          <span>{currentWallpaperUrl === item.imageUrl ? 'Fundo Ativo' : 'Wallpaper'}</span>
                        </button>
                      )}

                      {/* Expand / Watch Modal Button */}
                      <button
                        type="button"
                        onClick={() => setLightboxItem(item)}
                        className="mc-btn px-2 py-1 text-[10px] flex items-center gap-1 cursor-pointer hover:text-[#55ffff]"
                        title={isVideo ? 'Assistir vídeo ampliado com controles' : 'Ampliar foto'}
                      >
                        <Maximize2 className="w-3 h-3" />
                        <span>{isVideo ? 'Assistir' : 'Ampliar'}</span>
                      </button>

                      {/* Admin Edit Button */}
                      {isAdmin && (
                        <button
                          onClick={() => onEditScreenshot(item)}
                          className="mc-btn mc-btn-diamond px-2 py-1 text-[10px] flex items-center gap-1 cursor-pointer"
                          title="Editar post"
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
                          title="Excluir post"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{deletingId === item.id ? '...' : 'Excluir'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Fullscreen Lightbox Modal (For both Photos and Videos) */}
      {lightboxItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div 
            className="relative max-w-5xl w-full mc-panel p-4 bg-[#14111c]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-[#332c42] flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white mc-text-shadow">
                    {lightboxItem.title}
                  </h3>
                  {(lightboxItem.mediaType === 'video' || lightboxItem.videoUrl) && (
                    <span className="px-2 py-0.5 bg-[#3c155e] text-[#ff88ff] border border-[#9b3bcc] text-[10px] font-bold uppercase">
                      Vídeo
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#55ffff]">
                  Categoria: {lightboxItem.category} • Autor: {lightboxItem.author}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Admin Direct Set Wallpaper inside Lightbox Modal (images only) */}
                {!(lightboxItem.mediaType === 'video' || lightboxItem.videoUrl) && isAdmin && onSetAsWallpaper && (
                  <button
                    type="button"
                    onClick={() => onSetAsWallpaper(lightboxItem)}
                    className={`mc-btn px-3 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer font-bold ${
                      currentWallpaperUrl === lightboxItem.imageUrl
                        ? 'mc-btn-green text-white'
                        : 'mc-btn-gold text-[#ffff55] hover:text-white'
                    }`}
                  >
                    <Wallpaper className="w-3.5 h-3.5" />
                    <span>{currentWallpaperUrl === lightboxItem.imageUrl ? '✓ Fundo Ativo' : 'Colocar como Wallpaper'}</span>
                  </button>
                )}
                <button
                  onClick={() => setLightboxItem(null)}
                  className="mc-btn mc-btn-red px-2.5 py-1 text-xs cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Display in Lightbox */}
            <div className="relative aspect-video w-full mc-slot overflow-hidden bg-black">
              {lightboxItem.mediaType === 'video' || lightboxItem.videoUrl ? (
                <PostVideoPlayer
                  videoUrl={lightboxItem.videoUrl || lightboxItem.imageUrl}
                  posterUrl={lightboxItem.imageUrl !== (lightboxItem.videoUrl || lightboxItem.imageUrl) ? lightboxItem.imageUrl : undefined}
                  title={lightboxItem.title}
                  startTime={lightboxItem.startTime || 0}
                  endTime={lightboxItem.endTime || 0}
                  isMutedDefault={lightboxItem.isMuted !== undefined ? lightboxItem.isMuted : false}
                  defaultVolume={lightboxItem.defaultVolume ?? 0.8}
                  autoPlayInline={true}
                  isCompact={false}
                  showAdminDetails={isAdmin}
                />
              ) : (
                <img
                  src={lightboxItem.imageUrl}
                  alt={lightboxItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Description & Tags in Lightbox */}
            {lightboxItem.description && (
              <p className="mt-3 text-xs sm:text-sm text-[#cfcbd9] bg-[#1a1624] p-3 border border-[#3b344a]">
                {lightboxItem.description}
              </p>
            )}

            {lightboxItem.tags && lightboxItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {lightboxItem.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[#100d17] border border-[#2f293b] text-xs text-[#55ffff] font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </section>
  );
};
