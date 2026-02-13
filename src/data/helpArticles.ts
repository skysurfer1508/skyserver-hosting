import { Factory, Crosshair, Cog, Pickaxe, Shield, Skull } from 'lucide-react';

export interface HelpQuestion {
  question: string;
  answer: string;
}

export interface GameCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  questions: HelpQuestion[];
}

export const gameCategories: GameCategory[] = [
  {
    id: 'satisfactory',
    label: 'Satisfactory',
    icon: Factory,
    questions: [
      {
        question: 'Why do players get disconnected with a timeout error after loading?',
        answer: `**Root Cause:** By default, the client connection timeout is only 30 seconds. For large worlds or slow connections, this is often not enough, resulting in a "Client disconnected for Timeout" error.

**Solution:** Navigate to the folder \`/FactoryGame/Saved/Config/LinuxServer/\` (Linux) or \`/FactoryGame/Saved/Config/WindowsServer/\` (Windows) using the File Manager in your Panel. Open \`Engine.ini\` and add or modify the following lines under \`[/Script/OnlineSubsystemUtils.IpNetDriver]\`:

\`\`\`
InitialConnectTimeout=300.0
ConnectionTimeout=300.0
\`\`\`

This increases the connection timeout to 300 seconds. Save the file and restart the server.`,
      },
      {
        question: 'My Satisfactory server crashes or shows "Out of Memory". Why?',
        answer: `**Root Cause:** Satisfactory servers require a large amount of RAM. Large factories, many players, or memory leaks can increase memory usage. If the container is not allocated enough memory, the server will crash with an OOM error.

**Solution:** In your Panel under "Build Settings", ensure the Docker container has at least **8–16 GB of RAM** allocated (depending on player count). You can also set a RAM limit via the \`-maxMemory\` startup variable (if supported by your egg). Avoid additional container memory caps. If the server still crashes despite sufficient resources, enable swap or add more physical RAM. You can also lower the tick rate in \`GameUserSettings.ini\` (default 30 → e.g. 20) to reduce server load. If the server fails to start after a minute or shows excessive memory usage, verify all mods are up-to-date and free of memory leaks.`,
      },
      {
        question: 'Why do I get a "Network Error" when the game saves?',
        answer: `**Root Cause:** By default, a server autosave has a maximum duration of 30 seconds. For large worlds, saving can take longer, which triggers a network timeout.

**Solution:** In addition to the timeout settings from the first entry, you can adjust the autosave configuration. Connect to the server console and run:

\`\`\`
FG.AutosaveInterval 600
\`\`\`

Here, \`600\` is the interval in seconds (10 minutes). This reduces save frequency. You can also increase \`mNumRotatingAutosaves\` in \`Engine.ini\` under \`[/Script/FactoryGame.FGSaveSession]\` to create more backup slots. Restart the server afterwards.`,
      },
      {
        question: 'Why does the tick rate drop and cause a timeout when deleting blueprints?',
        answer: `**Root Cause:** A known bug in Satisfactory can cause tick timeouts when deleting corrupted blueprints or mass-deconstructing machines. The \`NetServerMaxTickRate\` defines the limit for server updates; if a single operation takes too long, the engine throws a timeout.

**Solution:** First, check for and remove any corrupted blueprints (e.g., via admin console commands or by loading a backup). You can also adjust the tick rate by adding \`NetServerMaxTickRate=20\` in \`Engine.ini\` under \`[/Script/OnlineSubsystemUtils.IpNetDriver]\`. This caps the tick rate at 20 Hz. Make sure to remove all affected structures before changing settings, then restart the server. If the issue persists, it may require a game patch to fully resolve.`,
      },
      {
        question: 'How do I prevent the server from crashing under high memory load?',
        answer: `**Root Cause:** Satisfactory automatically loads many resources even if the server has plenty of RAM allocated. The engine may still report Out-of-Memory even when actual usage is low.

**Solution:** Ensure the server container is not limited by other services on the host. Disable unnecessary server processes or enable Docker swap. At startup, you can specify additional parameters like \`-maxMemory 16GB\` (depending on egg support). Check host logs (\`dmesg\`, \`journalctl\`) to confirm sufficient RAM is available. As a workaround, some admins set up scheduled restarts (e.g., every few hours) to minimize the impact of memory leaks.`,
      },
    ],
  },
  {
    id: 'cs2',
    label: 'CS2',
    icon: Crosshair,
    questions: [
      {
        question: 'Why does my server not appear in the server browser?',
        answer: `**Root Cause:** Counter-Strike 2 requires a Steam **Game Server Login Token (GSLT)** for your server to appear in the public browser. Without a valid GSLT, other players cannot see or join your server.

**Solution:** Obtain a token at [Steam Game Server Account Management](https://steamcommunity.com/dev/managegameservers) using App ID **730** for CS2. Copy the generated key and enter it in your Panel (usually under "Steam Game Server Login Token" or the startup variable \`GSLT_TOKEN\`). Save and restart the server. Your server should now appear in the public server list.`,
      },
      {
        question: 'How do I set up my RCON password and connect via RCON?',
        answer: `**Root Cause:** CS2 uses RCON for remote server management, just like CS:GO. If no password is set or it was entered incorrectly, the RCON connection will fail.

**Solution:** Open the directory \`/csgo/cfg/\` on your server via FTP or the File Manager. Edit (or create) the file \`server.cfg\` and add the following line:

\`\`\`
rcon_password YourRCONPassword
\`\`\`

Save the file. If your Panel has a dedicated RCON field, enter the same password there. Restart the server. You can then connect via the CS2 console by typing \`rcon_password YourRCONPassword\` followed by \`rcon <command>\`.`,
      },
      {
        question: 'Do I really need a GSLT even though CS2 currently works without one?',
        answer: `**Root Cause:** While CS2 does not currently enforce a strict token check, Valve will make it mandatory as they did with CS:GO. Without a token, your server will remain invisible and may be taken offline due to missing authentication.

**Solution:** Create a GSLT proactively (see first entry) and enter it now to avoid any interruption in gameplay. This is also necessary for your dedicated CS2 server to properly communicate with Steam services.`,
      },
      {
        question: 'RCON stopped working after a server update. What do I do?',
        answer: `**Root Cause:** After updates, the RCON system in CS2 can change. Often the password is now only managed through the Panel settings, and manual configuration via console or config files may block the server from starting.

**Solution:** Remove all manual RCON set commands from \`server.cfg\` or startup arguments. Set the password exclusively in your Panel under "Security" → "Enable RCON / Set Password" (if available). Alternatively, start the server once without RCON, then open the Panel console and let the system generate a random password. Note the generated password from the log. From now on, always manage RCON through the Panel interface.`,
      },
      {
        question: 'Can I execute console commands via RCON?',
        answer: `**Root Cause:** Yes — RCON is specifically designed for remote administration of CS2 servers. However, access requires a properly configured password.

**Solution:** Once the RCON password is set, open the CS2 console (\`~\` key) and enter:

\`\`\`
rcon_password YourRCONPassword
\`\`\`

You can then send commands, e.g. \`rcon changelevel de_dust2\`. You can also use tools like HLSW or RustAdmin by entering your server IP and RCON password when connecting. This lets you issue any admin command remotely.`,
      },
    ],
  },
  {
    id: 'factorio',
    label: 'Factorio',
    icon: Cog,
    questions: [
      {
        question: 'Why won\'t my server load my world even though I uploaded the correct save file?',
        answer: `**Root Cause:** The save file name must **exactly match** what is configured in the server settings. Factorio expects a \`.zip\` file in the \`saves\` folder with the same name specified in the startup options. Differences in capitalization or a missing \`.zip\` extension will cause the server to not find the world.

**Solution:** Stop the server. Using the File Manager or SFTP, navigate to the \`/saves/\` directory. Upload your world file, e.g. \`MyWorld.zip\`. Make sure the name has **no spaces** and matches what is set in \`SAVE_NAME\` in your startup variables — **without** the \`.zip\` extension. Example: If your file is \`MyWorld.zip\`, set \`SAVE_NAME=MyWorld\`. Then restart the server.`,
      },
      {
        question: 'The server generates a new map instead of loading my uploaded save. What\'s wrong?',
        answer: `**Root Cause:** If \`LOAD_LATEST_SAVE\` is set to \`true\` or if \`SAVE_NAME\` is missing or incorrect, the server will automatically create a new world. Often the parameter \`GENERATE_NEW_SAVE\` is active.

**Solution:** In your startup variables, ensure \`LOAD_LATEST_SAVE=false\` and \`GENERATE_NEW_SAVE=false\`. Enter the exact name of your \`.zip\` file (without the extension) in the \`SAVE_NAME\` field. Stop and restart the server so it loads the existing world. Use the File Manager to verify the file exists under \`/saves/\`.`,
      },
      {
        question: 'Can I swap the save file while the server is running?',
        answer: `**Root Cause:** Factorio writes the current state to the save zip when stopping. A swap during runtime will not be detected automatically.

**Solution:** Stop the server completely. Then upload a new \`.zip\` file to the \`/saves/\` directory using the File Manager (or delete the old file and rename the new one). Adjust \`SAVE_NAME\` if necessary. Restart the server — it will read the new save on startup. Avoid modifying the file during runtime as this can cause corruption.`,
      },
      {
        question: 'Why doesn\'t RCON work on my Factorio server?',
        answer: `**Root Cause:** Factorio does not have a built-in RCON system like CS2. Instead, it uses its own admin token mechanism.

**Solution:** Open the file \`config/rconpw\` or generate a password using:

\`\`\`
cat /dev/urandom | tr -dc A-Za-z0-9 | head -c 16 > config/rconpw
\`\`\`

Make sure the \`RCON_PASSWORD\` environment variable or the corresponding Panel startup field is set to this value. Restart the server. You can then connect with an RCON client like \`mcrcon\` on the default RCON port (usually 27015).`,
      },
      {
        question: 'How do I install mods on my Factorio server?',
        answer: `**Root Cause:** Mods must be placed in the correct directory and registered in the mod configuration files. If they are not listed in \`mod-list.json\`, they will be ignored.

**Solution:** Upload the mod files (\`.zip\`) via FTP to the \`/mods/\` directory. In \`mods/mod-list.json\`, add entries with \`"name"\` and \`"enabled": true\` for each mod. Alternatively, use the \`--mod=ModName\` server option under "Startup". Restart the server. Make sure the mod version matches your server version. For troubleshooting, refer to the official [Factorio Wiki](https://wiki.factorio.com/Configuration_file).`,
      },
    ],
  },
  {
    id: 'minecraft',
    label: 'Minecraft',
    icon: Pickaxe,
    questions: [
      {
        question: 'Why does my Minecraft Java server crash immediately on startup?',
        answer: `**Root Cause:** Most commonly, this is caused by using the wrong Java version or an incompatible server JAR. Starting with Minecraft 1.18, the server requires at least **Java 17**. A mismatch between mods/plugins and the game version also causes crashes.

**Solution:** Check your Panel under "Startup Options" to ensure the correct Java version is selected. Enable Java 17 by setting the environment variable (e.g. \`SERVER_JAVA_PATH\`) to the newer JRE. Upload the correct server JAR (Vanilla, Spigot, Paper, or Forge) for your MC version to \`/server/\`. Verify that all plugins/mods are compatible with your version. Save and restart — the server should now boot without Java version errors.`,
      },
      {
        question: 'Why does the server lag heavily when players explore new areas?',
        answer: `**Root Cause:** By default, Minecraft generates new chunks on-the-fly, which creates significant CPU and memory load — especially when many players travel far from spawn.

**Solution:** Pre-generate the map before players explore it. Install a plugin like **Chunky** or **WorldBorder** and use commands like \`/chunky radius 5000\` then \`/chunky start\` to pre-generate terrain around spawn. Alternatively, reduce \`view-distance\` in \`server.properties\` (e.g., to 6–8). Restart the server afterwards. This distributes the computational load to startup and reduces lag spikes during gameplay.`,
      },
      {
        question: 'My server is constantly overloaded. Could the world size be the issue?',
        answer: `**Root Cause:** With an unlimited seed, the world grows indefinitely. The more chunks that are loaded, the higher the resource usage.

**Solution:** Use the **WorldBorder** plugin to set a boundary (\`/wb set <radius>\` + \`/wb fill\`). Check server performance with \`/tps\` in the console. If necessary, stop the server, delete the world files (in the \`world/\` directory), and restart with a limited world size. You can also set \`max-build-height\` and use \`level-name\` in startup settings to control the world.`,
      },
      {
        question: 'Why does the Bedrock server crash for certain players?',
        answer: `**Root Cause:** Bedrock Edition is more sensitive to client version mismatches. The server and client must run the same major version, otherwise connection drops will occur.

**Solution:** Ensure your Bedrock server uses \`version=latest\` (or a specific matching version) in the startup settings. If players on older devices have issues, either provide a matching server version or use a protocol translator plugin (e.g., via GeyserMC) to support multiple versions. Otherwise, all players must update to the same version.`,
      },
      {
        question: 'How can I fix memory or performance issues?',
        answer: `**Root Cause:** Standard Java servers without optimized GC settings or proper RAM allocation run suboptimally. Too many processes or a high view-distance cause lag.

**Solution:** Add **Java flags** to your startup string: e.g. \`-Xms2G -Xmx4G\` to set RAM bounds, and \`-XX:+UseG1GC\` for efficient garbage collection. In \`server.properties\`, reduce \`view-distance\` and set \`max-tick-time=60000\`. Disable \`spawn-animals\` and \`spawn-npcs\` if not needed. Use a performance-optimized server JAR (Paper instead of Spigot or Vanilla). Restart the server to apply changes.`,
      },
    ],
  },
  {
    id: 'rust',
    label: 'Rust',
    icon: Shield,
    questions: [
      {
        question: 'How do I set myself as admin on my Rust server?',
        answer: `**Root Cause:** Rust requires adding a Steam64 ID via the \`ownerid\` command — simply editing a file manually is not sufficient while the server is running.

**Solution:** Open the **Console** in your Panel (or connect via RCON) and type:

\`\`\`
ownerid <Steam64_ID> YourNickname "Reason"
server.writecfg
\`\`\`

Replace \`<Steam64_ID>\` with your numeric Steam ID (find it at steamid.io). The \`server.writecfg\` command saves the change permanently. Alternatively, you can edit the file \`/server/oxide/config/users.cfg\` (if using Oxide) or \`/server/<server_id>/users.cfg\` and add the same line. After a server restart, you will have admin privileges (visible as an \`[Admin]\` tag in-game).`,
      },
      {
        question: 'What is the difference between a map wipe and a blueprint wipe?',
        answer: `**Root Cause:** A **map wipe** regenerates the entire world (all monuments, resources, ores are reset) but keeps learned blueprints. A **blueprint wipe** keeps player builds and inventories intact but **deletes all learned blueprints**, requiring players to research them again.

**Solution:**
- **Map Wipe:** Stop the server and delete the files in the \`server/<server_id>/\` directory. The server will generate a fresh map on restart.
- **Blueprint Wipe:** Stop the server and delete the \`UserPersistence.db\` file in the same directory.

After a map wipe, players spawn fresh but keep their tech progress. After a blueprint wipe, all blueprints must be re-learned but buildings remain. **Always create a backup before wiping!**`,
      },
      {
        question: 'I added my Steam ID to users.cfg but don\'t have admin rights. Why?',
        answer: `**Root Cause:** Changes to \`users.cfg\` only take effect after a server restart. Editing the file while the server is running has no immediate effect.

**Solution:** Make sure the server has been restarted after editing \`/server/.../users.cfg\`. Alternatively, use the \`ownerid\` command in the live console (as described above), followed by \`server.writecfg\` to save. On the next restart, Rust will read the file and grant admin rights automatically.`,
      },
      {
        question: 'Why does my Rust server start with old map data after a wipe?',
        answer: `**Root Cause:** Not all files were removed during the wipe. The map file and the \`identity\` folder control whether the server generates a new world.

**Solution:** Stop the server and check the file manager. For a **full wipe**, delete the entire \`server/<server_id>/\` folder, including the \`.sav\` file and \`identity\` directory. For a **map-only wipe**, delete just the \`.sav\` file in the saves folder. For a **blueprint-only wipe**, delete only \`UserPersistence.db\`. Restart the server — it will create a fresh world based on your settings.`,
      },
    ],
  },
  {
    id: 'ark',
    label: 'ARK',
    icon: Skull,
    questions: [
      {
        question: 'How do I install mods on my ARK server?',
        answer: `**Root Cause:** ARK mods are loaded via Workshop IDs. The IDs must be entered correctly and **separated by commas** in the server startup parameters. Incorrect formatting will prevent the mod from loading.

**Solution:** Find the Workshop ID from the mod's Steam Workshop page URL (e.g. \`731604991\`). In your Panel under "Startup Variables", locate the **MOD_ID** field. Enter all required IDs separated by commas **without spaces**:

\`\`\`
MOD_ID=731604991,856485113,654975668
\`\`\`

Some Panels use \`ActiveMods\` and \`GameModIds\` in startup options, e.g.:
\`-automanagemods -GameModIds=731604991,856485113?ActiveMods=731604991,856485113\`

Save and restart the server. ARK will automatically download and load the mods on startup.`,
      },
      {
        question: 'How do I enable crossplay for Epic Games players?',
        answer: `**Root Cause:** By default, ARK servers only accept Steam players. For cross-platform play, the \`-crossplay\` startup parameter must be set. Without it, Epic Games players cannot join.

**Solution:** Go to your Panel's **Additional Arguments** field (often labeled "ARGS" or similar). Add \`-crossplay\` (note the leading hyphen). You can append more parameters with spaces, e.g. \`-crossplay -ActiveEvent\`. Save and restart the server. Your ARK server will now run in crossplay mode and accept Epic Games clients.`,
      },
      {
        question: 'My mods are not loading. What am I doing wrong?',
        answer: `**Root Cause:** Typically caused by typos, incorrect commas, unauthorized mods, or the "Auto-manage Mods" option not being enabled.

**Solution:** Verify all mod IDs are correct and comma-separated without spaces. Enable the mod auto-management option in your Panel (often a checkbox like "Enable Mods"). A correct startup example:

\`\`\`
-automanagemods -serverModIds=731604991,856485113?ActiveMods=731604991,856485113
\`\`\`

Adjust the mod parameter under "Startup" accordingly. If needed, edit \`Game.ini\` with \`[ModInstaller] ModIDS=...\` (one ID per line) and add \`-automanagemods\` as a startup parameter. Restart — ARK will re-download the Workshop files on boot.`,
      },
      {
        question: 'Can I use multiple startup parameters at the same time?',
        answer: `**Root Cause:** ARK requires all additional startup arguments (crossplay, mods, maps, etc.) to be placed in a single line, separated by spaces.

**Solution:** In the Panel's additional arguments field (ARGS), write all flags in one line:

\`\`\`
-crossplay -NoBattlEye -DLCMap=ScorchedEarth
\`\`\`

Make sure each parameter starts with \`-\` and is separated by a space. Save and restart the server.`,
      },
    ],
  },
];
