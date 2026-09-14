import { 
  AdminUser, 
  Screenshot, 
  ChangelogRelease, 
  GitHubCommit, 
  GameInfo, 
  AuditLog 
} from '../types';

class ApiService {
  private getHeaders(adminEmail?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminEmail) {
      headers['x-admin-email'] = adminEmail;
    }
    return headers;
  }

  // Game Info
  async getGameInfo(): Promise<GameInfo> {
    const res = await fetch('/api/game-info');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao carregar informações');
    return json.data;
  }

  async updateGameInfo(gameInfo: Partial<GameInfo>, adminEmail: string): Promise<GameInfo> {
    const res = await fetch('/api/game-info', {
      method: 'PUT',
      headers: this.getHeaders(adminEmail),
      body: JSON.stringify(gameInfo)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao atualizar dados do jogo');
    return json.data;
  }

  // Media Upload (Image or Video)
  async uploadImage(fileBase64: string, adminEmail?: string, originalName?: string, mimeType?: string): Promise<{ url: string; filename: string; isVideo?: boolean }> {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: this.getHeaders(adminEmail),
      body: JSON.stringify({ fileBase64, originalName, mimeType })
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao fazer upload do arquivo');
    return json;
  }

  // Screenshots
  async getScreenshots(): Promise<Screenshot[]> {
    const res = await fetch('/api/screenshots');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao buscar capturas de tela');
    return json.data;
  }

  async createScreenshot(
    screenshot: Omit<Screenshot, 'id' | 'createdAt' | 'author'> & { authorName?: string }, 
    adminEmail?: string
  ): Promise<Screenshot> {
    const res = await fetch('/api/screenshots', {
      method: 'POST',
      headers: this.getHeaders(adminEmail),
      body: JSON.stringify(screenshot)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao criar captura');
    return json.data;
  }

  async updateScreenshot(id: string, updates: Partial<Screenshot>, adminEmail: string): Promise<Screenshot> {
    const res = await fetch(`/api/screenshots/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(adminEmail),
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao atualizar captura');
    return json.data;
  }

  async deleteScreenshot(id: string, adminEmail: string): Promise<void> {
    const res = await fetch(`/api/screenshots/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(adminEmail)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao excluir captura');
  }

  // Changelog
  async getChangelog(): Promise<ChangelogRelease[]> {
    const res = await fetch('/api/changelog');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao buscar notas de atualização');
    return json.data;
  }

  async createChangelogRelease(release: Omit<ChangelogRelease, 'id' | 'date' | 'author'>, adminEmail: string): Promise<ChangelogRelease> {
    const res = await fetch('/api/changelog', {
      method: 'POST',
      headers: this.getHeaders(adminEmail),
      body: JSON.stringify(release)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao publicar versão');
    return json.data;
  }

  async updateChangelogRelease(id: string, updates: Partial<ChangelogRelease>, adminEmail: string): Promise<ChangelogRelease> {
    const res = await fetch(`/api/changelog/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(adminEmail),
      body: JSON.stringify(updates)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao editar versão');
    return json.data;
  }

  async deleteChangelogRelease(id: string, adminEmail: string): Promise<void> {
    const res = await fetch(`/api/changelog/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(adminEmail)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao excluir versão');
  }

  // GitHub Commits (fetches directly from /api/commits with direct GitHub fallback)
  async getCommits(): Promise<GitHubCommit[]> {
    try {
      const res = await fetch('/api/commits');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    } catch (e) {
      console.warn('API route /api/commits failed, attempting direct GitHub fetch:', e);
    }

    // Direct GitHub fallback to ensure live commits are always loaded from wrxxnch/luanti-bettercraft main branch
    try {
      const ghRes = await fetch('https://api.github.com/repos/wrxxnch/luanti-bettercraft/commits?sha=main&per_page=25', {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (ghRes.ok) {
        const ghData: any[] = await ghRes.json();
        if (Array.isArray(ghData) && ghData.length > 0) {
          return ghData.map((item: any) => ({
            sha: item.sha,
            message: item.commit?.message || 'Commit sem mensagem',
            author: {
              name: item.commit?.author?.name || item.author?.login || 'Jean Pierre (wrxxnch)',
              email: item.commit?.author?.email,
              date: item.commit?.author?.date || new Date().toISOString(),
              avatar_url: item.author?.avatar_url || `https://avatars.githubusercontent.com/u/134978254?v=4`
            },
            html_url: item.html_url || `https://github.com/wrxxnch/luanti-bettercraft/commit/${item.sha}`
          }));
        }
      }
    } catch (ghErr) {
      console.warn('Direct GitHub fetch also failed:', ghErr);
    }

    throw new Error('Falha ao sincronizar commits');
  }

  // Admins
  async getAdmins(): Promise<AdminUser[]> {
    const res = await fetch('/api/admins');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao buscar administradores');
    return json.data;
  }

  async addAdmin(data: { email: string; name?: string; role: string }, adminEmail: string): Promise<AdminUser> {
    const res = await fetch('/api/admins', {
      method: 'POST',
      headers: this.getHeaders(adminEmail),
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao conceder privilégios de administrador');
    return json.data;
  }

  async revokeAdmin(id: string, adminEmail: string): Promise<void> {
    const res = await fetch(`/api/admins/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(adminEmail)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Erro ao revogar administrador');
  }

  // Logs
  async getLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/logs');
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Falha ao obter registros de auditoria');
    return json.data;
  }

  // Auth verify
  async verifyAdmin(email: string): Promise<{ isAdmin: boolean; user: AdminUser | null; message?: string }> {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const json = await res.json();
    return json;
  }
}

export const api = new ApiService();
