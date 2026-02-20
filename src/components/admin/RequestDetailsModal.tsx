import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  User,
  MessageSquare,
  Server,
  Settings,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Globe,
  ExternalLink,
  Loader2,
  Shield,
  CalendarIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { MinecraftConfig } from '@/components/dashboard/MinecraftConfigForm';
import type { TerrariaConfig } from '@/components/dashboard/TerrariaConfigForm';
import type { SatisfactoryConfig } from '@/components/dashboard/SatisfactoryConfigForm';
import type { ServerRequest } from '@/hooks/useAdminRequests';
import { useDecryptedCredentials } from '@/hooks/useDecryptedCredentials';
import { Database } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type RequestStatus = Database['public']['Enums']['request_status'];
type GameType = Database['public']['Enums']['game_type'];

interface RequestDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: ServerRequest | null;
  onRequestUpdated?: () => void;
}

const gameLabels: Record<GameType, { label: string; icon: string }> = {
  minecraft: { label: 'Minecraft', icon: '⛏️' },
  terraria: { label: 'Terraria', icon: '🌳' },
  satisfactory: { label: 'Satisfactory', icon: '🏭' },
  cs2: { label: 'Counter-Strike 2', icon: '🔫' },
  factorio: { label: 'Factorio', icon: '⚙️' },
  rust: { label: 'Rust', icon: '🔥' },
};

// Type guards for config parsing
function isMinecraftConfig(config: unknown): config is MinecraftConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'edition' in config
  );
}

function isTerrariaConfig(config: unknown): config is TerrariaConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'world_size' in config
  );
}

function isSatisfactoryConfig(config: unknown): config is SatisfactoryConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'branch' in config
  );
}

// Format helpers
const formatMinecraftEdition = (edition: string) => {
  const editions: Record<string, string> = {
    java: 'Java Edition',
    bedrock: 'Bedrock Edition',
  };
  return editions[edition] || edition;
};

const formatMinecraftSoftware = (software: string) => {
  const softwares: Record<string, string> = {
    vanilla: 'Vanilla',
    paper: 'Paper (Plugins)',
    fabric: 'Fabric (Mods)',
    forge: 'Forge (Mods)',
  };
  return softwares[software] || software;
};

const formatTerrariaSoftware = (software: string) => {
  const softwares: Record<string, string> = {
    vanilla: 'Vanilla',
    tmodloader: 'tModLoader',
  };
  return softwares[software] || software;
};

const formatTerrariaWorldSize = (size: string) => {
  const sizes: Record<string, string> = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
  };
  return sizes[size] || size;
};

const formatTerrariaDifficulty = (difficulty: string) => {
  const difficulties: Record<string, string> = {
    classic: 'Classic',
    expert: 'Expert',
    master: 'Master',
    journey: 'Journey',
  };
  return difficulties[difficulty] || difficulty;
};

const formatSatisfactoryBranch = (branch: string) => {
  const branches: Record<string, string> = {
    early_access: 'Early Access (Stable)',
    experimental: 'Experimental',
  };
  return branches[branch] || branch;
};

function InfoRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value || '-'}</p>
      </div>
    </div>
  );
}

function GameConfigSection({ gameType, config }: { gameType: GameType; config: unknown }) {
  if (gameType === 'minecraft' && isMinecraftConfig(config)) {
    return (
      <div className="space-y-1">
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Edition" value={formatMinecraftEdition(config.edition)} />
          <InfoRow label="Software" value={formatMinecraftSoftware(config.software)} />
          <InfoRow label="Version" value={config.version || 'Not specified'} />
          <InfoRow 
            label="EULA Accepted" 
            value={
              config.eula_accepted ? (
                <span className="text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Yes
                </span>
              ) : (
                <span className="text-destructive flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> No
                </span>
              )
            } 
          />
        </div>
      </div>
    );
  }

  if (gameType === 'terraria' && isTerrariaConfig(config)) {
    return (
      <div className="space-y-1">
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Software" value={formatTerrariaSoftware(config.software)} />
          <InfoRow label="World Size" value={formatTerrariaWorldSize(config.world_size)} />
          <InfoRow label="Difficulty" value={formatTerrariaDifficulty(config.difficulty)} />
        </div>
      </div>
    );
  }

  if (gameType === 'satisfactory' && isSatisfactoryConfig(config)) {
    return (
      <div className="space-y-1">
        <InfoRow label="Branch" value={formatSatisfactoryBranch(config.branch)} />
      </div>
    );
  }

  return <p className="text-sm text-muted-foreground">No configuration data</p>;
}

function getStatusBadge(status: RequestStatus) {
  switch (status) {
    case 'pending':
      return (
        <Badge className="bg-warning/20 text-warning border-warning/30 gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case 'active':
      return (
        <Badge className="bg-success/20 text-success border-success/30 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      );
    case 'suspended' as RequestStatus:
      return (
        <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 gap-1">
          <XCircle className="h-3 w-3" />
          Suspended
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
}

export function RequestDetailsModal({ open, onOpenChange, request, onRequestUpdated }: RequestDetailsModalProps) {
  const { decryptCredentials, decryptedCredentials, isDecrypting, clearCredentials } = useDecryptedCredentials();
  const [isPermanent, setIsPermanent] = useState(false);
  const [isTogglingPermanent, setIsTogglingPermanent] = useState(false);
  const [customExpiryDate, setCustomExpiryDate] = useState<Date | undefined>(undefined);
  const [customExpiryTime, setCustomExpiryTime] = useState('12:00');
  const [isUpdatingExpiry, setIsUpdatingExpiry] = useState(false);

  // Sync permanent state when request changes
  useEffect(() => {
    if (request) {
      setIsPermanent(request.expires_at === null);
      if (request.expires_at) {
        const d = new Date(request.expires_at);
        setCustomExpiryDate(d);
        setCustomExpiryTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      } else {
        setCustomExpiryDate(undefined);
        setCustomExpiryTime('12:00');
      }
    }
  }, [request?.id, request?.expires_at]);

  // Decrypt credentials when modal opens for an active request
  useEffect(() => {
    if (open && request?.status === 'active' && request.id) {
      decryptCredentials(request.id);
    }
    
    // Clear credentials when modal closes
    if (!open) {
      clearCredentials();
    }
  }, [open, request?.id, request?.status, decryptCredentials, clearCredentials]);

  const handleTogglePermanent = async (checked: boolean) => {
    if (!request) return;
    setIsTogglingPermanent(true);
    try {
      const { data, error } = await supabase.rpc('toggle_permanent_server', {
        target_request_id: request.id,
        make_permanent: checked,
      });
      if (error) throw error;
      if (data) {
        setIsPermanent(checked);
        toast({
          title: checked ? 'Server set to permanent' : 'Expiration re-enabled',
          description: checked 
            ? 'This server will no longer expire automatically.' 
            : 'Server will expire in 7 days from now.',
        });
        onRequestUpdated?.();
      }
    } catch (error) {
      console.error('Error toggling permanent server:', error);
      toast({
        title: 'Error',
        description: 'Failed to update server expiration.',
        variant: 'destructive',
      });
    } finally {
      setIsTogglingPermanent(false);
    }
  };

  const handleUpdateExpiry = async () => {
    if (!request || !customExpiryDate) return;
    setIsUpdatingExpiry(true);
    try {
      const [hours, minutes] = customExpiryTime.split(':').map(Number);
      const newExpiry = new Date(customExpiryDate);
      newExpiry.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from('server_requests')
        .update({ expires_at: newExpiry.toISOString() })
        .eq('id', request.id);

      if (error) throw error;

      // Turn off permanent if it was on
      if (isPermanent) {
        setIsPermanent(false);
      }

      toast({
        title: 'Expiration date updated',
        description: `Expiration date updated to ${format(newExpiry, 'PPP p')}.`,
      });
      onRequestUpdated?.();
    } catch (err) {
      console.error('Error updating expiry:', err);
      toast({
        title: 'Error',
        description: 'Failed to update expiration date.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingExpiry(false);
    }
  };

  if (!request) return null;

  const game = gameLabels[request.game_type];

  // Use decrypted credentials if available, otherwise show loading or encrypted
  const displayCredentials = decryptedCredentials || {
    assigned_ip: request.assigned_ip,
    panel_url: request.panel_url,
    panel_username: request.panel_username,
    panel_password: request.panel_password,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gaming-card border-border/50 max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{game?.icon}</span>
            {request.server_name}
          </DialogTitle>
          <DialogDescription>
            Server request details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getStatusBadge(request.status)}
          </div>

          <Separator />

          {/* User Info */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              User Information
            </h4>
            <div className="grid grid-cols-2 gap-4 pl-6">
              <InfoRow label="Email" value={request.user_email || 'Unknown'} />
              <InfoRow label="Discord" value={request.discord_username} icon={MessageSquare} />
            </div>
          </div>

          <Separator />

          {/* Server Info */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Server className="h-4 w-4" />
              Server Information
            </h4>
            <div className="grid grid-cols-2 gap-4 pl-6">
              <InfoRow label="Server Name" value={request.server_name} />
              <InfoRow label="Game" value={`${game?.icon} ${game?.label}`} />
              {request.pterodactyl_server_id && (
                <InfoRow label="Pterodactyl ID" value={`#${request.pterodactyl_server_id}`} icon={Server} />
              )}
            </div>
          </div>

          <Separator />

          {/* Game Configuration */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Game Configuration
            </h4>
            <div className="pl-6">
              <GameConfigSection gameType={request.game_type} config={request.server_config} />
            </div>
          </div>

          {/* Description */}
          {request.description && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Project Description
                </h4>
                <p className="text-sm pl-6 whitespace-pre-wrap">{request.description}</p>
              </div>
            </>
          )}

          {/* Rejection Reason */}
          {request.status === 'rejected' && request.rejection_reason && (
            <>
              <Separator />
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3">
                <h4 className="text-sm font-medium text-destructive mb-1 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Rejection Reason
                </h4>
                <p className="text-sm text-destructive/80 pl-6">{request.rejection_reason}</p>
              </div>
            </>
          )}

          {/* Active Server Info */}
          {request.status === 'active' && (request.assigned_ip || request.panel_url) && (
            <>
              <Separator />
              <div className="bg-success/10 border border-success/30 rounded-md p-3">
                <h4 className="text-sm font-medium text-success mb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Server Credentials
                  {isDecrypting && <Loader2 className="h-3 w-3 animate-spin" />}
                </h4>
                <div className="space-y-2 pl-6">
                  {isDecrypting ? (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Server IP</p>
                        <Skeleton className="h-5 w-40" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Panel URL</p>
                        <Skeleton className="h-5 w-56" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Username</p>
                        <Skeleton className="h-5 w-32" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Password</p>
                        <Skeleton className="h-5 w-36" />
                      </div>
                    </>
                  ) : (
                    <>
                      {displayCredentials.assigned_ip && (
                        <InfoRow label="Server IP" value={displayCredentials.assigned_ip} />
                      )}
                      {displayCredentials.panel_url && (
                        <InfoRow 
                          label="Panel URL" 
                          value={
                            <a 
                              href={displayCredentials.panel_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {displayCredentials.panel_url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          } 
                        />
                      )}
                      {displayCredentials.panel_username && (
                        <InfoRow label="Username" value={displayCredentials.panel_username} />
                      )}
                      {displayCredentials.panel_password && (
                        <InfoRow label="Password" value={displayCredentials.panel_password} />
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Admin: Permanent Server Toggle */}
          {request.status === 'active' && (
            <>
              <Separator />
              <div className="bg-muted/30 border border-border/50 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <div>
                      <Label htmlFor="permanent-toggle" className="text-sm font-medium">Permanent Server</Label>
                      <p className="text-xs text-muted-foreground">
                        {isPermanent ? 'This server will never expire' : 'Server has a timed expiration'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="permanent-toggle"
                    checked={isPermanent}
                    onCheckedChange={handleTogglePermanent}
                    disabled={isTogglingPermanent}
                  />
                </div>
              </div>
            </>
          )}

          {/* Admin: Custom Expiration Date */}
          {request.status === 'active' && !isPermanent && (
            <>
              <Separator />
              <div className="bg-muted/30 border border-border/50 rounded-md p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">Set Custom Expiration Date</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal",
                          !customExpiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customExpiryDate ? format(customExpiryDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customExpiryDate}
                        onSelect={setCustomExpiryDate}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={customExpiryTime}
                    onChange={(e) => setCustomExpiryTime(e.target.value)}
                    className="w-[120px]"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleUpdateExpiry}
                  disabled={!customExpiryDate || isUpdatingExpiry}
                  className="w-full"
                >
                  {isUpdatingExpiry ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Date'
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Resource Boost Info */}
          {request.status === 'active' && ((request as any).ram_boost > 0 || (request as any).cpu_boost > 0) && (
            <>
              <Separator />
              <div className="bg-primary/10 border border-primary/30 rounded-md p-3">
                <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                  ⚡ Resource Boosts (Action Required)
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  This user has purchased resource upgrades. Please apply these in the Pterodactyl panel.
                </p>
                <div className="grid grid-cols-2 gap-3 pl-2">
                  {(request as any).ram_boost > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Extra RAM</p>
                      <p className="text-sm font-bold text-primary">+{((request as any).ram_boost / 1024).toFixed(0)} GB</p>
                    </div>
                  )}
                  {(request as any).cpu_boost > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground">Extra CPU</p>
                      <p className="text-sm font-bold text-primary">+{(request as any).cpu_boost}%</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div>
              <span>Created: </span>
              <span className="font-medium">
                {new Date(request.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span>Updated: </span>
              <span className="font-medium">
                {new Date(request.updated_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
