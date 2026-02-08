import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
} from 'lucide-react';
import type { MinecraftConfig } from '@/components/dashboard/MinecraftConfigForm';
import type { TerrariaConfig } from '@/components/dashboard/TerrariaConfigForm';
import type { SatisfactoryConfig } from '@/components/dashboard/SatisfactoryConfigForm';
import type { ServerRequest } from '@/hooks/useAdminRequests';
import { Database } from '@/integrations/supabase/types';

type RequestStatus = Database['public']['Enums']['request_status'];
type GameType = Database['public']['Enums']['game_type'];

interface RequestDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: ServerRequest | null;
}

const gameLabels: Record<GameType, { label: string; icon: string }> = {
  minecraft: { label: 'Minecraft', icon: '⛏️' },
  terraria: { label: 'Terraria', icon: '🌳' },
  satisfactory: { label: 'Satisfactory', icon: '🏭' },
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
    case 'rejected':
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
  }
}

export function RequestDetailsModal({ open, onOpenChange, request }: RequestDetailsModalProps) {
  if (!request) return null;

  const game = gameLabels[request.game_type];

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
                </h4>
                <div className="space-y-2 pl-6">
                  {request.assigned_ip && (
                    <InfoRow label="Server IP" value={request.assigned_ip} />
                  )}
                  {request.panel_url && (
                    <InfoRow 
                      label="Panel URL" 
                      value={
                        <a 
                          href={request.panel_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {request.panel_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      } 
                    />
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
