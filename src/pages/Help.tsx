import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Rocket, FolderOpen, Shield, Wrench, Server, Users, Upload, Puzzle, Database, HardDrive, Clock, AlertTriangle, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'getting-started' | 'file-management' | 'automation' | 'advanced';
  icon: React.ElementType;
}

const articles: Article[] = [
  // Getting Started
  {
    id: 'connect-server',
    title: 'How to Connect to your Server',
    summary: 'Learn how to join your game server using the IP address from your dashboard.',
    content: `**Step-by-Step Guide:**

1. Go to your **Dashboard** and copy the 'Server Address' (IP:Port).
2. Open your game (e.g., Minecraft).
3. Click **Multiplayer** → **Direct Connect**.
4. Paste the address and click **Join Server**.

**Note:** If the server is offline, click 'Start' in the Panel first. It may take 30-60 seconds for the server to fully boot up.`,
    category: 'getting-started',
    icon: Server,
  },
  {
    id: 'sub-users',
    title: 'Inviting Friends (Sub-Users)',
    summary: 'Give your friends access to help manage your server with custom permissions.',
    content: `**Manage your server together!**

1. Log in to the **Game Panel**.
2. Go to **'Users'** → **'New User'**.
3. Enter your friend's email address.
4. Select permissions they should have:
   - **Control Console** - Start, stop, restart the server
   - **Read/Write Files** - Upload and edit files
   - **Create Backups** - Make server backups

They will receive an email to set their password and can then access the panel.`,
    category: 'getting-started',
    icon: Users,
  },
  // File Management
  {
    id: 'sftp',
    title: 'Using SFTP for Large Files',
    summary: 'Upload modpacks and world files over 100MB using SFTP clients.',
    content: `**For modpacks or world uploads (>100MB), use SFTP.**

1. Download **'FileZilla'** or **'WinSCP'** (free).
2. In the Panel, go to **Settings** → **SFTP Details**.
3. Enter the connection details:
   - **Host:** Server Address from SFTP Details
   - **Username:** Your Panel Username
   - **Password:** Your Panel Password
   - **Port:** Usually 2022
4. Click **Connect**.
5. Drag & drop files from your computer to the server.

**Tip:** SFTP is much faster than the browser uploader for large files!`,
    category: 'file-management',
    icon: Upload,
  },
  {
    id: 'mods-plugins',
    title: 'Installing Mods & Plugins',
    summary: 'Add new features to your server with mods or plugins.',
    content: `**Enhance your server with mods or plugins!**

1. Download the mod/plugin (**.jar** file) from a trusted source.
2. Go to the **'File Manager'** tab in your Panel.
3. Open the correct folder:
   - **Forge/Fabric:** \`mods\` folder
   - **Spigot/Paper:** \`plugins\` folder
4. Drag the .jar file into the browser window.
5. **Restart** the server (not just reload).

**Important:** Make sure the mod/plugin version matches your server version!`,
    category: 'file-management',
    icon: Puzzle,
  },
  // Automation & Safety
  {
    id: 'backups',
    title: 'Creating & Restoring Backups',
    summary: 'Protect your world data with automatic and manual backups.',
    content: `**Never lose your progress!**

**Creating a Backup:**
1. Go to the **'Backups'** tab.
2. Click **'Create Backup'**.
3. (Optional) Click the lock icon to prevent auto-deletion.

**Restoring a Backup:**
1. Find the backup you want to restore.
2. Click the three dots (**...**) next to it.
3. Select **'Restore'**.

⚠️ **WARNING:** Restoring a backup **overwrites all current files**. Create a backup of your current state first if needed!`,
    category: 'automation',
    icon: HardDrive,
  },
  {
    id: 'auto-restart',
    title: 'Setting up Auto-Restarts',
    summary: 'Keep your server running smoothly with scheduled restarts.',
    content: `**Keep your server lag-free with daily restarts!**

1. Go to **'Schedules'** → **'Create Schedule'**.
2. Name it **'Daily Restart'**.
3. Set the time (24-hour format):
   - **Minute:** \`0\`
   - **Hour:** \`4\` (4:00 AM - low traffic time)
4. Click the new schedule → **'New Task'**.
5. Configure the task:
   - **Action:** 'Send Power Action'
   - **Payload:** 'Restart'
6. Click **Submit**.

**Pro Tip:** Add a 'Send Command' task before restart to warn players: \`say Server restarting in 1 minute!\``,
    category: 'automation',
    icon: Clock,
  },
  // Advanced
  {
    id: 'reading-logs',
    title: "Server Won't Start? (Reading Logs)",
    summary: 'Diagnose and fix common server crashes by reading error logs.',
    content: `**If your server crashes, check the logs!**

1. Go to the **'Console'** tab.
2. Scroll up to find **red error text**.

**Common Issues & Fixes:**

🔴 **"EULA not accepted"**
→ Go to File Manager → Open \`eula.txt\` → Change \`eula=false\` to \`eula=true\`

🔴 **"Java Version Mismatch"**
→ Go to Startup → Change the Docker Image to match your game version (e.g., Java 17 for MC 1.18+)

🔴 **"Port already in use"**
→ Contact support - this is a server-side issue

🔴 **"Out of Memory"**
→ Check if you're running too many plugins/mods`,
    category: 'advanced',
    icon: AlertTriangle,
  },
  {
    id: 'database',
    title: 'Creating a Database',
    summary: 'Set up MySQL databases for plugins like LuckPerms or CoreProtect.',
    content: `**For plugins that need a database (LuckPerms, CoreProtect, etc.):**

1. Go to the **'Databases'** tab → **'New Database'**.
2. Name it something descriptive (e.g., \`luckperms\`).
3. Copy the connection details:
   - **Endpoint** (host:port)
   - **JDBC Connection String**
   - **Username** and **Password**

4. Open your plugin's \`config.yml\` and paste the details:

\`\`\`yaml
storage-method: mysql
data:
  address: [ENDPOINT]
  database: [DATABASE_NAME]
  username: [USERNAME]
  password: [PASSWORD]
\`\`\`

5. Restart the server.`,
    category: 'advanced',
    icon: Database,
  },
  {
    id: 'optimization',
    title: 'Optimizing Server RAM & Java Version',
    summary: 'Fix lag issues by adjusting RAM allocation and Java settings.',
    content: `**Experiencing lag? Optimize your server!**

**Step 1: Check Java Version**
1. Go to the **'Startup'** tab.
2. Ensure your **Docker Image** matches your game:
   - Minecraft 1.17+: Java 17
   - Minecraft 1.16: Java 11
   - Minecraft 1.12: Java 8

**Step 2: Review Startup Variables**
- Look for variables like \`MEMORY\` or \`MAX_MEMORY\`
- Ensure they're set appropriately for your plan

**Step 3: JVM Flags (Advanced)**
For Paper/Spigot servers, use Aikar's flags in the startup command for better garbage collection.

**Quick Wins:**
- Reduce view-distance in \`server.properties\`
- Use Paper instead of Spigot
- Remove unused plugins`,
    category: 'advanced',
    icon: Cpu,
  },
];

const categoryInfo = {
  'getting-started': { label: 'Getting Started', icon: Rocket, color: 'text-emerald-400' },
  'file-management': { label: 'File Management', icon: FolderOpen, color: 'text-blue-400' },
  'automation': { label: 'Automation & Safety', icon: Shield, color: 'text-amber-400' },
  'advanced': { label: 'Advanced', icon: Wrench, color: 'text-violet-400' },
};

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const query = searchQuery.toLowerCase();
    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(query) ||
        article.summary.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const groupedArticles = useMemo(() => {
    const groups: Record<string, Article[]> = {
      'getting-started': [],
      'file-management': [],
      'automation': [],
      'advanced': [],
    };
    filteredArticles.forEach((article) => {
      groups[article.category].push(article);
    });
    return groups;
  }, [filteredArticles]);

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    return content.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <p key={i} className="font-semibold text-foreground mt-4 mb-2">
            {line.replace(/\*\*/g, '')}
          </p>
        );
      }
      // Bold text inline
      if (line.includes('**')) {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="text-muted-foreground mb-1">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="text-foreground">{part.replace(/\*\*/g, '')}</strong>;
              }
              return part;
            })}
          </p>
        );
      }
      // Code blocks
      if (line.startsWith('```')) {
        return null;
      }
      if (line.includes('`')) {
        const parts = line.split(/(`[^`]+`)/g);
        return (
          <p key={i} className="text-muted-foreground mb-1">
            {parts.map((part, j) => {
              if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={j} className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-sm">{part.replace(/`/g, '')}</code>;
              }
              return part;
            })}
          </p>
        );
      }
      // Warning emoji lines
      if (line.startsWith('⚠️') || line.startsWith('🔴')) {
        return (
          <p key={i} className="text-amber-400 mt-2 mb-1">
            {line}
          </p>
        );
      }
      // Empty lines
      if (!line.trim()) {
        return <br key={i} />;
      }
      // Regular text
      return (
        <p key={i} className="text-muted-foreground mb-1">
          {line}
        </p>
      );
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1
              className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-primary glow-text-primary">SkyServer</span> Help Center
            </motion.h1>
            <motion.p
              className="mt-4 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Find answers to common questions and learn how to get the most out of your server.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              className="mt-8 relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base bg-card border-border"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          {Object.entries(groupedArticles).map(([category, categoryArticles]) => {
            if (categoryArticles.length === 0) return null;
            const info = categoryInfo[category as keyof typeof categoryInfo];
            const CategoryIcon = info.icon;

            return (
              <div key={category} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn('p-2 rounded-lg bg-card border border-border', info.color)}>
                    <CategoryIcon className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold font-display">{info.label}</h2>
                  <Badge variant="secondary" className="ml-2">
                    {categoryArticles.length} {categoryArticles.length === 1 ? 'article' : 'articles'}
                  </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryArticles.map((article, index) => {
                    const ArticleIcon = article.icon;
                    return (
                      <motion.div
                        key={article.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ y: -5 }}
                      >
                        <Card
                          className="gaming-card border-border/50 cursor-pointer transition-all duration-300 hover:border-primary/50 h-full"
                          onClick={() => setSelectedArticle(article)}
                          style={{ boxShadow: 'none' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(99, 102, 241, 0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                <ArticleIcon className="h-5 w-5" />
                              </div>
                              <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.summary}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try a different search term or browse our categories above.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Article Modal */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <selectedArticle.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className={categoryInfo[selectedArticle.category].color}>
                    {categoryInfo[selectedArticle.category].label}
                  </Badge>
                </div>
                <DialogTitle className="text-2xl">{selectedArticle.title}</DialogTitle>
                <DialogDescription className="text-base">
                  {selectedArticle.summary}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 prose prose-invert max-w-none">
                {renderContent(selectedArticle.content)}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
