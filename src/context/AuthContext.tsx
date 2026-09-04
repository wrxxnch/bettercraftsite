import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { AdminUser } from '../types';
import { firebaseApi } from '../services/firebaseService';

interface AuthContextType {
  user: AdminUser | null;
  firebaseUser: FirebaseUser | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<boolean>;
  loginAs: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAdmins: () => Promise<void>;
  adminsList: AdminUser[];
  error: string | null;
}

const PRIMARY_OWNER_EMAIL = 'jeanpierreowner@gmail.com';
const STORAGE_KEY = 'bettercraft_admin_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [adminsList, setAdminsList] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    try {
      const list = await firebaseApi.getAdmins();
      setAdminsList(list);
      return list;
    } catch (err) {
      console.error('Failed to load admins from Firebase:', err);
      return [];
    }
  };

  // Sync auth state with Firebase Auth
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setIsLoading(true);
      setFirebaseUser(fbUser);
      const list = await fetchAdmins();

      if (fbUser && fbUser.email) {
        const userEmail = fbUser.email.toLowerCase();
        const matched = list.find(a => a.email.toLowerCase() === userEmail);
        
        if (matched) {
          setUser({
            ...matched,
            name: fbUser.displayName || matched.name,
            avatarUrl: fbUser.photoURL || matched.avatarUrl
          });
        } else if (userEmail === PRIMARY_OWNER_EMAIL) {
          const ownerUser: AdminUser = {
            id: 'jeanpierreowner@gmail.com',
            email: PRIMARY_OWNER_EMAIL,
            name: fbUser.displayName || 'Jean Pierre (Proprietário)',
            role: 'owner',
            addedAt: new Date().toISOString(),
            addedBy: 'Firebase Google Root',
            isProtected: true,
            avatarUrl: fbUser.photoURL || undefined
          };
          setUser(ownerUser);
        } else {
          // Logged in via Google but not authorized admin
          setUser(null);
        }
      } else {
        // Not authenticated via Firebase: regular visitor, no admin privileges
        setUser(null);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
      }

      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Login with Real Google Popup
  const loginWithGoogle = async (): Promise<boolean> => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email?.toLowerCase();
      
      const list = await fetchAdmins();
      const matched = list.find(a => a.email.toLowerCase() === email);

      if (matched || email === PRIMARY_OWNER_EMAIL) {
        const activeUser: AdminUser = matched || {
          id: email!,
          email: email!,
          name: result.user.displayName || 'Jean Pierre',
          role: 'owner',
          addedAt: new Date().toISOString(),
          addedBy: 'Firebase Google Root',
          isProtected: true,
          avatarUrl: result.user.photoURL || undefined
        };
        setUser(activeUser);
        return true;
      } else {
        await signOut(auth);
        setUser(null);
        setFirebaseUser(null);
        setError(`A conta Google (${email}) não possui permissão de administrador no Luanti BetterCraft.`);
        return false;
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setError(err.message || 'Erro ao efetuar login com Google.');
      return false;
    }
  };

  const loginAs = async (email: string): Promise<boolean> => {
    setError(null);
    try {
      const list = await fetchAdmins();
      const cleanEmail = email.trim().toLowerCase();
      const matched = list.find(a => a.email.toLowerCase() === cleanEmail);

      if (matched || cleanEmail === PRIMARY_OWNER_EMAIL) {
        const activeUser = matched || {
          id: cleanEmail,
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          role: 'owner' as const,
          addedAt: new Date().toISOString(),
          addedBy: 'System',
          isProtected: true
        };
        setUser(activeUser);
        return true;
      } else {
        setError('E-mail não autorizado como administrador.');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao efetuar login.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setFirebaseUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  };

  const refreshAdmins = async () => {
    await fetchAdmins();
  };

  const isSuperAdmin = Boolean(
    user && (user.role === 'owner' || user.email.toLowerCase() === PRIMARY_OWNER_EMAIL)
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAdmin: Boolean(user),
        isSuperAdmin,
        isLoading,
        loginWithGoogle,
        loginAs,
        logout,
        refreshAdmins,
        adminsList,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
