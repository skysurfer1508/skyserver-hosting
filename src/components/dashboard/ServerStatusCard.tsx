import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Server, Clock, CheckCircle2, XCircle, Plus, Copy, Power, Loader2 } from 'lucide-react';
import { MinecraftConfigForm, MinecraftConfig } from './MinecraftConfigForm';
import { TerrariaConfigForm, TerrariaConfig } from './TerrariaConfigForm';
import { SatisfactoryConfigForm, SatisfactoryConfig } from './SatisfactoryConfigForm';

type GameType = 'minecraft' | 'terraria' | 'satisfactory';
type ServerConfig = MinecraftConfig | TerrariaConfig | SatisfactoryConfig;

const gameOptions: { value: GameType; label: string; icon: string }[] = [
  { value: 'minecraft', label: 'Minecraft', icon: '⛏️' },
  { value: 'terraria', label: 'Terraria', icon: '🌳' },
  { value: 'satisfactory', label: 'Satisfactory', icon: '🏭' },
];

export function ServerStatusCard() {
  const { request, isLoading, createRequest, hasActiveRequest, refetch } = useServerRequest();
  const { settings, isFull } = useSystemSettings();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType | ''>('');
  const [serverName, setServerName] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [description, setDescription] = useState('');
  const [serverConfig, setServerConfig] = useState<Partial<ServerConfig>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setSelectedGame('');
    setServerName('');
    setDiscordUsername('');
    setDescription('');
    setServerConfig({});
  };

  const validateForm = (): string | null => {
    if (!selectedGame) return 'Please select a game.';
    if (!serverName.trim()) return 'Please enter a server name.';
    if (!discordUsername.trim()) return 'Please enter your Discord username.';

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
    setIsDialogOpen(false);
    resetForm();
    refetch();
  };

  const handleGameChange = (game: GameType) => {
    setSelectedGame(game);
    setServerConfig({}); // Reset config when game changes
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Server address copied to clipboard.',
    });
  };

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
                      {gameOptions.map((game) => (
                        <SelectItem key={game.value} value={game.value}>
                          <span className="flex items-center gap-2">
                            <span>{game.icon}</span>
                            <span>{game.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

        {request.status === 'active' && request.ip_address && request.port && (
          <>
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Server Address</span>
                <button
                  onClick={() => copyToClipboard(`${request.ip_address}:${request.port}`)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <span className="font-mono text-sm">
                    {request.ip_address}:{request.port}
                  </span>
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 gap-2 bg-success hover:bg-success/90">
                <Power className="h-4 w-4" />
                Start Server
              </Button>
              <Button variant="outline" className="flex-1 gap-2">
                <Power className="h-4 w-4" />
                Stop Server
              </Button>
            </div>
          </>
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
