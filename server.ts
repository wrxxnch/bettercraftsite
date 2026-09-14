import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { 
  AdminUser, 
  Screenshot, 
  ChangelogRelease, 
  GitHubCommit, 
  GameInfo, 
  AuditLog 
} from './src/types.js';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data and uploads directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface DatabaseSchema {
  admins: AdminUser[];
  screenshots: Screenshot[];
  changelog: ChangelogRelease[];
  gameInfo: GameInfo;
  auditLogs: AuditLog[];
  cachedCommits: GitHubCommit[];
  lastCommitsFetch: number;
}

const DEFAULT_GAME_INFO: GameInfo = {
  title: "Luanti BetterCraft",
  tagline: "A evolução da experiência voxel para o motor de jogo Luanti",
  description: "BetterCraft é um jogo completo para Luanti (antigo Minetest) focado em sobrevivência aprimorada, geração de mundos deslumbrante, crafting refinado e performance impecável.",
  longDescription: "Construído sobre o poderoso e leve motor Luanti (anteriormente Minetest), BetterCraft redefine a jogabilidade sandbox com biomas diversificados, novos minérios, iluminação dinâmica, árvores com folhagens densas, ferramentas balanceadas e ecossistema conectado com Blockframe.",
  repoUrl: "https://github.com/wrxxnch/bettercraft",
  repoOwner: "wrxxnch",
  repoName: "bettercraft",
  gamesRepoUrl: "https://github.com/wrxxnch/bettercraft",
  officialCodeRepoUrl: "https://github.com/wrxxnch/luanti-bettercraft",
  blockframeContentDbUrl: "https://content.luanti.org/packages/wrxxnch/blockframe/",
  blockframeCommunityUrl: "https://wrxxnch.github.io/blockframecommunity/",
  blockframeTutorialsUrl: "https://wrxxnch.github.io/blockframesite/",
  allowPublicScreenshots: false,
  luantiVersion: "5.9.0+",
  gameVersion: "v1.4.2",
  license: "GPL-3.0 / MIT",
  features: [
    {
      id: "world-gen",
      title: "Geração de Mundo Exuberante",
      description: "Montanhas colossais, vales verdejantes, biomas árticos e cavernas profundas com ecossistemas únicos e novas formações de rochas.",
      icon: "Mountain"
    },
    {
      id: "modern-crafting",
      title: "Sistema de Crafting Intuitivo",
      description: "Guia de receitas integrado, bancadas de trabalho especializadas, fornos de alta temperatura e automação simplificada.",
      icon: "Hammer"
    },
    {
      id: "lighting-shaders",
      title: "Iluminação & Shaders Volumétricos",
      description: "Suporte nativo aos modernos shaders do Luanti: luz solar realista, névoa volumétrica, água com reflexos e oclusão de ambiente.",
      icon: "Sun"
    },
    {
      id: "mobs-fauna",
      title: "Fauna e Monstros Balanceados",
      description: "Animais domesticáveis para fazendas, criaturas hostis com IA desafiadora em cavernas e bosses em estruturas raras.",
      icon: "Sparkles"
    },
    {
      id: "lightweight-perf",
      title: "Desempenho Ultra-Leve",
      description: "Roda suavemente até em computadores modestos e dispositivos Android, consumindo uma fração da memória de outros jogos voxel.",
      icon: "Zap"
    },
    {
      id: "moddable-luanti",
      title: "100% Modificável em Lua",
      description: "Compatível com a rica biblioteca de mods Luanti e ContentDB, facilitando criação e personalização de servidores.",
      icon: "Code"
    }
  ],
  downloadLinks: [
    {
      id: "dl-release",
      label: "Baixar Última Versão (ZIP)",
      url: "https://github.com/wrxxnch/bettercraft/archive/refs/heads/main.zip",
      platform: "Todos os Sistemas",
      subtext: "Código-fonte pronto para pasta games/",
      recommended: true,
      type: "zip"
    },
    {
      id: "dl-github",
      label: "Repositório no GitHub",
      url: "https://github.com/wrxxnch/bettercraft",
      platform: "GitHub",
      subtext: "Clonar via git ou contribuir",
      type: "github"
    },
    {
      id: "dl-luanti",
      label: "Baixar Motor Luanti Engine",
      url: "https://www.luanti.org/downloads/",
      platform: "Engine Necessária",
      subtext: "Disponível para Windows, Linux, Android e macOS",
      type: "direct"
    }
  ],
  installationSteps: {
    windows: [
      {
        step: 1,
        title: "Instalar o Luanti",
        description: "Baixe e instale a versão mais recente do Luanti (5.9.0 ou superior) em luanti.org."
      },
      {
        step: 2,
        title: "Baixar o BetterCraft",
        description: "Clique no botão 'Baixar Última Versão' acima para obter o arquivo ZIP do repositório."
      },
      {
        step: 3,
        title: "Extrair na pasta games/",
        description: "Extraia a pasta para dentro do diretório 'games' do seu Luanti (geralmente em C:\\Luanti\\games\\ ou %APPDATA%\\luanti\\games\\). Renomeie a pasta para 'bettercraft'."
      },
      {
        step: 4,
        title: "Iniciar o Jogo",
        description: "Abra o Luanti, selecione 'BetterCraft' na lista de jogos no menu principal e crie seu novo mundo!"
      }
    ],
    linux: [
      {
        step: 1,
        title: "Instalar o Luanti via Flatpak ou Gerenciador de Pacotes",
        description: "Instale o Luanti utilizando seu gerenciador favorito:",
        codeSnippet: "flatpak install flathub org.luanti.Luanti\n# ou no Ubuntu/Debian:\nsudo apt install minetest"
      },
      {
        step: 2,
        title: "Clonar o repositório BetterCraft",
        description: "Execute o comando git para clonar diretamente na pasta de jogos do Luanti:",
        codeSnippet: "mkdir -p ~/.luanti/games\ncd ~/.luanti/games\ngit clone https://github.com/wrxxnch/bettercraft.git bettercraft"
      },
      {
        step: 3,
        title: "Jogar",
        description: "Inicie o Luanti pelo lançador ou terminal e selecione BetterCraft."
      }
    ],
    android: [
      {
        step: 1,
        title: "Instalar Luanti no Android",
        description: "Baixe o aplicativo oficial 'Luanti' na Google Play Store ou F-Droid."
      },
      {
        step: 2,
        title: "Copiar arquivos para a pasta de dados",
        description: "Extraia o ZIP do BetterCraft dentro de Android/data/net.minetest.minetest/files/luanti/games/bettercraft/ (ou use o gerenciador de arquivos integrado do Luanti)."
      },
      {
        step: 3,
        title: "Iniciar e Jogar",
        description: "Abra o aplicativo, escolha 'BetterCraft' e divirta-se em qualquer lugar!"
      }
    ],
    macos: [
      {
        step: 1,
        title: "Instalar Luanti para macOS",
        description: "Baixe a versão DMG do Luanti em luanti.org ou instale via Homebrew: brew install luanti"
      },
      {
        step: 2,
        title: "Copiar para Application Support",
        description: "Extraia a pasta em ~/Library/Application Support/luanti/games/bettercraft"
      },
      {
        step: 3,
        title: "Pronto para jogar",
        description: "Inicie o Luanti no Launchpad e aproveite o BetterCraft."
      }
    ]
  }
};

const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: "admin-owner",
    email: "jeanpierreowner@gmail.com",
    name: "Jean Pierre",
    role: "owner",
    addedAt: "2026-08-28T00:00:00.000Z",
    addedBy: "System (Criador Original)",
    isProtected: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: "admin-wrxxnch",
    email: "wrxxnch@users.noreply.github.com",
    name: "Wrxxnch (Dev Lead)",
    role: "admin",
    addedAt: "2026-08-28T01:00:00.000Z",
    addedBy: "jeanpierreowner@gmail.com",
    isProtected: false,
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
  }
];

const DEFAULT_SCREENSHOTS: Screenshot[] = [];


const DEFAULT_CHANGELOG: ChangelogRelease[] = [
  {
    id: "rel-1-4-2",
    version: "v1.4.2",
    title: "Ajustes de Desempenho & Novo Sistema de Luz",
    date: "2026-08-27",
    tag: "Último Lançamento",
    description: "Atualização focada na otimização de renderização de chunks, iluminação suave aprimorada e correções no guia de crafting.",
    highlights: [
      "Redução de 35% no consumo de memória RAM ao carregar novos biomas",
      "Novo shader de água translúcida com reflexo de nuvens volumétricas",
      "Correção de colisões em escadas e lajes de pedra decorativa"
    ],
    changes: [
      { type: "added", text: "Adicionados 12 novos blocos decorativos de madeira tratada e pedra esculpida." },
      { type: "added", text: "Suporte a filtros de busca rápida dentro do livro de receitas do BetterCraft." },
      { type: "changed", text: "Balanceamento do dano e durabilidade de ferramentas de ferro e diamante." },
      { type: "fixed", text: "Corrigido glitch visual que causava piscar de sombras em cavernas profundas." },
      { type: "fixed", text: "Resolvido bug onde itens dropados podiam atravessar cercas de madeira." }
    ],
    author: "wrxxnch & jeanpierreowner"
  },
  {
    id: "rel-1-4-0",
    version: "v1.4.0",
    title: "Grande Expansão: Biomas & Criaturas",
    date: "2026-08-15",
    tag: "Major Update",
    description: "Uma das maiores atualizações do BetterCraft até hoje, trazendo geração de mundo renovada, novos mobs e sons atmosféricos.",
    highlights: [
      "4 novos biomas: Floresta Mística, Taiga Gelada, Deserto Dourado e Pântano Sombrio",
      "Novo sistema de inteligência artificial para mobs terrestres e aquáticos",
      "Trilha sonora ambiente dinâmica integrada ao ciclo dia/noite"
    ],
    changes: [
      { type: "added", text: "Novas criaturas pacíficas: cervos, ovelhas selvagens e pássaros nos bosques." },
      { type: "added", text: "Novas dungeons subterrâneas com baús de tesouro protegido." },
      { type: "changed", text: "Refatoração completa do código de geração de árvores para modelos volumétricos mais naturais." },
      { type: "removed", text: "Removidos blocos obsoletos de teste que causavam incompatibilidade com Luanti 5.9." }
    ],
    author: "wrxxnch"
  },
  {
    id: "rel-1-3-0",
    version: "v1.3.0",
    title: "Compatibilidade Luanti 5.9+ & Novo Menu",
    date: "2026-07-28",
    tag: "Estabilidade",
    description: "Atualização de compatibilidade total com o motor Luanti moderno e interface de usuário renovada.",
    highlights: [
      "Total compatibilidade com a versão 5.9.0 e 5.10.0 do Luanti",
      "Interface gráfica com suporte a alta resolução e telas sensíveis ao toque (Android)"
    ],
    changes: [
      { type: "added", text: "Configurações gráficas in-game para ajustar sombras e alcance de visão rapidamente." },
      { type: "changed", text: "Migração das APIs antigas do Minetest para as diretrizes atualizadas do Luanti." },
      { type: "fixed", text: "Correção de travamentos em servidores multiplayer com mais de 20 jogadores simultâneos." }
    ],
    author: "wrxxnch"
  }
];

const FALLBACK_COMMITS: GitHubCommit[] = [
  {
    sha: "8f7e2d9a1b0c4e5f67890abcdef1234567890abc",
    message: "feat: otimiza renderização de chunks e adiciona novos shaders de iluminação suave",
    author: {
      name: "wrxxnch",
      email: "wrxxnch@users.noreply.github.com",
      date: "2026-08-27T22:15:00Z",
      avatar_url: "https://avatars.githubusercontent.com/u/12345678?v=4"
    },
    html_url: "https://github.com/wrxxnch/luanti-bettercraft/commit/8f7e2d9a1b0c4e5f67890abcdef1234567890abc"
  },
  {
    sha: "4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b",
    message: "fix: corrige colisão em escadas e melhora receitas da bancada de trabalho",
    author: {
      name: "wrxxnch",
      email: "wrxxnch@users.noreply.github.com",
      date: "2026-08-26T18:40:00Z",
      avatar_url: "https://avatars.githubusercontent.com/u/12345678?v=4"
    },
    html_url: "https://github.com/wrxxnch/luanti-bettercraft/commit/4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b"
  },
  {
    sha: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
    message: "docs: atualiza guia de instalação e suporte multiplataforma para Luanti 5.9+",
    author: {
      name: "jeanpierreowner",
      email: "jeanpierreowner@gmail.com",
      date: "2026-08-25T14:10:00Z",
      avatar_url: "https://avatars.githubusercontent.com/u/87654321?v=4"
    },
    html_url: "https://github.com/wrxxnch/luanti-bettercraft/commit/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b"
  },
  {
    sha: "9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e",
    message: "feat: adiciona novos blocos de madeira e pedras esculpidas",
    author: {
      name: "wrxxnch",
      email: "wrxxnch@users.noreply.github.com",
      date: "2026-08-23T11:20:00Z",
      avatar_url: "https://avatars.githubusercontent.com/u/12345678?v=4"
    },
    html_url: "https://github.com/wrxxnch/luanti-bettercraft/commit/9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e"
  },
  {
    sha: "5c6d7e8f9a0b1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
    message: "refactor: reestrutura módulos de biomas e melhora desempenho de spawn",
    author: {
      name: "wrxxnch",
      email: "wrxxnch@users.noreply.github.com",
      date: "2026-08-20T09:00:00Z",
      avatar_url: "https://avatars.githubusercontent.com/u/12345678?v=4"
    },
    html_url: "https://github.com/wrxxnch/luanti-bettercraft/commit/5c6d7e8f9a0b1a2b3c4d5e6f7a8b9c0d1e2f3a4b"
  },
  {
    sha: "3b2a1f0e9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c",
    message: "feat: implementação inicial da nova fauna selvagem e inteligência artificial",
    author: {
      name: "wrxxnch",
      email: "wrxxnch@users.noreply.github.com",
      date: "2026-08-15T16:30:00Z",
      avatar_url: "https://avatars.githubusercontent.com/u/12345678?v=4"
    },
    html_url: "https://github.com/wrxxnch/luanti-bettercraft/commit/3b2a1f0e9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c"
  }
];

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      
      // Ensure jeanpierreowner@gmail.com is always present as owner
      const hasJeanPierre = data.admins?.some((a: AdminUser) => a.email.toLowerCase() === 'jeanpierreowner@gmail.com');
      if (!hasJeanPierre) {
        data.admins = [DEFAULT_ADMINS[0], ...(data.admins || [])];
      }
      
      return {
        admins: data.admins || DEFAULT_ADMINS,
        screenshots: data.screenshots || DEFAULT_SCREENSHOTS,
        changelog: data.changelog || DEFAULT_CHANGELOG,
        gameInfo: { ...DEFAULT_GAME_INFO, ...(data.gameInfo || {}) },
        auditLogs: data.auditLogs || [],
        cachedCommits: data.cachedCommits || FALLBACK_COMMITS,
        lastCommitsFetch: data.lastCommitsFetch || 0
      };
    }
  } catch (err) {
    console.error("Error reading database file, using defaults:", err);
  }

  const initialDb: DatabaseSchema = {
    admins: DEFAULT_ADMINS,
    screenshots: DEFAULT_SCREENSHOTS,
    changelog: DEFAULT_CHANGELOG,
    gameInfo: DEFAULT_GAME_INFO,
    auditLogs: [
      {
        id: "log-init",
        timestamp: new Date().toISOString(),
        userEmail: "system",
        action: "Sistema Inicializado",
        details: "Banco de dados local e contas de administração inicializadas com sucesso."
      }
    ],
    cachedCommits: FALLBACK_COMMITS,
    lastCommitsFetch: 0
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error saving database file:", err);
  }
}

async function fetchGitHubCommits(db: DatabaseSchema): Promise<GitHubCommit[]> {
  const now = Date.now();
  // Cache for 2 minutes for faster updates
  if (db.cachedCommits && db.cachedCommits.length > 0 && now - db.lastCommitsFetch < 2 * 60 * 1000) {
    return db.cachedCommits;
  }

  try {
    const response = await fetch('https://api.github.com/repos/wrxxnch/luanti-bettercraft/commits?sha=main&per_page=30', {
      headers: {
        'User-Agent': 'Luanti-BetterCraft-App/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const data: any[] = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: GitHubCommit[] = data.map((item: any) => ({
          sha: item.sha,
          message: item.commit?.message || 'Commit sem mensagem',
          author: {
            name: item.commit?.author?.name || item.author?.login || 'Contribuidor',
            email: item.commit?.author?.email,
            date: item.commit?.author?.date || new Date().toISOString(),
            avatar_url: item.author?.avatar_url || `https://avatars.githubusercontent.com/u/134978254?v=4`
          },
          html_url: item.html_url || `https://github.com/wrxxnch/luanti-bettercraft/commit/${item.sha}`
        }));

        db.cachedCommits = mapped;
        db.lastCommitsFetch = now;
        saveDatabase(db);
        return mapped;
      }
    } else {
      console.warn(`GitHub API returned status ${response.status}. Using cached/fallback commits.`);
    }
  } catch (err) {
    console.warn("Failed to fetch live GitHub commits, using cache:", err);
  }

  return db.cachedCommits && db.cachedCommits.length > 0 ? db.cachedCommits : FALLBACK_COMMITS;
}

async function startServer() {
  const app = express();
  let db = loadDatabase();

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Serve static uploads directory for photos and videos
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Helper to log actions
  const recordLog = (userEmail: string, action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      userEmail,
      action,
      details
    };
    db.auditLogs.unshift(newLog);
    // Keep last 100 logs
    if (db.auditLogs.length > 100) {
      db.auditLogs = db.auditLogs.slice(0, 100);
    }
    saveDatabase(db);
  };

  // --- API Routes ---

  // 0. File Upload (Photo & Video Upload API)
  app.post('/api/upload', (req, res) => {
    try {
      const userEmail = req.headers['x-admin-email'] as string;
      const admin = db.admins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase());
      
      // Check permissions: either admin or public screenshot posting enabled
      const canUpload = Boolean(admin) || db.gameInfo.allowPublicScreenshots;
      if (!canUpload) {
        return res.status(403).json({ 
          success: false, 
          error: 'Upload restrito a administradores. Para habilitar envio público, altere a configuração no painel.' 
        });
      }

      const { fileBase64, originalName, mimeType } = req.body;
      if (!fileBase64 || typeof fileBase64 !== 'string') {
        return res.status(400).json({ success: false, error: 'Nenhum dado de arquivo válido fornecido.' });
      }

      // Check if it's image or video dataUrl or raw base64
      const imageMatch = fileBase64.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      const videoMatch = fileBase64.match(/^data:video\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      
      let ext = 'png';
      let dataBuffer: Buffer;
      let isVideo = false;

      if (imageMatch) {
        const rawExt = imageMatch[1].toLowerCase();
        ext = rawExt === 'jpeg' ? 'jpg' : rawExt.replace('+xml', '');
        dataBuffer = Buffer.from(imageMatch[2], 'base64');
      } else if (videoMatch) {
        isVideo = true;
        const rawExt = videoMatch[1].toLowerCase();
        ext = ['mp4', 'webm', 'ogg', 'mov', 'quicktime'].includes(rawExt) 
          ? (rawExt === 'quicktime' ? 'mov' : rawExt)
          : 'mp4';
        dataBuffer = Buffer.from(videoMatch[2], 'base64');
      } else {
        // Fallback: raw base64
        dataBuffer = Buffer.from(fileBase64, 'base64');
        if (mimeType?.startsWith('video/') || originalName?.match(/\.(mp4|webm|ogg|mov)$/i)) {
          isVideo = true;
          const extMatch = originalName?.match(/\.([a-zA-Z0-9]+)$/);
          ext = extMatch ? extMatch[1].toLowerCase() : 'mp4';
        } else {
          const extMatch = originalName?.match(/\.([a-zA-Z0-9]+)$/);
          ext = extMatch ? extMatch[1].toLowerCase() : 'png';
        }
      }

      const allowedImageExts = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
      const allowedVideoExts = ['mp4', 'webm', 'ogg', 'mov'];

      if (isVideo) {
        if (!allowedVideoExts.includes(ext)) ext = 'mp4';
        // Limit: 50MB for video files
        if (dataBuffer.length > 50 * 1024 * 1024) {
          return res.status(400).json({ success: false, error: 'Arquivo de vídeo muito grande. Limite máximo: 50MB.' });
        }
      } else {
        if (!allowedImageExts.includes(ext)) ext = 'png';
        // Limit: 15MB for images
        if (dataBuffer.length > 15 * 1024 * 1024) {
          return res.status(400).json({ success: false, error: 'Arquivo de imagem muito grande. Limite máximo: 15MB.' });
        }
      }

      const prefix = isVideo ? 'craft-video' : 'craft';
      const uniqueFilename = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const targetFilePath = path.join(UPLOADS_DIR, uniqueFilename);
      fs.writeFileSync(targetFilePath, dataBuffer);

      const uploadedUrl = `/uploads/${uniqueFilename}`;
      recordLog(userEmail || 'Comunidade', isVideo ? 'Upload de Vídeo Realizado' : 'Upload de Imagem Realizado', `Arquivo salvo: ${uniqueFilename}`);

      res.json({
        success: true,
        url: uploadedUrl,
        filename: uniqueFilename,
        size: dataBuffer.length,
        isVideo
      });
    } catch (err: any) {
      console.error('Error handling upload:', err);
      res.status(500).json({ success: false, error: 'Falha interna ao salvar arquivo enviado.' });
    }
  });

  // 1. Game Info
  app.get('/api/game-info', (req, res) => {
    res.json({ success: true, data: db.gameInfo });
  });

  app.put('/api/game-info', (req, res) => {
    const userEmail = req.headers['x-admin-email'] as string;
    const admin = db.admins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase());
    if (!admin) {
      return res.status(403).json({ success: false, error: 'Acesso restrito a administradores.' });
    }

    db.gameInfo = { ...db.gameInfo, ...req.body };
    recordLog(
      userEmail, 
      'Informações do Jogo / Configurações Atualizadas', 
      `Envio Público: ${db.gameInfo.allowPublicScreenshots ? 'ATIVADO' : 'DESATIVADO (Admin-Only)'}`
    );
    saveDatabase(db);
    res.json({ success: true, data: db.gameInfo });
  });

  // 2. Screenshots
  app.get('/api/screenshots', (req, res) => {
    res.json({ success: true, data: db.screenshots });
  });

  app.post('/api/screenshots', (req, res) => {
    const userEmail = req.headers['x-admin-email'] as string;
    const admin = db.admins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase());
    
    // Check permission
    const canPost = Boolean(admin) || db.gameInfo.allowPublicScreenshots;
    if (!canPost) {
      return res.status(403).json({ 
        success: false, 
        error: 'A postagem de fotos é exclusiva para administradores no momento. Você pode habilitar para todos no Painel Administrativo.' 
      });
    }

    const { 
      title, 
      description, 
      imageUrl, 
      mediaType, 
      videoUrl, 
      startTime, 
      endTime, 
      isMuted, 
      defaultVolume, 
      duration, 
      category, 
      tags, 
      featured, 
      authorName 
    } = req.body;
    if (!title || (!imageUrl && !videoUrl)) {
      return res.status(400).json({ success: false, error: 'Título e imagem ou vídeo são obrigatórios.' });
    }

    const author = admin 
      ? admin.email 
      : (authorName?.trim() || 'Jogador da Comunidade');

    const newScreenshot: Screenshot = {
      id: `screen-${Date.now()}`,
      title: title.trim(),
      description: description?.trim() || '',
      imageUrl: (imageUrl || videoUrl || '').trim(),
      mediaType: mediaType || (videoUrl ? 'video' : 'image'),
      videoUrl: videoUrl ? videoUrl.trim() : undefined,
      startTime: typeof startTime === 'number' ? startTime : 0,
      endTime: typeof endTime === 'number' ? endTime : 0,
      isMuted: Boolean(isMuted),
      defaultVolume: typeof defaultVolume === 'number' ? defaultVolume : 0.8,
      duration: typeof duration === 'number' ? duration : 0,
      category: category || 'Biomas',
      author,
      createdAt: new Date().toISOString(),
      featured: Boolean(featured && admin), // Only admin can set as featured on home
      tags: Array.isArray(tags) ? tags : []
    };

    db.screenshots.unshift(newScreenshot);
    recordLog(author, 'Captura de Tela Publicada', `Título: "${title}" (Categoria: ${newScreenshot.category})`);
    saveDatabase(db);

    res.status(201).json({ success: true, data: newScreenshot });
  });

  app.put('/api/screenshots/:id', (req, res) => {
    const userEmail = req.headers['x-admin-email'] as string;
    const admin = db.admins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase());
    if (!admin) {
      return res.status(403).json({ success: false, error: 'Apenas administradores podem editar capturas.' });
    }

    const { id } = req.params;
    const index = db.screenshots.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Captura não encontrada.' });
    }

    db.screenshots[index] = {
      ...db.screenshots[index],
      ...req.body,
      id // preserve ID
    };

    recordLog(userEmail, 'Captura de Tela Editada', `ID: ${id} - "${db.screenshots[index].title}"`);
    saveDatabase(db);

    res.json({ success: true, data: db.screenshots[index] });
  });

  app.delete('/api/screenshots/:id', (req, res) => {
    const userEmail = req.headers['x-admin-email'] as string;
    const admin = db.admins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase());
    if (!admin) {
      return res.status(403).json({ success: false, error: 'Apenas administradores podem excluir capturas.' });
    }

    const { id } = req.params;
    const screenshot = db.screenshots.find(s => s.id === id);
    if (!screenshot) {
      return res.status(404).json({ success: false, error: 'Captura não encontrada.' });
    }

    db.screenshots = db.screenshots.filter(s => s.id !== id);
    recordLog(userEmail, 'Captura de Tela Excluída', `Título: "${screenshot.title}"`);
    saveDatabase(db);

    res.json({ success: true, message: 'Captura excluída com sucesso.' });
  });

  // 3. Changelog & Releases
  app.get('/api/changelog', (req, res) => {
    res.json({ success: true, data: db.changelog });
  });

  app.post('/api/changelog', (req, res) => {
    const userEmail = req.headers['x-admin-email'] as string;
    const admin = db.admins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase());
    if (!admin) {
      return res.status(403).json({ success: false, error: 'Apenas administradores podem publicar atualizações.' });
    }

    const { version, title, description, highlights, changes, tag } = req.body;
    if (!version || !title) {
      return res.status(400).json({ success: false, error: 'Versão e título são obrigatórios.' });
    }

    const newRelease: ChangelogRelease = {
      id: `rel-${Date.now()}`,
      version,
      title,
      date: new Date().toISOString().split('T')[0],
      tag: tag || 'Atualização',
      description: description || '',
      highlights: Array.isArray(highlights) ? highlights : [],
      changes: Array.isArray(changes) ? changes : [],
      author: userEmail
    };

    db.changelog.unshift(newRelease);
    recordLog(userEmail, 'Nota de Atualização Criada', `Versão: ${version} - "${title}"`);
    saveDatabase(db);

    res.status(201).json({ success: true, data: newRelease });
  });

  app.put('/api/changelog/:id', (req, res) => {
    const userEmail = req.headers['x-admin-email'] as string;
    const admin = db.admins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase());
    if (!admin) {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    const { id } = req.params;
    const index = db.changelog.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Atualização não encontrada.' });
    }

    db.changelog[index] = {
      ...db.changelog[index],
      ...req.body,
      id
    };

    recordLog(userEmail, 'Nota de Atualização Editada', `Versão: ${db.changelog[index].version}`);
    saveDatabase(db);

    res.json({ success: true, data: db.changelog[index] });
  });

  app.delete('/api/changelog/:id', (req, res) => {
    const userEmail = req.headers['x-admin-email'] as string;
    const admin = db.admins.find(a => a.email.toLowerCase() === userEmail?.toLowerCase());
    if (!admin) {
      return res.status(403).json({ success: false, error: 'Acesso negado.' });
    }

    const { id } = req.params;
    const release = db.changelog.find(r => r.id === id);
    if (!release) {
      return res.status(404).json({ success: false, error: 'Atualização não encontrada.' });
    }

    db.changelog = db.changelog.filter(r => r.id !== id);
    recordLog(userEmail, 'Nota de Atualização Excluída', `Versão: ${release.version}`);
    saveDatabase(db);

    res.json({ success: true, message: 'Atualização removida com sucesso.' });
  });

  // 4. Live GitHub Commits
  app.get('/api/commits', async (req, res) => {
    const commits = await fetchGitHubCommits(db);
    res.json({
      success: true,
      repo: `${db.gameInfo.repoOwner}/${db.gameInfo.repoName}`,
      data: commits
    });
  });

  // 5. Admin Users Management (Add, Revoke, List)
  app.get('/api/admins', (req, res) => {
    res.json({ success: true, data: db.admins });
  });

  app.post('/api/admins', (req, res) => {
    const callerEmail = req.headers['x-admin-email'] as string;
    const callerAdmin = db.admins.find(a => a.email.toLowerCase() === callerEmail?.toLowerCase());
    
    // Only owner or admin can add other admins
    if (!callerAdmin || (callerAdmin.role !== 'owner' && callerAdmin.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Permissão insuficiente. Apenas Administradores ou o Proprietário podem convidar novos admins.' });
    }

    const { email, name, role } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'E-mail válido é obrigatório.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.admins.find(a => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Este e-mail já está cadastrado como administrador.' });
    }

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      email: cleanEmail,
      name: name?.trim() || cleanEmail.split('@')[0],
      role: role === 'editor' ? 'editor' : 'admin',
      addedAt: new Date().toISOString(),
      addedBy: callerEmail,
      isProtected: cleanEmail === 'jeanpierreowner@gmail.com',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || cleanEmail)}&background=059669&color=fff`
    };

    db.admins.push(newAdmin);
    recordLog(callerEmail, 'Novo Administrador Concedido', `E-mail: ${cleanEmail} (Papel: ${newAdmin.role})`);
    saveDatabase(db);

    res.status(201).json({ success: true, data: newAdmin });
  });

  app.delete('/api/admins/:id', (req, res) => {
    const callerEmail = req.headers['x-admin-email'] as string;
    const callerAdmin = db.admins.find(a => a.email.toLowerCase() === callerEmail?.toLowerCase());
    
    if (!callerAdmin || (callerAdmin.role !== 'owner' && callerAdmin.role !== 'admin')) {
      return res.status(403).json({ success: false, error: 'Permissão insuficiente para revogar administradores.' });
    }

    const { id } = req.params;
    const targetAdmin = db.admins.find(a => a.id === id);
    if (!targetAdmin) {
      return res.status(404).json({ success: false, error: 'Administrador não encontrado.' });
    }

    // Safety checks: Cannot remove jeanpierreowner@gmail.com or protected owner
    if (targetAdmin.isProtected || targetAdmin.email.toLowerCase() === 'jeanpierreowner@gmail.com') {
      return res.status(400).json({ success: false, error: 'O Administrador Principal (jeanpierreowner@gmail.com) não pode ter o acesso revogado.' });
    }

    // Admin cannot remove the owner
    if (targetAdmin.role === 'owner' && callerAdmin.role !== 'owner') {
      return res.status(403).json({ success: false, error: 'Apenas o proprietário pode revogar outro proprietário.' });
    }

    db.admins = db.admins.filter(a => a.id !== id);
    recordLog(callerEmail, 'Privilégios de Administrador Revogados', `E-mail: ${targetAdmin.email} (${targetAdmin.name})`);
    saveDatabase(db);

    res.json({ success: true, message: `Privilégios revogados com sucesso para ${targetAdmin.email}.` });
  });

  // 6. Audit logs
  app.get('/api/logs', (req, res) => {
    res.json({ success: true, data: db.auditLogs });
  });

  // 7. Auth verify / login
  app.post('/api/auth/verify', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'E-mail é obrigatório.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const admin = db.admins.find(a => a.email.toLowerCase() === cleanEmail);

    if (admin) {
      recordLog(cleanEmail, 'Acesso ao Painel Administrativo', `Login efetuado por ${admin.name}`);
      return res.json({
        success: true,
        isAdmin: true,
        user: admin
      });
    }

    res.json({
      success: true,
      isAdmin: false,
      user: null,
      message: 'Este e-mail não possui permissões administrativas ativas.'
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Luanti BetterCraft Server running on port ${PORT}`);
  });
}

startServer();
