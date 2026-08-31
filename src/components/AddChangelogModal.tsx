import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tag, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  FileText,
  BookOpen
} from 'lucide-react';
import { ChangelogRelease, ChangelogItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface AddChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ChangelogRelease, 'id' | 'date' | 'author'>) => Promise<void>;
  editRelease?: ChangelogRelease | null;
}

export const AddChangelogModal: React.FC<AddChangelogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editRelease
}) => {
  const { user } = useAuth();
  const [version, setVersion] = useState('v1.4.3');
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('Lançamento Oficial');
  const [description, setDescription] = useState('');
  const [highlightsInput, setHighlightsInput] = useState('');
  const [changes, setChanges] = useState<ChangelogItem[]>([
    { type: 'added', text: 'Adicionados novos biomas e geração de relevo aprimorada.' },
    { type: 'fixed', text: 'Correção de iluminação e colisão nos biomas de caverna.' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editRelease) {
      setVersion(editRelease.version || '');
      setTitle(editRelease.title || '');
      setTag(editRelease.tag || 'Lançamento');
      setDescription(editRelease.description || '');
      setHighlightsInput(editRelease.highlights ? editRelease.highlights.join('\n') : '');
      setChanges(editRelease.changes && editRelease.changes.length > 0 ? editRelease.changes : [
        { type: 'added', text: '' }
      ]);
    } else {
      setVersion('v1.4.3');
      setTitle('');
      setTag('Lançamento');
      setDescription('');
      setHighlightsInput('');
      setChanges([
        { type: 'added', text: 'Adicionados novos biomas e geração de relevo aprimorada.' },
        { type: 'fixed', text: 'Correção de iluminação e colisão nos biomas de caverna.' }
      ]);
    }
  }, [editRelease, isOpen]);

  if (!isOpen) return null;

  const handleAddChangeItem = () => {
    setChanges([...changes, { type: 'added', text: '' }]);
  };

  const handleRemoveChangeItem = (index: number) => {
    setChanges(changes.filter((_, i) => i !== index));
  };

  const handleUpdateChangeItem = (index: number, field: 'type' | 'text', val: string) => {
    const updated = [...changes];
    updated[index] = { ...updated[index], [field]: val };
    setChanges(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !title.trim()) {
      setError('Versão e título são campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const highlights = highlightsInput
        .split('\n')
        .map(h => h.trim())
        .filter(h => h.length > 0);

      const validChanges = changes.filter(c => c.text.trim().length > 0);

      await onSave({
        version: version.trim(),
        title: title.trim(),
        tag: tag.trim(),
        description: description.trim(),
        highlights,
        changes: validChanges
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao publicar nota de atualização.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative max-w-2xl w-full mc-panel p-0 text-[#e0dfd5] shadow-2xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#171420] border-b-2 border-[#332c42]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 mc-slot flex items-center justify-center text-[#ffaa00]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide mc-text-shadow">
                {editRelease ? 'EDITAR NOTA DE ATUALIZAÇÃO' : 'PUBLICAR NOVA VERSÃO (CHANGELOG)'}
              </h3>
              <p className="text-[11px] text-[#9e9aa8] font-mono">
                Autor: <span className="text-[#55ff55]">{user?.email}</span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[78vh] overflow-y-auto bg-[#1c1827]">
          {error && (
            <div className="p-3 bg-[#3d1212] border-2 border-[#822222] text-[#ff8888] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Version, Title & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#b4afc4] uppercase tracking-wider mb-1">
                Versão *
              </label>
              <input
                type="text"
                required
                placeholder="v1.4.3"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-sm font-mono text-[#55ffff] placeholder-[#686278] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#b4afc4] uppercase tracking-wider mb-1">
                Título do Lançamento *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Novos Biomas & Melhorias de Desempenho"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-sm text-white placeholder-[#686278] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#b4afc4] uppercase tracking-wider mb-1">
              Badge / Rótulo
            </label>
            <input
              type="text"
              placeholder="Último Lançamento, Atualização Maior, Patch"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white placeholder-[#686278] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#b4afc4] uppercase tracking-wider mb-1">
              Resumo da Atualização
            </label>
            <textarea
              rows={2}
              placeholder="Explique os objetivos principais desta versão para os jogadores..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white placeholder-[#686278] focus:outline-none"
            />
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-xs font-bold text-[#b4afc4] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ffff55]" />
              <span>Destaques Principais (1 por linha)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Visual Voxel aprimorado&#10;Melhoria de FPS de até 40%&#10;Suporte total ao Luanti 5.10"
              value={highlightsInput}
              onChange={(e) => setHighlightsInput(e.target.value)}
              className="w-full px-3 py-2 bg-[#120f1a] border-2 border-[#3b344a] focus:border-[#55ffff] text-xs text-white placeholder-[#686278] focus:outline-none"
            />
          </div>

          {/* Changes list */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#b4afc4] uppercase tracking-wider">
                Lista de Alterações
              </label>
              <button
                type="button"
                onClick={handleAddChangeItem}
                className="mc-btn mc-btn-diamond px-2.5 py-1 text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Adicionar Linha</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {changes.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#120f1a] p-2 border-2 border-[#3b344a]">
                  <select
                    value={item.type}
                    onChange={(e) => handleUpdateChangeItem(idx, 'type', e.target.value)}
                    className="px-2 py-1 bg-[#211c2b] border border-[#4a4359] text-xs font-bold text-[#ffff55] focus:outline-none"
                  >
                    <option value="added">✨ Adicionado</option>
                    <option value="changed">⚡ Modificado</option>
                    <option value="fixed">🐛 Corrigido</option>
                    <option value="removed">🗑️ Removido</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Descrição da mudança..."
                    value={item.text}
                    onChange={(e) => handleUpdateChangeItem(idx, 'text', e.target.value)}
                    className="flex-1 px-2.5 py-1 bg-[#1c1827] border border-[#3b344a] text-xs text-white focus:outline-none focus:border-[#55ffff]"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveChangeItem(idx)}
                    className="p-1 text-[#ff5555] hover:text-white transition-colors cursor-pointer"
                    title="Remover item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

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
              disabled={isSubmitting}
              className="mc-btn mc-btn-green px-5 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Salvando...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{editRelease ? 'Salvar Edição' : 'Publicar Versão'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
