import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useServerRequest } from '@/hooks/useServerRequest';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useGameLimits, GameName } from '@/hooks/useGameLimits';
import { useDecryptedCredentials } from '@/hooks/useDecryptedCredentials';
import { useToast } from '@/hooks/use-toast';
import { Server, Clock, CheckCircle2, XCircle, Plus, Loader2, AlertTriangle, Eye, EyeOff, ExternalLink, AlertCircle, Terminal, Shield, Zap } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MinecraftConfigForm, MinecraftConfig } from './MinecraftConfigForm';
import { TerrariaConfigForm, TerrariaConfig } from './TerrariaConfigForm';
import { SatisfactoryConfigForm, SatisfactoryConfig } from './SatisfactoryConfigForm';
import { CS2ConfigForm, CS2Config } from './CS2ConfigForm';
import { FactorioConfigForm, FactorioConfig } from './FactorioConfigForm';
import { ServerExpiryCard } from './ServerExpiryCard';
import { CopyButton } from '@/components/ui/copy-button';
import { triggerSuccessConfetti } from '@/lib/confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type GameType = 'minecraft' | 'terraria' | 'satisfactory' | 'cs2' | 'factorio';
type ServerConfig = MinecraftConfig | TerrariaConfig | SatisfactoryConfig | CS2Config | FactorioConfig;

const gameOptions: { value: GameType; label: string; icon: string }[] = [
  { value: 'minecraft', label: 'Minecraft', icon: '⛏️' },
  { value: 'terraria', label: 'Terraria', icon: '🌳' },
  { value: 'satisfactory', label: 'Satisfactory', icon: '🏭' },
  { value: 'cs2', label: 'Counter-Strike 2', icon: '🔫' },
  { value: 'factorio', label: 'Factorio', icon: '⚙️' },
];

export function ServerStatusCard() {
  const navigate = useNavigate();
  const { request, isLoading, createRequest, hasActiveRequest, refetch } = useServerRequest();
  const { settings, isFull } = useSystemSettings();
  const { gameLimits, isLoading: gameLimitsLoading } = useGameLimits();
  const { decryptCredentials, decryptedCredentials, isDecrypting, clearCredentials } = useDecryptedCredentials();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType | ''>('');
  const [serverName, setServerName] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [description, setDescription] = useState('');
  const [serverConfig, setServerConfig] = useState<Partial<ServerConfig>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentialsLoaded, setCredentialsLoaded] = useState(false);

  // Decrypt credentials when active server request is loaded
  useEffect(() => {
    if (request?.status === 'active' && request.id && !credentialsLoaded) {
      decryptCredentials(request.id).then(() => {
        setCredentialsLoaded(true);
      });
    }
  }, [request?.id, request?.status, decryptCredentials, credentialsLoaded]);

  // Reset credentials state when request changes
  useEffect(() => {
    if (!request || request.status !== 'active') {
      clearCredentials();
      setCredentialsLoaded(false);
    }
  }, [request?.id, request?.status, clearCredentials]);

  const resetForm = () => {
    setSelectedGame('');
    setServerName('');
    setDiscordUsername('');
    setDescription('');
    setServerConfig({});
  };

  // Get game availability info
  const getGameLimit = (gameName: GameType) => {
    return gameLimits.find((l) => l.game_name === gameName);
  };

  const isGameAvailable = (gameName: GameType) => {
    const limit = getGameLimit(gameName);
    if (!limit) return true; // Allow if we can't check
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

    // Check game availability
    const limit = getGameLimit(selectedGame as GameType);
    if (limit && !limit.is_active) return 'This game is currently unavailable.';
    if (limit && limit.is_full) return 'This game has no available slots.';

    // Game-specific validation
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

    // Trigger confetti celebration!
    triggerSuccessConfetti();
    
    toast({
      title: '🎉 Request sent successfully!',
      description: 'Your server request has been submitted for approval.',
    });
    setIsDialogOpen(false);
    resetForm();
    refetch();
  };

  const handleGameChange = (game: GameType) => {
    setSelectedGame(game);
    setServerConfig({}); // Reset config when game changes
  };

  // Removed copyToClipboard - now using CopyButton component

  const getStatusBadge = () => {
    if (!request) return null;

    switch (request.status) {
      case 'pending':
        return (
          <Badge className="bg-warning/20 text-warning border-warning/30 gap-1 pulse-warning">
            <Clock className="h-3 w-3" />
            Approval Pending
          </Badge>
        );
      case 'active':
        return (
          <Badge className="bg-success/20 text-success border-success/30 gap-1 pulse-success">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
    }
  };

  const getGameInfo = (gameType: string) => {
    return gameOptions.find((g) => g.value === gameType);
  };

  if (isLoading) {
    return (
      <Card className="gaming-card border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // No request - show request button
  if (!request) {
    const canRequest = !settings?.maintenance_mode && !isFull && !hasActiveRequest;

    const RequestButton = (
      <Button 
        className="w-full gap-2 glow-primary" 
        size="lg"
        disabled={!canRequest}
      >
        <Plus className="h-5 w-5" />
        Request Server
      </Button>
    );

    return (
      <Card className="gaming-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Your Server
          </CardTitle>
          <CardDescription>
            Request your free game server in just a few clicks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DialogTrigger asChild disabled={!canRequest}>
                      {RequestButton}
                    </DialogTrigger>
                  </div>
                </TooltipTrigger>
                {hasActiveRequest && (
                  <TooltipContent>
                    <p>You already have a server request</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            
            <DialogContent className="gaming-card border-border/50 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display">Request a Server</DialogTitle>
                <DialogDescription>
                  Fill in the details below to request your game server
                </DialogDescription>
              </DialogHeader>

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
                  
                  {/* Availability feedback */}
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
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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
            </DialogContent>
          </Dialog>

          {!canRequest && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              {settings?.maintenance_mode
                ? 'Server requests are disabled during maintenance.'
                : hasActiveRequest
                ? 'You already have an active server request.'
                : 'We are currently at full capacity. Please try again later.'}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Has a request - show status
  const gameInfo = getGameInfo(request.game_type);

  return (
    <Card className="gaming-card border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{gameInfo?.icon}</span>
              {request.server_name}
            </CardTitle>
            <CardDescription className="mt-1">
              {gameInfo?.label} Server
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Rejection Alert */}
        {request.status === 'rejected' && (
          <Alert variant="destructive" className="border-destructive/50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Request Rejected</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>
                <strong>Reason:</strong> {request.rejection_reason || 'No reason provided'}
              </p>
              <p className="text-xs">
                Please submit a new request or contact us on Discord for assistance.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {request.status === 'pending' && (
          <div className="rounded-lg bg-warning/10 border border-warning/30 p-4 text-center">
            <Clock className="mx-auto h-8 w-8 text-warning mb-2" />
            <p className="text-sm text-muted-foreground">
              Your request is awaiting admin approval.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Submitted on {new Date(request.created_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {request.status === 'active' && request.assigned_ip && (
          <div className="space-y-4">
            {/* Security Badge */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3 text-success" />
              <span>Credentials are encrypted and securely stored</span>
            </div>

            {/* Loading State for Decryption */}
            {isDecrypting && (
              <div className="rounded-lg bg-muted/50 border border-border p-4 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Loading secure credentials...</p>
              </div>
            )}

            {/* Server Connection Card */}
            {!isDecrypting && decryptedCredentials && (
              <div className="rounded-lg bg-success/10 border border-success/30 p-4 space-y-4">
                <div className="flex items-center gap-2 text-success font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  Your Server is Active
                </div>

                {/* Server IP */}
                {decryptedCredentials.assigned_ip && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Server Address</span>
                    <div className="flex items-center justify-between bg-background/50 rounded-md p-2">
                      <span className="font-mono text-sm">{decryptedCredentials.assigned_ip}</span>
                      <CopyButton text={decryptedCredentials.assigned_ip} label="Server IP" />
                    </div>
                  </div>
                )}

                {/* Control Panel */}
                {decryptedCredentials.panel_url && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Control Panel</span>
                    <a
                      href={decryptedCredentials.panel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-background/50 rounded-md p-2 text-primary hover:text-primary/80 transition-colors"
                    >
                      <span className="font-mono text-sm truncate">{decryptedCredentials.panel_url}</span>
                      <ExternalLink className="h-4 w-4 shrink-0" />
                    </a>
                  </div>
                )}

                {/* Panel Credentials */}
                {decryptedCredentials.panel_username && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Username</span>
                      <div className="flex items-center justify-between bg-background/50 rounded-md p-2">
                        <span className="font-mono text-sm">{decryptedCredentials.panel_username}</span>
                        <CopyButton text={decryptedCredentials.panel_username} label="Username" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">Password</span>
                      <div className="flex items-center justify-between bg-background/50 rounded-md p-2">
                        <AnimatePresence mode="wait">
                          <motion.span 
                            key={showPassword ? 'visible' : 'hidden'}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="font-mono text-sm"
                          >
                            {showPassword ? decryptedCredentials.panel_password : '••••••••'}
                          </motion.span>
                        </AnimatePresence>
                        <div className="flex items-center gap-1">
                          <motion.button
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                            whileTap={{ scale: 0.9 }}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {showPassword ? (
                                <motion.div
                                  key="hide"
                                  initial={{ rotate: -90, opacity: 0 }}
                                  animate={{ rotate: 0, opacity: 1 }}
                                  exit={{ rotate: 90, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <EyeOff className="h-4 w-4" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="show"
                                  initial={{ rotate: 90, opacity: 0 }}
                                  animate={{ rotate: 0, opacity: 1 }}
                                  exit={{ rotate: -90, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <Eye className="h-4 w-4" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.button>
                          {decryptedCredentials.panel_password && (
                            <CopyButton text={decryptedCredentials.panel_password} label="Password" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Primary Action Button */}
            {decryptedCredentials?.panel_url && (
              <a
                href={decryptedCredentials.panel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button className="w-full gap-2 glow-primary" size="lg">
                  <Terminal className="h-5 w-5" />
                  Open Game Panel
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}

            {/* Need More Power Button */}
            {!request.stripe_subscription_id && (
              <Button
                variant="outline"
                className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => navigate(`/server/${request.id}/upgrade`)}
              >
                <Zap className="h-4 w-4" />
                Need more power?
              </Button>
            )}

            {/* Server Expiry/Renewal Card */}
            {request.expires_at && (
              <ServerExpiryCard
                requestId={request.id}
                expiresAt={request.expires_at}
                onRenewed={refetch}
              />
            )}
          </div>
        )}

        {request.status === 'rejected' && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 text-center">
            <XCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground">
              Your server request was rejected.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please open a ticket on Discord for more information.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
