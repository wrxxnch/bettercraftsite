import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  X, 
  AlertCircle, 
  Sparkles, 
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPanel: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminPanel
}) => {
  const { user, isAdmin, loginWithGoogle, loginAs, logout, error } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLocalError(null);
    try {
      const success = await loginWithGoogle();
      if (success) {
        onClose();
        onOpenAdminPanel();
      }
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao conectar via Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLogin = async (email: string) => {
    setIsLoading(true);
    setLocalError(null);
    try {
      const success = await loginAs(email);
      if (success) {
        onClose();
        onOpenAdminPanel();
      }
    } catch (err: any) {
      setLocalError(err.message || 'Erro ao conectar conta de administrador.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        className="relative max-w-md w-full mc-panel p-0 text-[#e0dfd5] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#171420] border-b-2 border-[#332c42]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 mc-slot flex items-center justify-center text-[#55ffff]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide mc-text-shadow font-minecraft">
                FIREBASE GOOGLE LOGIN
              </h3>
              <p className="text-[10px] text-[#9e9aa8] font-mono">
                Autenticação do Luanti BetterCraft
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

        {/* Content */}
        <div className="p-5 space-y-4 bg-[#1c1827]">
          {/* Current status if already logged in */}
          {isAdmin ? (
            <div className="p-3.5 mc-slot bg-[#14121a] space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=0284c7&color=fff`}
                  alt={user?.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 mc-slot object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white uppercase">{user?.name}</h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#2b742b] text-white border border-[#55ff55]">
                      {user?.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#55ffff] font-mono truncate">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-[#2f293b]">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminPanel();
                  }}
                  className="mc-btn mc-btn-green flex-1 py-2 text-xs cursor-pointer"
                >
                  Abrir Painel Admin
                </button>
                <button
                  onClick={() => logout()}
                  className="mc-btn mc-btn-red px-3 py-2 text-xs flex items-center gap-1 cursor-pointer"
                  title="Desconectar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Google Firebase Sign In Button */}
              <div className="p-4 mc-slot bg-[#13101c] border-2 border-[#55ffff] space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-[#55ffff] text-xs font-bold uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>Conectar com Conta Google</span>
                </div>
                <p className="text-xs text-[#cfcbd9]">
                  Faça login seguro via Firebase Authentication com sua conta Google autorizada:
                </p>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="mc-btn mc-btn-diamond w-full py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg font-bold"
                >
                  <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>{isLoading ? 'Conectando...' : 'Entrar com o Google'}</span>
                </button>
              </div>

              {/* Informative notice about admin whitelist */}
              <div className="p-3 mc-slot bg-[#100d18] border border-[#2b2438] text-[11px] text-[#8e8999] flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-[#55ffff] flex-shrink-0 mt-0.5" />
                <p>
                  Apenas e-mails cadastrados previamente como administradores ou o proprietário têm autorização para gerenciar o site.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {(localError || error) && (
            <div className="p-3 bg-[#4a1515] border-2 border-[#ff5555] text-[#ffaaaa] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{localError || error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#13101c] border-t-2 border-[#2b2438] flex items-center justify-between text-[11px] text-[#8e8999]">
          <span>Conexão Segura Firebase</span>
          <span className="font-mono text-[#55ffff]">Firestore DB Ativo</span>
        </div>
      </div>
    </div>
  );
};
