import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Tag, 
  Sparkles, 
  Check, 
  AlertCircle,
  Link as LinkIcon,
  Layers,
  Star,
  UploadCloud,
  FileImage,
  User,
  Shield,
  Loader2,
  Trash2,
  Video,
  Scissors,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { Screenshot } from '../types';
import { useAuth } from '../context/AuthContext';
import { compressImageForFirebase } from '../lib/imageCompressor';
import { extractYouTubeId, formatTime } from './PostVideoPlayer';

interface AddScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Screenshot, 'id' | 'createdAt' | 'author'> & { authorName?: string }) => Promise<void>;
  editScreenshot?: Screenshot | null;
  allowPublicScreenshots?: boolean;
  onOpenAdminLogin?: () => void;
}

const PRESET_CATEGORIES = [
  'Biomas',
  'Construções',
  'Shaders & Luz',
  'Crafting',
  'Minérios & Cavernas',
  'Fauna & Criaturas',
  'Multiplayer',
  'Blockframe'
];

export const AddScreenshotModal: React.FC<AddScreenshotModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editScreenshot,
  allowPublicScreenshots = false,
  onOpenAdminLogin
}) => {
  const { user, isAdmin } = useAuth();
  
  // Media Type Selection
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  // Common Post Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState('Biomas');
  const [tagsInput, setTagsInput] = useState('');
  const [featured, setFeatured] = useState(false);

  // Image Specific Fields
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadSuccessName, setUploadSuccessName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Video Specific Fields
  const [videoMode, setVideoMode] = useState<'url' | 'upload'>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState('');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);

  // Video Trimming (Corte de partes indesejadas)
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  // Video Audio Controls (Tirar ou Colocar Som)
  const [isMuted, setIsMuted] = useState<boolean>(true); // Default muted to avoid noisy surprise
  const [defaultVolume, setDefaultVolume] = useState<number>(0.8);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  const canPost = isAdmin || allowPublicScreenshots;

  useEffect(() => {
    if (editScreenshot) {
      setTitle(editScreenshot.title || '');
      setDescription(editScreenshot.description || '');
      setCategory(editScreenshot.category || 'Biomas');
      setTagsInput(editScreenshot.tags ? editScreenshot.tags.join(', ') : '');
      setFeatured(Boolean(editScreenshot.featured));
      setAuthorName(editScreenshot.author || '');

      const isVid = editScreenshot.mediaType === 'video' || Boolean(editScreenshot.videoUrl);
      setMediaType(isVid ? 'video' : 'image');

      if (isVid) {
        setVideoUrl(editScreenshot.videoUrl || editScreenshot.imageUrl || '');
        setVideoThumbnailUrl(editScreenshot.imageUrl !== editScreenshot.videoUrl ? editScreenshot.imageUrl : '');
        setStartTime(editScreenshot.startTime || 0);
        setEndTime(editScreenshot.endTime || 0);
        setIsMuted(editScreenshot.isMuted !== undefined ? editScreenshot.isMuted : true);
        setDefaultVolume(editScreenshot.defaultVolume ?? 0.8);
        setVideoMode('url');
      } else {
        setImageUrl(editScreenshot.imageUrl || '');
        setImageMode('url');
      }
    } else {
      setTitle('');
      setDescription('');
      setImageUrl('');
      setVideoUrl('');
      setVideoThumbnailUrl('');
      setStartTime(0);
      setEndTime(0);
      setVideoDuration(0);
      setCurrentVideoTime(0);
      setIsMuted(true);
      setDefaultVolume(0.8);
      setCategory('Biomas');
      setTagsInput('');
      setFeatured(false);
      setSelectedImageFile(null);
      setSelectedVideoFile(null);
      setUploadSuccessName(null);
      setAuthorName(user?.name || (user?.email ? user.email.split('@')[0] : ''));
      setMediaType('image');
      setImageMode('upload');
      setVideoMode('url');
    }
    setError(null);
  }, [editScreenshot, isOpen, user]);

  if (!isOpen) return null;

  // Handle Image File Selection
  const handleImageFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP ou GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem selecionada ultrapassa o limite de 10MB.');
      return;
    }

    setError(null);
    setSelectedImageFile(file);
    setIsUploadingImage(true);

    try {
      const compressedDataUrl = await compressImageForFirebase(file, 1280, 0.85);
      setImageUrl(compressedDataUrl);
      setUploadSuccessName(file.name);
      setIsUploadingImage(false);
    } catch (err: any) {
      console.error('Image upload error:', err);
      setError(err.message || 'Erro ao processar a imagem.');
      setIsUploadingImage(false);
    }
  };

  // Handle Video File Selection
  const handleVideoFileChange = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Por favor, selecione um arquivo de vídeo válido (.mp4, .webm).');
      return;
    }

    if (file.size > 35 * 1024 * 1024) {
      setError('O vídeo selecionado ultrapassa 35MB. Para vídeos maiores, use link direto ou YouTube.');
      return;
    }

    setError(null);
    setSelectedVideoFile(file);
    setIsProcessingVideo(true);

    try {
      const videoBlobUrl = URL.createObjectURL(file);
      setVideoUrl(videoBlobUrl);
      setUploadSuccessName(file.name);
      setIsProcessingVideo(false);
    } catch (err: any) {
      console.error('Video file error:', err);
      setError('Erro ao carregar o arquivo de vídeo.');
      setIsProcessingVideo(false);
    }
  };

  // Drag & Drop handlers for images
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (mediaType === 'image') {
        handleImageFileChange(e.dataTransfer.files[0]);
      } else {
        handleVideoFileChange(e.dataTransfer.files[0]);
      }
    }
  };

  // Trim Controls
  const handleSetStartTime = () => {
    if (previewVideoRef.current) {
      const time = Math.floor(previewVideoRef.current.currentTime * 10) / 10;
      setStartTime(time);
      if (endTime > 0 && time >= endTime) {
        setEndTime(Math.min(videoDuration, time + 5));
      }
    }
  };

  const handleSetEndTime = () => {
    if (previewVideoRef.current) {
      const time = Math.floor(previewVideoRef.current.currentTime * 10) / 10;
      if (time > startTime) {
        setEndTime(time);
      } else {
        setError('O ponto final deve ser maior que o ponto inicial do corte.');
      }
    }
  };

  const handleResetTrim = () => {
    setStartTime(0);
    setEndTime(videoDuration);
    if (previewVideoRef.current) {
      previewVideoRef.current.currentTime = 0;
    }
  };

  const testTrimPlay = () => {
    if (!previewVideoRef.current) return;
    previewVideoRef.current.currentTime = startTime;
    previewVideoRef.current.play()
      .then(() => setIsPlayingPreview(true))
      .catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canPost) {
      setError('A postagem de conteúdo está restrita a administradores.');
      return;
    }

    if (!title.trim()) {
      setError('Informe um título para o post.');
      return;
    }

    if (mediaType === 'image' && !imageUrl.trim()) {
      setError('Faça o upload de uma foto ou informe uma URL de imagem válida.');
      return;
    }

    if (mediaType === 'video' && !videoUrl.trim()) {
      setError('Informe a URL do vídeo ou selecione um arquivo de vídeo.');
      return;
    }

    if (mediaType === 'video' && endTime > 0 && endTime <= startTime) {
      setError('O tempo final do corte (Trim Out) deve ser maior que o tempo inicial.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      // Determine final imageUrl
      let finalImageUrl = imageUrl.trim();
      if (mediaType === 'video') {
        finalImageUrl = videoThumbnailUrl.trim() || videoUrl.trim();
      }

      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: finalImageUrl,
        mediaType,
        category: category.trim() as any,
        tags,
        featured: isAdmin ? featured : false
      };

      if (mediaType === 'video') {
        payload.videoUrl = videoUrl.trim();
        payload.startTime = Number(startTime) || 0;
        payload.endTime = Number(endTime) || 0;
        payload.isMuted = Boolean(isMuted);
        payload.defaultVolume = Number(defaultVolume) || 0.8;
        payload.duration = Number(videoDuration) || 0;
      }

      if (!isAdmin && authorName.trim()) {
        payload.authorName = authorName.trim();
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ytId = mediaType === 'video' ? extractYouTubeId(videoUrl) : null;
  const effectiveTrimDuration = (endTime > 0 ? endTime : videoDuration) - startTime;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative max-w-2xl w-full mc-panel p-0 text-[#e0dfd5] shadow-2xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#171420] border-b-2 border-[#332c42]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 mc-slot flex items-center justify-center text-[#55ffff]">
              {mediaType === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide mc-text-shadow font-minecraft">
                {editScreenshot 
                  ? (mediaType === 'video' ? 'EDITAR POST DE VÍDEO' : 'EDITAR POST DE FOTO')
                  : 'PUBLICAR NOVO POST (FOTO OU VÍDEO)'}
              </h3>
              <p className="text-[11px] text-[#9e9aa8] font-mono">
                {isAdmin ? (
                  <>Admin: <span className="text-[#55ff55] font-bold">{user?.email}</span></>
                ) : (
                  <>Status: <span className="text-[#55ffff]">Envio Aberto à Comunidade</span></>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 mc-btn mc-btn-red text-xs flex items-center justify-center cursor-pointer p-0"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning if public posting is disabled and not admin */}
        {!canPost ? (
          <div className="p-6 bg-[#1c1827] text-center space-y-4">
            <div className="w-12 h-12 mc-slot mx-auto flex items-center justify-center text-[#ff8888] bg-[#2a1414]">
              <Shield className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white uppercase font-minecraft">
                POSTAGEM EXCLUSIVA PARA ADMINISTRADORES
              </h4>
              <p className="text-xs text-[#b4afc4] max-w-md mx-auto">
                No momento, o envio de posts está configurado como exclusivo para administradores.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button onClick={onClose} className="mc-btn px-4 py-2 text-xs">
                Voltar
              </button>
              {onOpenAdminLogin && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminLogin();
                  }}
                  className="mc-btn mc-btn-diamond px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Fazer Login como Admin</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto bg-[#1c1827]">
            {error && (
              <div className="p-3 bg-[#3d1212] border-2 border-[#822222] text-[#ff8888] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Media Type Selector: Foto vs Video */}
            <div className="p-3 bg-[#13101c] border-2 border-[#2c2538] space-y-2">
              <span className="text-xs font-bold text-[#ffff55] uppercase tracking-wider block">
                1. Escolha o Tipo de Post:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMediaType('image')}
                  className={`p-3 mc-btn flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    mediaType === 'image'
                      ? 'mc-btn-green text-white shadow-md'
                      : 'bg-[#211c2e] hover:bg-[#2b243b] text-[#b4afc4] border-[#372f47]'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">Foto / Screenshot</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaType('video')}
                  className={`p-3 mc-btn flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                    mediaType === 'video'
                      ? 'mc-btn-diamond text-white shadow-md'
                      : 'bg-[#211c2e] hover:bg-[#2b243b] text-[#b4afc4] border-[#372f47]'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase">Vídeo / Clipe (Com Trim e Som)</span>
                </button>
              </div>
            </div>

            {/* Non-admin author nickname input */}
            {!isAdmin && (
              <div>
                <label className="block text-xs font-bold text-[#b4afc4] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#55ffff]" />
                  <span>Seu Nome / Apelido no Luanti</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: CraftMaster_BR"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-sm text-white placeholder-[#686278] focus:outline-none"
                />
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-[#b4afc4] uppercase tracking-wider mb-1">
                Título do Post *
              </label>
              <input
                type="text"
                required
                placeholder={mediaType === 'video' ? 'Ex: Gameplay testando novos Shaders e Bioma de Neve' : 'Ex: Castelo Medieval no Bioma Taiga'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-sm text-white placeholder-[#686278] focus:outline-none"
              />
            </div>

            {/* --- MEDIA SPECIFIC SECTION --- */}

            {/* 1. IMAGE MODE */}
            {mediaType === 'image' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#b4afc4] uppercase tracking-wider flex items-center gap-1.5">
                    <FileImage className="w-3.5 h-3.5 text-[#55ff55]" />
                    <span>Imagem da Captura *</span>
                  </label>

                  <div className="flex items-center gap-1 bg-[#120f1a] p-1 border border-[#3b344a]">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-all ${
                        imageMode === 'upload' ? 'mc-btn mc-btn-green text-white' : 'text-[#8e8999] hover:text-white'
                      }`}
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-all ${
                        imageMode === 'url' ? 'mc-btn mc-btn-diamond text-white' : 'text-[#8e8999] hover:text-white'
                      }`}
                    >
                      URL Direta
                    </button>
                  </div>
                </div>

                {imageMode === 'upload' && (
                  <div className="space-y-2">
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 mc-slot flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                        isDragging ? 'border-[#55ffff] bg-[#1a2b38]' : 'hover:border-[#55ff55] bg-[#120f1a]'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleImageFileChange(e.target.files[0]);
                          }
                        }}
                      />

                      {isUploadingImage ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <Loader2 className="w-7 h-7 text-[#55ffff] animate-spin" />
                          <span className="text-xs font-bold text-white uppercase">Processando foto...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 mc-slot flex items-center justify-center text-[#55ff55]">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-white uppercase">
                              Clique para escolher ou arraste a foto aqui
                            </p>
                            <p className="text-[10px] text-[#8e8999] font-mono">
                              PNG, JPG, WebP ou GIF (Máx 10MB)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {uploadSuccessName && (
                      <div className="flex items-center justify-between p-2 bg-[#122812] border border-[#2b742b] text-[11px] text-[#55ff55]">
                        <span className="font-mono truncate">✓ Foto carregada: {uploadSuccessName}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageUrl('');
                            setSelectedImageFile(null);
                            setUploadSuccessName(null);
                          }}
                          className="text-[#ff8888] hover:underline flex items-center gap-1 font-bold"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remover</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {imageMode === 'url' && (
                  <input
                    type="url"
                    placeholder="https://exemplo.com/minha-foto.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs font-mono text-white placeholder-[#686278] focus:outline-none"
                  />
                )}

                {imageUrl && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] uppercase font-bold text-[#9e9aa8]">Pré-visualização da Foto</span>
                    <div className="relative aspect-video w-full mc-slot overflow-hidden bg-black flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={() => setError('Não foi possível carregar a imagem da URL informada.')}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. VIDEO MODE: TRIM & SOUND CONTROLS */}
            {mediaType === 'video' && (
              <div className="p-4 bg-[#14101e] border-2 border-[#3b2d52] space-y-4">
                
                {/* Video URL or File */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#55ffff] uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-[#55ffff]" />
                      <span>Vídeo do Post *</span>
                    </label>

                    <div className="flex items-center gap-1 bg-[#0f0c17] p-1 border border-[#3b344a]">
                      <button
                        type="button"
                        onClick={() => setVideoMode('url')}
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-all ${
                          videoMode === 'url' ? 'mc-btn mc-btn-diamond text-white' : 'text-[#8e8999] hover:text-white'
                        }`}
                      >
                        URL / YouTube / Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode('upload')}
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-all ${
                          videoMode === 'upload' ? 'mc-btn mc-btn-green text-white' : 'text-[#8e8999] hover:text-white'
                        }`}
                      >
                        Arquivo Local
                      </button>
                    </div>
                  </div>

                  {videoMode === 'url' ? (
                    <div>
                      <input
                        type="text"
                        placeholder="Cole link direto .mp4, .webm ou link do YouTube..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0e0c17] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs font-mono text-white placeholder-[#686278] focus:outline-none"
                      />
                      <p className="text-[10px] text-[#8e8999] mt-1 font-mono">
                        Exemplo: Link do YouTube (ex: youtube.com/watch?v=...) ou link de arquivo .mp4
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div
                        onClick={() => videoFileInputRef.current?.click()}
                        className="p-5 mc-slot bg-[#0e0c17] border-dashed border-[#55ffff]/40 hover:border-[#55ffff] flex flex-col items-center justify-center cursor-pointer text-center"
                      >
                        <input
                          ref={videoFileInputRef}
                          type="file"
                          accept="video/mp4,video/webm"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleVideoFileChange(e.target.files[0]);
                            }
                          }}
                        />
                        <Video className="w-8 h-8 text-[#55ffff] mb-1" />
                        <span className="text-xs font-bold text-white uppercase">Clique para selecionar vídeo</span>
                        <span className="text-[10px] text-[#8e8999]">MP4 ou WebM (Até 35MB)</span>
                      </div>
                      {uploadSuccessName && (
                        <div className="mt-2 p-2 bg-[#122812] border border-[#2b742b] text-[11px] text-[#55ff55] flex justify-between items-center">
                          <span>✓ Vídeo: {uploadSuccessName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setVideoUrl('');
                              setSelectedVideoFile(null);
                              setUploadSuccessName(null);
                            }}
                            className="text-[#ff8888] hover:underline"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Video Interactive Player with Trim & Audio Controls */}
                {videoUrl && (
                  <div className="space-y-3 pt-2 border-t border-[#2e263d]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#ffff55] uppercase flex items-center gap-1.5">
                        <Scissors className="w-3.5 h-3.5 text-[#ffff55]" />
                        <span>FERRAMENTA DE CORTE (TRIM) & SOM</span>
                      </span>
                      <span className="text-[10px] text-[#55ffff] font-mono">
                        Evite partes indesejadas cortando o início e o fim
                      </span>
                    </div>

                    {/* Preview Video Element */}
                    {!ytId ? (
                      <div className="relative aspect-video w-full mc-slot overflow-hidden bg-black flex items-center justify-center">
                        <video
                          ref={previewVideoRef}
                          src={videoUrl}
                          playsInline
                          muted={isMuted}
                          onLoadedMetadata={() => {
                            if (previewVideoRef.current) {
                              const dur = previewVideoRef.current.duration;
                              setVideoDuration(dur);
                              if (endTime === 0 || endTime > dur) {
                                setEndTime(dur);
                              }
                            }
                          }}
                          onTimeUpdate={() => {
                            if (previewVideoRef.current) {
                              const cur = previewVideoRef.current.currentTime;
                              setCurrentVideoTime(cur);
                              // Stop when reaching endTime during preview
                              if (endTime > 0 && cur >= endTime) {
                                previewVideoRef.current.pause();
                                setIsPlayingPreview(false);
                              }
                            }
                          }}
                          onEnded={() => setIsPlayingPreview(false)}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video w-full mc-slot overflow-hidden bg-black">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${ytId}?start=${Math.floor(startTime)}&end=${endTime > 0 ? Math.floor(endTime) : ''}&mute=${isMuted ? 1 : 0}`}
                          title="YouTube Preview"
                          className="w-full h-full border-0"
                        />
                      </div>
                    )}

                    {/* Trim Markers & Visual Timeline Bar */}
                    <div className="p-3 bg-[#0e0c17] border border-[#2b2438] space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#8e8999]">
                          Posição Atual: <strong className="text-white">{formatTime(currentVideoTime)}</strong>
                        </span>
                        <span className="text-[#55ffff]">
                          Duração Cortada: <strong>{effectiveTrimDuration > 0 ? `${effectiveTrimDuration.toFixed(1)}s` : '0s'}</strong>
                        </span>
                        <span className="text-[#8e8999]">
                          Total: <strong className="text-white">{formatTime(videoDuration)}</strong>
                        </span>
                      </div>

                      {/* Visual Timeline Bar */}
                      {videoDuration > 0 && (
                        <div className="relative w-full h-4 bg-[#1f1b29] border border-[#3b344a] overflow-hidden">
                          {/* Active Trim Window */}
                          <div 
                            className="absolute top-0 bottom-0 bg-[#2b742b] border-x-2 border-[#55ff55]"
                            style={{
                              left: `${(startTime / videoDuration) * 100}%`,
                              width: `${(Math.max(0, (endTime || videoDuration) - startTime) / videoDuration) * 100}%`
                            }}
                          />
                          {/* Current playback cursor */}
                          <div 
                            className="absolute top-0 bottom-0 w-1 bg-[#ffff55] z-10"
                            style={{
                              left: `${(currentVideoTime / videoDuration) * 100}%`
                            }}
                          />
                        </div>
                      )}

                      {/* Action buttons for Trim In & Trim Out */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleSetStartTime}
                          className="mc-btn mc-btn-diamond py-1.5 px-2 text-[11px] font-bold uppercase flex items-center justify-center gap-1"
                          title="Define o início do vídeo no segundo atual"
                        >
                          <Scissors className="w-3 h-3" />
                          <span>Marcar Início ({formatTime(currentVideoTime)})</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSetEndTime}
                          className="mc-btn mc-btn-green py-1.5 px-2 text-[11px] font-bold uppercase flex items-center justify-center gap-1"
                          title="Define o fim do vídeo no segundo atual"
                        >
                          <Scissors className="w-3 h-3" />
                          <span>Marcar Fim ({formatTime(currentVideoTime)})</span>
                        </button>

                        <button
                          type="button"
                          onClick={testTrimPlay}
                          className="mc-btn py-1.5 px-2 text-[11px] font-bold uppercase flex items-center justify-center gap-1 text-[#ffff55] hover:text-white"
                          title="Reproduzir o trecho cortado"
                        >
                          <Play className="w-3 h-3 fill-[#ffff55]" />
                          <span>Testar Corte</span>
                        </button>
                      </div>

                      {/* Manual Time Inputs */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] font-bold text-[#b4afc4] uppercase mb-0.5">
                            Trim In (Início em Segundos):
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={startTime}
                            onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full px-2 py-1 bg-[#171422] border border-[#3b344a] text-xs font-mono text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#b4afc4] uppercase mb-0.5">
                            Trim Out (Fim em Segundos):
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={endTime}
                            onChange={(e) => setEndTime(Math.max(0, parseFloat(e.target.value) || 0))}
                            className="w-full px-2 py-1 bg-[#171422] border border-[#3b344a] text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* AUDIO / SOUND CONTROLS (Tirar ou Colocar Som) */}
                    <div className="p-3 bg-[#0e0c17] border border-[#2b2438] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#ffff55] uppercase flex items-center gap-1.5">
                          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#ff8888]" /> : <Volume2 className="w-3.5 h-3.5 text-[#55ff55]" />}
                          <span>CONTROLE DE SOM DO POST</span>
                        </span>
                        <span className="text-[10px] text-[#8e8999]">
                          {isMuted ? 'Áudio desativado (vídeo silencioso)' : 'Áudio ativado para os visitantes'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Option 1: Tirar Som (Silencioso) */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsMuted(true);
                            if (previewVideoRef.current) previewVideoRef.current.muted = true;
                          }}
                          className={`p-2.5 mc-btn flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isMuted
                              ? 'mc-btn-red text-white border-[#ff8888]'
                              : 'bg-[#1a1624] text-[#8e8999] hover:text-white border-[#2e263d]'
                          }`}
                        >
                          <VolumeX className="w-4 h-4 text-[#ff8888]" />
                          <div className="text-left">
                            <div className="text-xs font-bold uppercase">Tirar Som (Silencioso)</div>
                            <div className="text-[9px] opacity-80 font-mono">Sem ruídos ou áudios indesejados</div>
                          </div>
                        </button>

                        {/* Option 2: Colocar / Manter Som */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsMuted(false);
                            if (previewVideoRef.current) {
                              previewVideoRef.current.muted = false;
                              previewVideoRef.current.volume = defaultVolume;
                            }
                          }}
                          className={`p-2.5 mc-btn flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            !isMuted
                              ? 'mc-btn-green text-white border-[#55ff55]'
                              : 'bg-[#1a1624] text-[#8e8999] hover:text-white border-[#2e263d]'
                          }`}
                        >
                          <Volume2 className="w-4 h-4 text-[#55ff55]" />
                          <div className="text-left">
                            <div className="text-xs font-bold uppercase">Com Som (Áudio Ativo)</div>
                            <div className="text-[9px] opacity-80 font-mono">Mantém o som do jogo / clipe</div>
                          </div>
                        </button>
                      </div>

                      {!isMuted && (
                        <div className="flex items-center gap-3 pt-1 px-1">
                          <span className="text-[10px] text-[#b4afc4] uppercase font-bold">Volume Padrão:</span>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={defaultVolume}
                            onChange={(e) => {
                              const v = parseFloat(e.target.value);
                              setDefaultVolume(v);
                              if (previewVideoRef.current) previewVideoRef.current.volume = v;
                            }}
                            className="flex-1 h-1.5 accent-[#55ffff] cursor-pointer"
                          />
                          <span className="text-xs font-mono text-[#55ffff] font-bold">
                            {Math.round(defaultVolume * 100)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Optional Custom Cover / Thumbnail */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#b4afc4] uppercase mb-1">
                        Capa / Thumbnail do Vídeo (Opcional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/capa-do-video.jpg (Se deixar em branco, usa capa padrão)"
                        value={videoThumbnailUrl}
                        onChange={(e) => setVideoThumbnailUrl(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#0e0c17] border border-[#3b344a] text-xs font-mono text-white placeholder-[#686278] focus:outline-none"
                      />
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* Category Selection */}
            <div>
              <label className="block text-xs font-bold text-[#b4afc4] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#ffaa00]" />
                <span>Categoria</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {PRESET_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-2 py-1.5 text-[11px] font-bold uppercase transition-all cursor-pointer text-center ${
                      category === cat
                        ? 'mc-btn mc-btn-diamond text-white'
                        : 'mc-btn bg-[#252033] hover:bg-[#332c45] text-[#b4afc4] border-[#3b344a]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-[#b4afc4] uppercase tracking-wider mb-1">
                Descrição do Post
              </label>
              <textarea
                rows={2}
                placeholder="Descreva detalhes como bioma, shaders, mods, dicas ou o que está acontecendo no clipe..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white placeholder-[#686278] focus:outline-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-[#b4afc4] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#55ff55]" />
                <span>Tags (Separadas por vírgula)</span>
              </label>
              <input
                type="text"
                placeholder="Blockframe, Shaders, Gameplay, Construção, Taiga, Luanti"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white placeholder-[#686278] focus:outline-none"
              />
            </div>

            {/* Featured checkbox (Admin Only) */}
            {isAdmin && (
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none bg-[#13101c] p-2 border border-[#2e263d]">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#ffff55] rounded-none cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#ffff55] uppercase">
                    <Star className="w-3.5 h-3.5 fill-[#ffff55]" />
                    <span>Fixar como Destaque no Topo da Página Inicial</span>
                  </div>
                </label>
              </div>
            )}

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#2b2438]">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="mc-btn px-4 py-2 text-xs text-[#cfcbd9] cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mc-btn mc-btn-green px-5 py-2 text-xs flex items-center gap-2 cursor-pointer font-bold disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>SALVANDO...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{editScreenshot ? 'ATUALIZAR POST' : 'PUBLICAR POST'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
