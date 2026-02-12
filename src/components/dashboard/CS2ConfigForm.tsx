import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export interface CS2Config {
  game_mode: string;
  map: string;
}

interface CS2ConfigFormProps {
  config: Partial<CS2Config>;
  onChange: (config: Partial<CS2Config>) => void;
}

const gameModes = [
  { value: 'competitive', label: 'Competitive' },
  { value: 'casual', label: 'Casual' },
  { value: 'deathmatch', label: 'Deathmatch' },
  { value: 'wingman', label: 'Wingman' },
];

export function CS2ConfigForm({ config, onChange }: CS2ConfigFormProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border/50 p-4">
      <h4 className="font-medium text-sm text-foreground">CS2 Configuration</h4>

      <Alert className="border-sky-500/30 bg-sky-500/10">
        <AlertTriangle className="h-4 w-4 text-sky-400" />
        <AlertDescription className="text-sm text-sky-300">
          Recommended: at least 2 CPU boost and 4GB RAM for a smooth experience.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label>Game Mode *</Label>
        <Select
          value={config.game_mode || ''}
          onValueChange={(value) => onChange({ ...config, game_mode: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select game mode" />
          </SelectTrigger>
          <SelectContent>
            {gameModes.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cs2Map">Starting Map</Label>
        <Input
          id="cs2Map"
          placeholder="de_dust2"
          value={config.map || ''}
          onChange={(e) => onChange({ ...config, map: e.target.value })}
          maxLength={50}
        />
        <p className="text-xs text-muted-foreground">
          Leave blank for the default map
        </p>
      </div>
    </div>
  );
}
