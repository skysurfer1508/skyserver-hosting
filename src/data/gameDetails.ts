import minecraftBg from '@/assets/games/minecraft-bg.jpg';
import terrariaBg from '@/assets/games/terraria-bg.jpg';
import satisfactoryBg from '@/assets/games/satisfactory-bg.jpg';
import cs2Bg from '@/assets/games/cs2-bg.jpg';
import factorioBg from '@/assets/games/factorio-bg.jpg';
import rustBg from '@/assets/games/rust-bg.jpg';

export interface GameDetail {
  slug: string;
  name: string;
  icon: string;
  accentColor: 'green' | 'purple' | 'orange' | 'blue' | 'amber' | 'red';
  backgroundImage: string;
  tagline: string;
  seoDescription: string;
  features: { title: string; description: string }[];
  specs: { label: string; value: string }[];
  whySkyServer: string;
}

export const gameDetails: Record<string, GameDetail> = {
  minecraft: {
    slug: 'minecraft',
    name: 'Minecraft',
    icon: '⛏️',
    accentColor: 'green',
    backgroundImage: minecraftBg,
    tagline: 'Build, explore, and survive with friends on your own server.',
    seoDescription: 'Start your Free Minecraft Server today with SkyServer. Experience high-performance, DDoS-protected hosting with zero cost. Full Paper/Spigot support, plugin-ready, and instant setup.',
    features: [
      { title: 'Paper & Spigot Support', description: 'Run optimized server software with full plugin compatibility for the best performance.' },
      { title: 'Plugin Ready', description: 'Install any Bukkit, Spigot, or Paper plugin directly from the panel with one click.' },
      { title: 'Multiple Java Versions', description: 'Choose from Java 8, 11, 17, or 21 to match your modpack or server version.' },
      { title: 'Automatic Backups', description: 'Schedule automatic world backups through the Pterodactyl panel to never lose progress.' },
      { title: 'Custom World Seeds', description: 'Start your world with any seed or upload an existing world save.' },
      { title: 'Whitelist & RCON', description: 'Full server management with whitelist support and remote console access.' },
    ],
    specs: [
      { label: 'RAM', value: '2.5 GB' },
      { label: 'CPU', value: '100%' },
      { label: 'Storage', value: '10 GB SSD' },
      { label: 'DDoS Protection', value: 'Included' },
      { label: 'Players', value: 'Up to 20' },
    ],
    whySkyServer: 'SkyServer provides optimized Minecraft hosting with Paper/Spigot support, ensuring low-latency gameplay and smooth performance even with plugins. Our infrastructure is tuned for Minecraft\'s unique memory and tick-rate requirements.',
  },
  terraria: {
    slug: 'terraria',
    name: 'Terraria',
    icon: '🌳',
    accentColor: 'purple',
    backgroundImage: terrariaBg,
    tagline: 'Dig, fight, and build your way through a pixelated adventure.',
    seoDescription: 'Start your Free Terraria Server today with SkyServer. Experience high-performance, DDoS-protected hosting with zero cost. TShock support, mod-ready, and instant setup for multiplayer adventures.',
    features: [
      { title: 'TShock Support', description: 'Full TShock server support with plugin management and advanced administration tools.' },
      { title: 'Mod Compatible', description: 'Run tModLoader and your favorite Terraria mods with full compatibility.' },
      { title: 'World Size Options', description: 'Choose between Small, Medium, or Large worlds to fit your playstyle.' },
      { title: 'Auto-Save', description: 'Automatic world saving to prevent data loss during unexpected shutdowns.' },
      { title: 'Journey & Expert Mode', description: 'Support for all Terraria difficulty modes including Journey, Expert, and Master.' },
      { title: 'Cross-Platform Play', description: 'Play with friends across PC, ensuring everyone can join the fun.' },
    ],
    specs: [
      { label: 'RAM', value: '2.5 GB' },
      { label: 'CPU', value: '100%' },
      { label: 'Storage', value: '5 GB SSD' },
      { label: 'DDoS Protection', value: 'Included' },
      { label: 'Players', value: 'Up to 16' },
    ],
    whySkyServer: 'Terraria servers on SkyServer are optimized for low-latency multiplayer with TShock pre-configured. Enjoy seamless boss fights and exploration without lag spikes.',
  },
  satisfactory: {
    slug: 'satisfactory',
    name: 'Satisfactory',
    icon: '🏭',
    accentColor: 'orange',
    backgroundImage: satisfactoryBg,
    tagline: 'Construct massive factories on an alien planet with friends.',
    seoDescription: 'Start your Free Satisfactory Server today with SkyServer. Experience high-performance, DDoS-protected hosting with zero cost. Build epic factories with friends on dedicated, always-on servers.',
    features: [
      { title: 'Dedicated Server Support', description: 'Official Satisfactory dedicated server with full multiplayer support.' },
      { title: 'Save Management', description: 'Upload existing saves or start fresh. Full save file management through the panel.' },
      { title: 'Auto-Restart', description: 'Automatic server restarts to keep your factory running smoothly 24/7.' },
      { title: 'Update 1.0 Ready', description: 'Always running the latest version of Satisfactory with automatic updates.' },
      { title: 'Multi-Session', description: 'Manage multiple game sessions from the same server instance.' },
      { title: 'Admin Controls', description: 'Full server admin commands and player management tools.' },
    ],
    specs: [
      { label: 'RAM', value: '2.5 GB' },
      { label: 'CPU', value: '100%' },
      { label: 'Storage', value: '10 GB SSD' },
      { label: 'DDoS Protection', value: 'Included' },
      { label: 'Players', value: 'Up to 8' },
    ],
    whySkyServer: 'Satisfactory\'s massive factories demand reliable hosting. SkyServer provides the consistent CPU and memory performance your factory lines need to run without bottlenecks.',
  },
  cs2: {
    slug: 'cs2',
    name: 'Counter-Strike 2',
    icon: '🔫',
    accentColor: 'blue',
    backgroundImage: cs2Bg,
    tagline: 'Compete in tactical FPS action on your own private server.',
    seoDescription: 'Start your Free CS2 Server today with SkyServer. Experience high-performance, DDoS-protected hosting with zero cost. Custom game modes, RCON access, and competitive-ready infrastructure.',
    features: [
      { title: 'Custom Game Modes', description: 'Set up Competitive, Casual, Deathmatch, Wingman, or custom workshop modes.' },
      { title: 'Workshop Map Support', description: 'Load any Steam Workshop map for custom gameplay experiences.' },
      { title: 'RCON Access', description: 'Full remote console access for real-time server administration.' },
      { title: 'Anti-Cheat Ready', description: 'VAC-enabled servers to keep gameplay fair and competitive.' },
      { title: 'Custom Configs', description: 'Upload and manage server.cfg, autoexec.cfg, and game mode configs.' },
      { title: 'Low Latency', description: 'Optimized network infrastructure for competitive 128-tick gameplay.' },
    ],
    specs: [
      { label: 'RAM', value: '2.5 GB' },
      { label: 'CPU', value: '100%' },
      { label: 'Storage', value: '40 GB SSD' },
      { label: 'DDoS Protection', value: 'Included' },
      { label: 'Players', value: 'Up to 16' },
    ],
    whySkyServer: 'Competitive CS2 demands low-latency, high-tick-rate servers. SkyServer\'s DDoS-protected infrastructure ensures your matches run smoothly without interruption.',
  },
  factorio: {
    slug: 'factorio',
    name: 'Factorio',
    icon: '⚙️',
    accentColor: 'amber',
    backgroundImage: factorioBg,
    tagline: 'Automate and optimize your factory with friends.',
    seoDescription: 'Start your Free Factorio Server today with SkyServer. Experience high-performance, DDoS-protected hosting with zero cost. Mod support, save management, and always-on dedicated servers.',
    features: [
      { title: 'Full Mod Support', description: 'Install and manage Factorio mods directly through the server panel.' },
      { title: 'Save File Management', description: 'Upload, download, and manage save files with ease.' },
      { title: 'Auto-Save & Backups', description: 'Configurable auto-save intervals with backup rotation.' },
      { title: 'RCON Console', description: 'Remote console access for server commands and administration.' },
      { title: 'Headless Server', description: 'Optimized headless server for maximum performance.' },
      { title: 'Version Control', description: 'Choose between stable and experimental Factorio versions.' },
    ],
    specs: [
      { label: 'RAM', value: '2.5 GB' },
      { label: 'CPU', value: '100%' },
      { label: 'Storage', value: '5 GB SSD' },
      { label: 'DDoS Protection', value: 'Included' },
      { label: 'Players', value: 'Up to 16' },
    ],
    whySkyServer: 'Factorio\'s late-game mega-bases need strong single-thread CPU performance. SkyServer allocates dedicated resources to keep your factory UPS high even at scale.',
  },
  rust: {
    slug: 'rust',
    name: 'Rust',
    icon: '🔨',
    accentColor: 'red',
    backgroundImage: rustBg,
    tagline: 'Survive, build, and dominate in a harsh open world.',
    seoDescription: 'Start your Free Rust Server today with SkyServer. Experience high-performance, DDoS-protected hosting with zero cost. Oxide/uMod support, custom maps, scheduled wipes, and more.',
    features: [
      { title: 'Oxide / uMod Support', description: 'Full Oxide mod framework support for plugins like RustIO, Economics, and more.' },
      { title: 'Custom Maps', description: 'Upload procedural or custom maps from RustEdit and Rust Map Editor.' },
      { title: 'Scheduled Wipes', description: 'Configure automatic map and blueprint wipes on your preferred schedule.' },
      { title: 'RCON Management', description: 'Full RCON access with WebRCON support for tools like RustAdmin.' },
      { title: 'Anti-Cheat Integration', description: 'EAC-enabled servers with additional anti-cheat plugin support.' },
      { title: 'Performance Optimized', description: 'Tuned for Rust\'s demanding server requirements with priority CPU allocation.' },
    ],
    specs: [
      { label: 'RAM', value: '2.5 GB' },
      { label: 'CPU', value: '100%' },
      { label: 'Storage', value: '10 GB SSD' },
      { label: 'DDoS Protection', value: 'Included' },
      { label: 'Players', value: 'Up to 50' },
    ],
    whySkyServer: 'Rust servers are resource-hungry. SkyServer provides dedicated CPU cores and high-speed SSDs to handle Rust\'s demanding world simulation and player interactions.',
  },
};

export const getGameBySlug = (slug: string): GameDetail | undefined => {
  return gameDetails[slug];
};

export const allGameSlugs = Object.keys(gameDetails);
