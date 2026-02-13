import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useServerRequest } from '@/hooks/useServerRequest';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useGameLimits, GameName } from '@/hooks/useGameLimits';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { MinecraftConfigForm, MinecraftConfig } from '@/components/dashboard/MinecraftConfigForm';
import { TerrariaConfigForm, TerrariaConfig } from '@/components/dashboard/TerrariaConfigForm';
import { SatisfactoryConfigForm, SatisfactoryConfig } from '@/components/dashboard/SatisfactoryConfigForm';
import { CS2ConfigForm, CS2Config } from '@/components/dashboard/CS2ConfigForm';
import { FactorioConfigForm, FactorioConfig } from '@/components/dashboard/FactorioConfigForm';
import { RustConfigForm, RustConfig } from '@/components/dashboard/RustConfigForm';
import { cn } from '@/lib/utils';

type GameType = 'minecraft' | 'terraria' | 'satisfactory' | 'cs2' | 'factorio' | 'rust';
type ServerConfig = MinecraftConfig | TerrariaConfig | SatisfactoryConfig | CS2Config | FactorioConfig | RustConfig;

const gameOptions: { value: GameType; label: string; icon: string }[] = [
  { value: 'minecraft', label: 'Minecraft', icon: '⛏️' },
  { value: 'terraria', label: 'Terraria', icon: '🌳' },
  { value: 'satisfactory', label: 'Satisfactory', icon: '🏭' },
  { value: 'cs2', label: 'Counter-Strike 2', icon: '🔫' },
  { value: 'factorio', label: 'Factorio', icon: '⚙️' },
  { value: 'rust', label: 'Rust', icon: '🔥' },
];

interface ServerRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedGame?: GameName;
}

export function ServerRequestModal({ open, onOpenChange, preSelectedGame }: ServerRequestModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createRequest, hasActiveRequest, refetch } = useServerRequest();
  const { settings } = useSystemSettings();
  const { gameLimits } = useGameLimits();
  const { toast } = useToast();

  const [selectedGame, setSelectedGame] = useState<GameType | ''>('');
  const [serverName, setServerName] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [description, setDescription] = useState('');
  const [serverConfig, setServerConfig] = useState<Partial<ServerConfig>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set pre-selected game when modal opens
  useEffect(() => {
    if (open && preSelectedGame) {
      setSelectedGame(preSelectedGame);
    }
  }, [open, preSelectedGame]);

  const resetForm = () => {
    setSelectedGame('');
    setServerName('');
    setDiscordUsername('');
    setDescription('');
    setServerConfig({});
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  // If user is not logged in, redirect to register
  useEffect(() => {
    if (open && !user) {
      onOpenChange(false);
      toast({
        title: 'Account Required',
        description: 'Please create an account to request a server.',
      });
      navigate('/register');
    }
  }, [open, user, navigate, onOpenChange, toast]);

  const getGameLimit = (gameName: GameType) => {
    return gameLimits.find((l) => l.game_name === gameName);
  };

  const isGameAvailable = (gameName: GameType) => {
    const limit = getGameLimit(gameName);
    if (!limit) return true;
    return limit.is_active && !limit.is_full;
  };

  const getGameAvailabilityText = (gameName: GameType) => {
    const limit = getGameLimit(gameName);
    if (!limit) return '';
    if (!limit.is_active) return 'Unavailable';
    if (limit.is_full) return 'Sold Out';
    if (limit.available_slots <= 2) return `Only ${limit.available_slots} left!`;
    return `${limit.available_slots} slots available`;
  };

  const validateForm = (): string | null => {
    if (!selectedGame) return 'Please select a game.';
    if (!serverName.trim()) return 'Please enter a server name.';
    if (!discordUsername.trim()) return 'Please enter your Discord username.';

    const limit = getGameLimit(selectedGame as GameType);
    if (limit && !limit.is_active) return 'This game is currently unavailable.';
    if (limit && limit.is_full) return 'This game has no available slots.';

    if (selectedGame === 'minecraft') {
      const config = serverConfig as Partial<MinecraftConfig>;
      if (!config.edition) return 'Please select a Minecraft edition.';
      if (!config.software) return 'Please select server software.';
      if (!config.version?.trim()) return 'Please enter a Minecraft version.';
      if (!config.eula_accepted) return 'You must accept the Minecraft EULA.';
    }

    if (selectedGame === 'terraria') {
      const config = serverConfig as Partial<TerrariaConfig>;
      if (!config.software) return 'Please select Terraria software.';
      if (!config.world_size) return 'Please select a world size.';
      if (!config.difficulty) return 'Please select a difficulty.';
    }

    if (selectedGame === 'satisfactory') {
      const config = serverConfig as Partial<SatisfactoryConfig>;
      if (!config.branch) return 'Please select a Satisfactory branch.';
    }

    if (selectedGame === 'cs2') {
      const config = serverConfig as Partial<CS2Config>;
      if (!config.game_mode) return 'Please select a CS2 game mode.';
    }

    if (selectedGame === 'factorio') {
      const config = serverConfig as Partial<FactorioConfig>;
      if (!config.save_name?.trim()) return 'Please enter a save name.';
      if (!config.visibility) return 'Please select visibility.';
    }

    if (selectedGame === 'rust') {
      const config = serverConfig as Partial<RustConfig>;
      if (!config.map_size) return 'Please select a map size.';
      if (!config.wipe_schedule) return 'Please select a wipe schedule.';
    }

    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      toast({
        title: 'Missing information',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error: submitError } = await createRequest(
      selectedGame as GameType,
      serverName.trim(),
      discordUsername.trim(),
      description.trim() || null,
      { ...serverConfig }
    );
    setIsSubmitting(false);

    if (submitError) {
      toast({
        title: 'Request Failed',
        description: submitError.message || '⚠️ Sync Issue: Please open a ticket on Discord.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: '✅ Request sent successfully!',
      description: 'Your server request has been submitted for approval.',
    });
    handleClose();
    refetch();
  };

  const handleGameChange = (game: GameType) => {
    setSelectedGame(game);
    setServerConfig({});
  };

  // Check if user can request
  const canRequest = !settings?.maintenance_mode && !hasActiveRequest;

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gaming-card border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Request a Server</DialogTitle>
          <DialogDescription>
            Fill in the details below to request your game server
          </DialogDescription>
        </DialogHeader>

        {!canRequest ? (
          <div className="py-6 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-warning mb-4" />
            <p className="text-muted-foreground">
              {settings?.maintenance_mode
                ? 'Server requests are disabled during maintenance.'
                : 'You already have an active server request.'}
            </p>
            <Button className="mt-4" onClick={handleClose}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* Game Selection */}
              <div className="space-y-2">
                <Label>Game *</Label>
                <Select
                  value={selectedGame}
                  onValueChange={(value) => handleGameChange(value as GameType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent>
                    {gameOptions.map((game) => {
                      const limit = getGameLimit(game.value);
                      const available = isGameAvailable(game.value);
                      
                      return (
                        <SelectItem 
                          key={game.value} 
                          value={game.value}
                          disabled={!available}
                        >
                          <span className="flex items-center gap-2">
                            <span>{game.icon}</span>
                            <span className={cn(!available && 'text-muted-foreground')}>
                              {game.label}
                            </span>
                            {limit && (
                              <span className={cn(
                                'ml-auto text-xs',
                                !limit.is_active || limit.is_full
                                  ? 'text-destructive'
                                  : limit.available_slots <= 2
                                  ? 'text-warning'
                                  : 'text-muted-foreground'
                              )}>
                                {!limit.is_active ? 'Disabled' : limit.is_full ? 'Full' : `${limit.available_slots} left`}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                
                {selectedGame && (
                  <div className={cn(
                    'flex items-center gap-2 text-sm',
                    !isGameAvailable(selectedGame as GameType)
                      ? 'text-destructive'
                      : getGameLimit(selectedGame as GameType)?.available_slots! <= 2
                      ? 'text-warning'
                      : 'text-muted-foreground'
                  )}>
                    {!isGameAvailable(selectedGame as GameType) && (
                      <AlertTriangle className="h-4 w-4" />
                    )}
                    {getGameAvailabilityText(selectedGame as GameType)}
                  </div>
                )}
              </div>

              {/* Server Name */}
              <div className="space-y-2">
                <Label htmlFor="serverName">Server Name *</Label>
                <Input
                  id="serverName"
                  placeholder="My Awesome Server"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  maxLength={50}
                />
              </div>

              {/* Discord Username */}
              <div className="space-y-2">
                <Label htmlFor="discordUsername">Discord Username *</Label>
                <Input
                  id="discordUsername"
                  placeholder="username#1234 or username"
                  value={discordUsername}
                  onChange={(e) => setDiscordUsername(e.target.value)}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  We'll use this to contact you about your server
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </div>

              {/* Game-specific config forms */}
              {selectedGame === 'minecraft' && (
                <MinecraftConfigForm
                  config={serverConfig as Partial<MinecraftConfig>}
                  onChange={setServerConfig}
                />
              )}
              {selectedGame === 'terraria' && (
                <TerrariaConfigForm
                  config={serverConfig as Partial<TerrariaConfig>}
                  onChange={setServerConfig}
                />
              )}
              {selectedGame === 'satisfactory' && (
                <SatisfactoryConfigForm
                  config={serverConfig as Partial<SatisfactoryConfig>}
                  onChange={setServerConfig}
                />
              )}
              {selectedGame === 'cs2' && (
                <CS2ConfigForm
                  config={serverConfig as Partial<CS2Config>}
                  onChange={setServerConfig}
                />
              )}
              {selectedGame === 'factorio' && (
                <FactorioConfigForm
                  config={serverConfig as Partial<FactorioConfig>}
                  onChange={setServerConfig}
                />
              )}
              {selectedGame === 'rust' && (
                <RustConfigForm
                  config={serverConfig as Partial<RustConfig>}
                  onChange={setServerConfig}
                />
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="glow-primary">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
