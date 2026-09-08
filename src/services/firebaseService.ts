import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Screenshot, AdminUser, GameInfo, GitHubCommit, WallpaperItem, SplashConfig, TutorialVideo } from '../types';

const SCREENSHOTS_COLLECTION = 'screenshots';
const ADMINS_COLLECTION = 'admins';
const SETTINGS_COLLECTION = 'settings';
const WALLPAPERS_COLLECTION = 'wallpapers';
const TUTORIALS_COLLECTION = 'tutorials';

export const DEFAULT_TUTORIALS: TutorialVideo[] = [
  {
    id: 'tutorial-instalacao-guia',
    title: 'Como Instalar BetterCraft no Motor Luanti',
    description: 'Guia visual completo: do download do arquivo ZIP até a extração correta na pasta games/ do Luanti.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    videoType: 'direct',
    platform: 'all',
    startTime: 2,
    endTime: 14,
    isMuted: false,
    defaultVolume: 0.8,
    duration: 15,
    author: 'Equipe Luanti BetterCraft',
    createdAt: new Date().toISOString(),
    active: true
  }
];

export const DEFAULT_SPLASHES: SplashConfig = {
  prioritySplashes: [
    "★ Bem-vindo ao Luanti BetterCraft!",
    "★ Confira a nova release Sulphur Update no GitHub!",
    "★ Shaders volumétricos & biomas únicos ativos!",
    "★ Ecossistema Blockframe 100% integrado!"
  ].join('\n'),
  normalSplashes: [
    "100% Aberto e Código Limpo!",
    "Feito para o motor Luanti 5.9.0+!",
    "Performance ultra-leve sem travamentos!",
    "Explore cavernas profundas com cristais!",
    "Crie construções épicas bloco a bloco!",
    "Totalmente customizável em Lua!",
    "Multiplayer fluido com amigos!",
    "Compatível com mods do ContentDB!",
    "Geração de mundo exuberante e infinita!",
    "O verdadeiro sandbox voxel evoluído!"
  ].join('\n')
};

export const DEFAULT_WALLPAPERS: WallpaperItem[] = [];

// Helper to clean undefined fields before sending to Firestore
function removeUndefinedFields<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      clean[key] = obj[key];
    }
  }
  return clean;
}

export const firebaseApi = {
  // Listen real-time to screenshots
  subscribeScreenshots(callback: (screenshots: Screenshot[]) => void) {
    const q = query(collection(db, SCREENSHOTS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: Screenshot[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          mediaType: data.mediaType || (data.videoUrl ? 'video' : 'image'),
          videoUrl: data.videoUrl || undefined,
          startTime: typeof data.startTime === 'number' ? data.startTime : undefined,
          endTime: typeof data.endTime === 'number' ? data.endTime : undefined,
          isMuted: data.isMuted !== undefined ? Boolean(data.isMuted) : undefined,
          defaultVolume: typeof data.defaultVolume === 'number' ? data.defaultVolume : undefined,
          duration: typeof data.duration === 'number' ? data.duration : undefined,
          category: data.category || 'Biomas',
          author: data.author || 'Anônimo',
          createdAt: data.createdAt || new Date().toISOString(),
          featured: Boolean(data.featured),
          tags: Array.isArray(data.tags) ? data.tags : []
        });
      });
      callback(items);
    }, (error) => {
      console.error("Error subscribing to screenshots:", error);
    });
  },

  // Get screenshots once
  async getScreenshots(): Promise<Screenshot[]> {
    try {
      const q = query(collection(db, SCREENSHOTS_COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items: Screenshot[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          mediaType: data.mediaType || (data.videoUrl ? 'video' : 'image'),
          videoUrl: data.videoUrl || undefined,
          startTime: typeof data.startTime === 'number' ? data.startTime : undefined,
          endTime: typeof data.endTime === 'number' ? data.endTime : undefined,
          isMuted: data.isMuted !== undefined ? Boolean(data.isMuted) : undefined,
          defaultVolume: typeof data.defaultVolume === 'number' ? data.defaultVolume : undefined,
          duration: typeof data.duration === 'number' ? data.duration : undefined,
          category: data.category || 'Biomas',
          author: data.author || 'Anônimo',
          createdAt: data.createdAt || new Date().toISOString(),
          featured: Boolean(data.featured),
          tags: Array.isArray(data.tags) ? data.tags : []
        });
      });
      return items;
    } catch (err) {
      console.error('Error fetching screenshots from Firestore:', err);
      return [];
    }
  },

  // Create screenshot in Firestore
  async createScreenshot(
    screenshot: Omit<Screenshot, 'id' | 'createdAt' | 'author'> & { 
      authorName?: string;
      authorUid?: string;
      authorEmail?: string;
    }
  ): Promise<Screenshot> {
    const rawDoc = {
      title: screenshot.title.trim(),
      description: screenshot.description?.trim() || '',
      imageUrl: screenshot.imageUrl.trim(),
      mediaType: screenshot.mediaType || (screenshot.videoUrl ? 'video' : 'image'),
      videoUrl: screenshot.videoUrl?.trim() || null,
      startTime: typeof screenshot.startTime === 'number' ? screenshot.startTime : 0,
      endTime: typeof screenshot.endTime === 'number' ? screenshot.endTime : 0,
      isMuted: Boolean(screenshot.isMuted),
      defaultVolume: typeof screenshot.defaultVolume === 'number' ? screenshot.defaultVolume : 0.8,
      duration: typeof screenshot.duration === 'number' ? screenshot.duration : 0,
      category: screenshot.category || 'Biomas',
      author: screenshot.authorEmail || screenshot.authorName?.trim() || 'Jogador da Comunidade',
      authorUid: screenshot.authorUid || null,
      authorEmail: screenshot.authorEmail || null,
      createdAt: new Date().toISOString(),
      featured: Boolean(screenshot.featured),
      tags: Array.isArray(screenshot.tags) ? screenshot.tags : []
    };

    const newDoc = removeUndefinedFields(rawDoc);

    const docRef = await addDoc(collection(db, SCREENSHOTS_COLLECTION), newDoc);
    return {
      id: docRef.id,
      ...newDoc
    } as Screenshot;
  },

  // Update screenshot safely without undefined values
  async updateScreenshot(id: string, updates: Partial<Screenshot> & { authorName?: string }): Promise<void> {
    const docRef = doc(db, SCREENSHOTS_COLLECTION, id);
    const cleaned = removeUndefinedFields(updates);

    if (cleaned.authorName) {
      cleaned.author = cleaned.authorName;
    }
    delete cleaned.authorName;

    if (Object.keys(cleaned).length > 0) {
      await updateDoc(docRef, cleaned);
    }
  },

  // Delete screenshot
  async deleteScreenshot(id: string): Promise<void> {
    const docRef = doc(db, SCREENSHOTS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Clear all screenshots (for wiping default ones when requested)
  async clearAllScreenshots(): Promise<void> {
    const snapshot = await getDocs(collection(db, SCREENSHOTS_COLLECTION));
    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, SCREENSHOTS_COLLECTION, d.id)));
    await Promise.all(deletePromises);
  },

  // Admins from Firestore
  async getAdmins(): Promise<AdminUser[]> {
    const owner: AdminUser = {
      id: 'jeanpierreowner@gmail.com',
      email: 'jeanpierreowner@gmail.com',
      name: 'Jean Pierre (Proprietário)',
      role: 'owner',
      addedAt: new Date().toISOString(),
      addedBy: 'Firebase Google Root',
      isProtected: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    try {
      const snapshot = await getDocs(collection(db, ADMINS_COLLECTION));
      const admins: AdminUser[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        admins.push({
          id: doc.id,
          email: data.email || doc.id,
          name: data.name || data.email,
          role: data.role || 'admin',
          addedAt: data.addedAt || new Date().toISOString(),
          addedBy: data.addedBy || 'system',
          isProtected: Boolean(data.isProtected || data.email?.toLowerCase() === 'jeanpierreowner@gmail.com'),
          avatarUrl: data.avatarUrl
        });
      });

      // Ensure Owner is always included
      if (!admins.some(a => a.email.toLowerCase() === 'jeanpierreowner@gmail.com')) {
        admins.unshift(owner);
      }

      return admins;
    } catch (err) {
      console.warn('Notice: Using default owner account for admin check:', err);
      return [owner];
    }
  },

  async addAdmin(admin: { email: string; name?: string; role: string; addedBy: string }): Promise<void> {
    const emailClean = admin.email.trim().toLowerCase();
    const docRef = doc(db, ADMINS_COLLECTION, emailClean);
    await setDoc(docRef, {
      email: emailClean,
      name: admin.name?.trim() || emailClean.split('@')[0],
      role: admin.role || 'admin',
      addedAt: new Date().toISOString(),
      addedBy: admin.addedBy,
      isProtected: emailClean === 'jeanpierreowner@gmail.com',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name || emailClean)}&background=059669&color=fff`
    });
  },

  async removeAdmin(email: string): Promise<void> {
    const emailClean = email.trim().toLowerCase();
    if (emailClean === 'jeanpierreowner@gmail.com') {
      throw new Error('Não é permitido remover o proprietário.');
    }
    await deleteDoc(doc(db, ADMINS_COLLECTION, emailClean));
  },

  // Game settings in Firestore
  async getGameSettings(): Promise<Partial<GameInfo> | null> {
    try {
      const snap = await getDoc(doc(db, SETTINGS_COLLECTION, 'general'));
      if (snap.exists()) {
        return snap.data() as Partial<GameInfo>;
      }
      return null;
    } catch (e) {
      console.error('Error loading game settings from Firestore:', e);
      return null;
    }
  },

  async saveGameSettings(settings: Partial<GameInfo>): Promise<void> {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'general'), settings, { merge: true });
  },

  // Splashes
  async getSplashes(): Promise<SplashConfig> {
    try {
      const snap = await getDoc(doc(db, SETTINGS_COLLECTION, 'splashes'));
      if (snap.exists()) {
        const data = snap.data();
        return {
          prioritySplashes: data.prioritySplashes || DEFAULT_SPLASHES.prioritySplashes,
          normalSplashes: data.normalSplashes || DEFAULT_SPLASHES.normalSplashes,
          updatedAt: data.updatedAt
        };
      }
      return DEFAULT_SPLASHES;
    } catch (e) {
      console.warn('Using default splashes:', e);
      return DEFAULT_SPLASHES;
    }
  },

  async saveSplashes(splashes: SplashConfig): Promise<void> {
    await setDoc(doc(db, SETTINGS_COLLECTION, 'splashes'), {
      ...splashes,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  },

  subscribeSplashes(callback: (splashes: SplashConfig) => void) {
    return onSnapshot(doc(db, SETTINGS_COLLECTION, 'splashes'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback({
          prioritySplashes: data.prioritySplashes || DEFAULT_SPLASHES.prioritySplashes,
          normalSplashes: data.normalSplashes || DEFAULT_SPLASHES.normalSplashes,
          updatedAt: data.updatedAt
        });
      } else {
        callback(DEFAULT_SPLASHES);
      }
    }, (err) => {
      console.warn('Splashes listener error:', err);
      callback(DEFAULT_SPLASHES);
    });
  },

  // Wallpapers (Strictly from Firebase Firestore)
  async getWallpapers(): Promise<WallpaperItem[]> {
    try {
      const snap = await getDocs(collection(db, WALLPAPERS_COLLECTION));
      const list: WallpaperItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          url: data.url,
          title: data.title || 'Papel de Parede',
          addedAt: data.addedAt || new Date().toISOString(),
          addedBy: data.addedBy || 'Admin',
          active: data.active !== false
        });
      });
      return list;
    } catch (e) {
      console.warn('Error fetching wallpapers from Firebase:', e);
      return [];
    }
  },

  async addWallpaper(wallpaper: { url: string; title: string; addedBy?: string }): Promise<WallpaperItem> {
    const docRef = await addDoc(collection(db, WALLPAPERS_COLLECTION), {
      url: wallpaper.url,
      title: wallpaper.title || 'Papel de Parede',
      addedAt: new Date().toISOString(),
      addedBy: wallpaper.addedBy || 'Admin',
      active: true
    });
    return {
      id: docRef.id,
      url: wallpaper.url,
      title: wallpaper.title || 'Papel de Parede',
      addedAt: new Date().toISOString(),
      addedBy: wallpaper.addedBy || 'Admin',
      active: true
    };
  },

  async deleteWallpaper(id: string): Promise<void> {
    await deleteDoc(doc(db, WALLPAPERS_COLLECTION, id));
  },

  async toggleWallpaperActive(id: string, active: boolean): Promise<void> {
    await updateDoc(doc(db, WALLPAPERS_COLLECTION, id), { active });
  },

  subscribeWallpapers(callback: (wallpapers: WallpaperItem[]) => void) {
    return onSnapshot(collection(db, WALLPAPERS_COLLECTION), (snapshot) => {
      const list: WallpaperItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          url: data.url,
          title: data.title || 'Papel de Parede',
          addedAt: data.addedAt || new Date().toISOString(),
          addedBy: data.addedBy || 'Admin',
          active: data.active !== false
        });
      });
      callback(list);
    }, (err) => {
      console.warn('Wallpapers listener error:', err);
      callback([]);
    });
  },

  // Tutorials Management
  async getTutorials(): Promise<TutorialVideo[]> {
    try {
      const snap = await getDocs(collection(db, TUTORIALS_COLLECTION));
      if (snap.empty) {
        return DEFAULT_TUTORIALS;
      }
      const list: TutorialVideo[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          title: data.title || 'Vídeo Tutorial',
          description: data.description || '',
          videoUrl: data.videoUrl,
          videoType: data.videoType || 'direct',
          platform: data.platform || 'all',
          startTime: typeof data.startTime === 'number' ? data.startTime : 0,
          endTime: typeof data.endTime === 'number' ? data.endTime : 0,
          isMuted: !!data.isMuted,
          defaultVolume: typeof data.defaultVolume === 'number' ? data.defaultVolume : 0.8,
          duration: data.duration,
          author: data.author || 'Admin',
          createdAt: data.createdAt || new Date().toISOString(),
          active: data.active !== false
        });
      });
      return list.length > 0 ? list : DEFAULT_TUTORIALS;
    } catch (e) {
      console.warn('Error fetching tutorials from Firebase, using defaults:', e);
      return DEFAULT_TUTORIALS;
    }
  },

  async addTutorial(tutorial: Omit<TutorialVideo, 'id'>): Promise<TutorialVideo> {
    const clean = removeUndefinedFields({
      title: tutorial.title,
      description: tutorial.description || '',
      videoUrl: tutorial.videoUrl,
      videoType: tutorial.videoType || 'direct',
      platform: tutorial.platform || 'all',
      startTime: tutorial.startTime || 0,
      endTime: tutorial.endTime || 0,
      isMuted: !!tutorial.isMuted,
      defaultVolume: tutorial.defaultVolume ?? 0.8,
      duration: tutorial.duration || 0,
      author: tutorial.author || 'Admin',
      createdAt: new Date().toISOString(),
      active: tutorial.active !== false
    });
    const docRef = await addDoc(collection(db, TUTORIALS_COLLECTION), clean);
    return {
      id: docRef.id,
      ...clean
    } as TutorialVideo;
  },

  async updateTutorial(id: string, tutorial: Partial<TutorialVideo>): Promise<void> {
    const clean = removeUndefinedFields(tutorial);
    await updateDoc(doc(db, TUTORIALS_COLLECTION, id), clean);
  },

  async deleteTutorial(id: string): Promise<void> {
    await deleteDoc(doc(db, TUTORIALS_COLLECTION, id));
  },

  subscribeTutorials(callback: (tutorials: TutorialVideo[]) => void) {
    return onSnapshot(collection(db, TUTORIALS_COLLECTION), (snapshot) => {
      if (snapshot.empty) {
        callback(DEFAULT_TUTORIALS);
        return;
      }
      const list: TutorialVideo[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          title: data.title || 'Vídeo Tutorial',
          description: data.description || '',
          videoUrl: data.videoUrl,
          videoType: data.videoType || 'direct',
          platform: data.platform || 'all',
          startTime: typeof data.startTime === 'number' ? data.startTime : 0,
          endTime: typeof data.endTime === 'number' ? data.endTime : 0,
          isMuted: !!data.isMuted,
          defaultVolume: typeof data.defaultVolume === 'number' ? data.defaultVolume : 0.8,
          duration: data.duration,
          author: data.author || 'Admin',
          createdAt: data.createdAt || new Date().toISOString(),
          active: data.active !== false
        });
      });
      callback(list.length > 0 ? list : DEFAULT_TUTORIALS);
    }, (err) => {
      console.warn('Tutorials listener error, using defaults:', err);
      callback(DEFAULT_TUTORIALS);
    });
  }
};
