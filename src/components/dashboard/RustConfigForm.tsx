import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface RustConfig {
  map_size: 'small' | 'medium' | 'large';
  max_players: number;
  wipe_schedule: 'weekly' | 'biweekly' | 'monthly' | 'none';
}

interface RustConfigFormProps {
  config: Partial<RustConfig>;
  onChange: (config: Partial<RustConfig>) => void;
}

export function RustConfigForm({ config, onChange }: RustConfigFormProps) {
  return (
    <div className="space-y-4 border-t border-border/50 pt-4 mt-4">
      <h4 className="font-medium text-sm text-muted-foreground">Rust Configuration</h4>

      <div className="space-y-2">
        <Label>Map Size</Label>
        <Select
          value={config.map_size || ''}
          onValueChange={(value) => onChange({ ...config, map_size: value as RustConfig['map_size'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select map size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small (3000)</SelectItem>
            <SelectItem value="medium">Medium (4000)</SelectItem>
            <SelectItem value="large">Large (6000)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Max Players</Label>
        <Input
          type="number"
          min={2}
          max={200}
          value={config.max_players ?? 50}
          onChange={(e) => onChange({ ...config, max_players: parseInt(e.target.value) || 50 })}
        />
      </div>

      <div className="space-y-2">
        <Label>Server Wipe Schedule</Label>
        <Select
          value={config.wipe_schedule || ''}
          onValueChange={(value) => onChange({ ...config, wipe_schedule: value as RustConfig['wipe_schedule'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select wipe schedule" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="biweekly">Biweekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
