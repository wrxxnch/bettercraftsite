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
  Trash2
} from 'lucide-react';
import { Screenshot, GameInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { compressImageForFirebase } from '../lib/imageCompressor';

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
  
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState('Biomas');
  const [tagsInput, setTagsInput] = useState('');
  const [featured, setFeatured] = useState(false);
  
  // Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadSuccessName, setUploadSuccessName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canPost = isAdmin || allowPublicScreenshots;

  useEffect(() => {
    if (editScreenshot) {
      setTitle(editScreenshot.title || '');
      setDescription(editScreenshot.description || '');
      setImageUrl(editScreenshot.imageUrl || '');
      setCategory(editScreenshot.category || 'Biomas');
      setTagsInput(editScreenshot.tags ? editScreenshot.tags.join(', ') : '');
      setFeatured(Boolean(editScreenshot.featured));
      setAuthorName(editScreenshot.author || '');
      setMode('url');
    } else {
      setTitle('');
      setDescription('');
      setImageUrl('');
      setCategory('Biomas');
      setTagsInput('');
      setFeatured(false);
      setSelectedFile(null);
      setUploadSuccessName(null);
      setAuthorName(user?.name || (user?.email ? user.email.split('@')[0] : ''));
      setMode('upload');
    }
    setError(null);
  }, [editScreenshot, isOpen, user]);

  if (!isOpen) return null;

  // Process File Selection
  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP ou GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem selecionada ultrapassa o limite de 10MB.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setIsUploadingFile(true);

    try {
      // Compress to high-quality lightweight WebP for Firestore hosting
      const compressedDataUrl = await compressImageForFirebase(file, 1280, 0.85);
      setImageUrl(compressedDataUrl);
      setUploadSuccessName(file.name);
      setIsUploadingFile(false);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Erro ao processar a imagem.');
      setIsUploadingFile(false);
    }
  };

  // Drag & Drop handlers
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
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canPost) {
      setError('A postagem de fotos está restrita a administradores.');
      return;
    }

    if (!title.trim()) {
      setError('Informe um título para a captura.');
      return;
    }

    if (!imageUrl.trim()) {
      setError('Faça o upload de uma foto ou informe uma URL de imagem válida.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        category: category.trim() as any,
        tags,
        featured: isAdmin ? featured : false
      };

      if (!isAdmin && authorName.trim()) {
        payload.authorName = authorName.trim();
      }

      await onSave(payload);

      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar captura de tela.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative max-w-xl w-full mc-panel p-0 text-[#e0dfd5] shadow-2xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Minecraft Style */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#171420] border-b-2 border-[#332c42]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 mc-slot flex items-center justify-center text-[#55ffff]">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide mc-text-shadow font-minecraft">
                {editScreenshot ? 'EDITAR CAPTURA DE TELA' : 'PUBLICAR NOVA FOTO / CAPTURA'}
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
                No momento, o envio de fotos está configurado como exclusivo para administradores. 
                Se você é um administrador, faça o login abaixo para publicar.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="mc-btn px-4 py-2 text-xs"
              >
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
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto bg-[#1c1827]">
            {error && (
              <div className="p-3 bg-[#3d1212] border-2 border-[#822222] text-[#ff8888] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

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
                Título da Captura *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Castelo Medieval no Bioma de Taiga com Shaders"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-sm text-white placeholder-[#686278] focus:outline-none"
              />
            </div>

            {/* Upload Method Switch */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#b4afc4] uppercase tracking-wider flex items-center gap-1.5">
                  <FileImage className="w-3.5 h-3.5 text-[#55ff55]" />
                  <span>Foto da Captura *</span>
                </label>

                {/* Switch upload vs url */}
                <div className="flex items-center gap-1 bg-[#120f1a] p-1 border border-[#3b344a]">
                  <button
                    type="button"
                    onClick={() => setMode('upload')}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-all ${
                      mode === 'upload' ? 'mc-btn mc-btn-green text-white' : 'text-[#8e8999] hover:text-white'
                    }`}
                  >
                    Fazer Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-all ${
                      mode === 'url' ? 'mc-btn mc-btn-diamond text-white' : 'text-[#8e8999] hover:text-white'
                    }`}
                  >
                    URL Direta
                  </button>
                </div>
              </div>

              {/* Upload Mode: Drag and Drop & File Picker */}
              {mode === 'upload' && (
                <div className="space-y-2">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-6 mc-slot flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                      isDragging 
                        ? 'border-[#55ffff] bg-[#1a2b38]' 
                        : 'hover:border-[#55ff55] bg-[#120f1a]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                    />

                    {isUploadingFile ? (
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
                            Suporta PNG, JPG, WebP ou GIF (Máx 10MB)
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
                          setSelectedFile(null);
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

              {/* URL Mode */}
              {mode === 'url' && (
                <div>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/minha-foto.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs font-mono text-white placeholder-[#686278] focus:outline-none"
                  />
                </div>
              )}

              {/* Image Preview */}
              {imageUrl && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] uppercase font-bold text-[#9e9aa8]">Pré-visualização</span>
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
                Descrição Detalhada
              </label>
              <textarea
                rows={2}
                placeholder="Descreva detalhes como bioma, shaders, iluminação, semente do mapa ou mod Blockframe utilizado..."
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
                placeholder="Blockframe, Shaders, Biomas, Taiga, Construções, Luanti"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white placeholder-[#686278] focus:outline-none"
              />
            </div>

            {/* Featured checkbox (Admin Only) */}
            {isAdmin && (
              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none bg-[#120f1a] p-2.5 border-2 border-[#3b344a] hover:border-[#ffaa00]">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#ffaa00] rounded cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase">
                    <Star className={`w-3.5 h-3.5 ${featured ? 'text-[#ffaa00] fill-[#ffaa00]' : 'text-slate-400'}`} />
                    <span>Destacar na Página Inicial (Exclusivo Admin)</span>
                  </div>
                </label>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#332c42]">
              <button
                type="button"
                onClick={onClose}
                className="mc-btn px-4 py-2 text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingFile}
                className="mc-btn mc-btn-green px-5 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Publicando...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{editScreenshot ? 'Atualizar Post' : 'Publicar Captura'}</span>
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
