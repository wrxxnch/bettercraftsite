export type AdminRole = 'owner' | 'admin' | 'editor';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  addedAt: string;
  addedBy: string;
  isProtected?: boolean;
  avatarUrl?: string;
}

export type ScreenshotCategory = 
  | 'Biomas' 
  | 'Construções' 
  | 'Crafting' 
  | 'Mobs & Criaturas' 
  | 'Shaders & Luz' 
  | 'Comunidade' 
  | 'Outros';

export interface Screenshot {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: ScreenshotCategory;
  author: string;
  createdAt: string;
  featured: boolean;
  tags: string[];
}

export interface ChangelogItem {
  type: 'added' | 'changed' | 'fixed' | 'removed';
  text: string;
}

export interface ChangelogRelease {
  id: string;
  version: string;
  title: string;
  date: string;
  tag: string;
  description: string;
  highlights: string[];
  changes: ChangelogItem[];
  author: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email?: string;
    date: string;
    avatar_url?: string;
  };
  html_url: string;
  branch?: string;
}

export interface GameFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface DownloadLink {
  id: string;
  label: string;
  url: string;
  platform: string;
  subtext?: string;
  recommended?: boolean;
  type: 'github' | 'contentdb' | 'direct' | 'zip';
}

export interface InstallationStep {
  step: number;
  title: string;
  description: string;
  codeSnippet?: string;
}

export interface GameInfo {
  title: string;
  tagline: string;
  description: string;
  longDescription: string;
  repoUrl: string; // games/bettercraft repo: https://github.com/wrxxnch/bettercraft
  repoOwner: string;
  repoName: string;
  gamesRepoUrl?: string; // https://github.com/wrxxnch/bettercraft
  officialCodeRepoUrl?: string; // https://github.com/wrxxnch/luanti-bettercraft
  blockframeContentDbUrl?: string; // https://content.luanti.org/packages/wrxxnch/blockframe/
  blockframeCommunityUrl?: string; // https://wrxxnch.github.io/blockframecommunity/
  blockframeTutorialsUrl?: string; // https://wrxxnch.github.io/blockframesite/
  allowPublicScreenshots: boolean; // default false (admin-only)
  luantiVersion: string;
  gameVersion: string;
  license: string;
  features: GameFeature[];
  downloadLinks: DownloadLink[];
  installationSteps: {
    windows: InstallationStep[];
    linux: InstallationStep[];
    android: InstallationStep[];
    macos: InstallationStep[];
  };
}

export interface WallpaperItem {
  id: string;
  url: string;
  title: string;
  addedAt: string;
  addedBy?: string;
  active?: boolean;
}

export interface SplashConfig {
  prioritySplashes: string;
  normalSplashes: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  details: string;
}

export interface AuthSession {
  user: AdminUser | null;
  isAdmin: boolean;
  token?: string;
}
