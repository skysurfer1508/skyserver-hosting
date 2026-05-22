import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { ServerRequest } from '@/hooks/useAdminRequests';

export const gameLabels: Record<string, { label: string; icon: string }> = {
  minecraft: { label: 'Minecraft', icon: '⛏️' },
  terraria: { label: 'Terraria', icon: '🌳' },
  satisfactory: { label: 'Satisfactory', icon: '🏭' },
};

export const getExpiryInfo = (expiresAt: string | null) => {
  if (!expiresAt) return { text: 'Permanent', isUrgent: false, isExpired: false, isPermanent: true, days: Infinity };
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  if (diff <= 0) return { text: 'Expired', isUrgent: true, isExpired: true, isPermanent: false, days: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days === 0) return { text: `${hours}h`, isUrgent: true, isExpired: false, isPermanent: false, days: 0 };
  return { text: `${days}d ${hours}h`, isUrgent: days < 3, isExpired: false, isPermanent: false, days };
};

export const isAutoExpiredServer = (r: ServerRequest) =>
  r.status === 'rejected' && r.rejection_reason === 'Server lease expired automatically.';

export const isSuspendedServer = (r: ServerRequest) =>
  (r.status as string) === 'suspended';

export const getStatusBadge = (request: ServerRequest) => {
  if (isSuspendedServer(request)) {
    return (
      <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 gap-1">
        <AlertTriangle className="h-3 w-3" />Suspended
      </Badge>
    );
  }
  if (isAutoExpiredServer(request)) {
    return (
      <Badge className="bg-warning/20 text-warning border-warning/30 gap-1">
        <Clock className="h-3 w-3" />Expired
      </Badge>
    );
  }
  switch (request.status) {
    case 'pending':
      return (
        <Badge className="bg-warning/20 text-warning border-warning/30 gap-1">
          <Clock className="h-3 w-3" />Pending
        </Badge>
      );
    case 'active':
      return (
        <Badge className="bg-success/20 text-success border-success/30 gap-1">
          <CheckCircle2 className="h-3 w-3" />Active
        </Badge>
      );
    case 'rejected':
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />Rejected
        </Badge>
      );
  }
};

export const matchesSearch = (r: ServerRequest, q: string, includeIp = false) => {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  const haystack = [
    r.user_email,
    r.discord_username,
    r.server_name,
    r.game_type,
    includeIp ? r.assigned_ip : null,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
};
