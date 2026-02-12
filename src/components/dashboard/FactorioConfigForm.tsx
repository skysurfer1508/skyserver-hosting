import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FactorioConfig {
  save_name: string;
  visibility: string;
}

interface FactorioConfigFormProps {
  config: Partial<FactorioConfig>;
  onChange: (config: Partial<FactorioConfig>) => void;
}

const visibilityOptions = [
  { value: 'public', label: 'Public' },
  { value: 'lan', label: 'LAN Only' },
];

export function FactorioConfigForm({ config, onChange }: FactorioConfigFormProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border/50 p-4">
      <h4 className="font-medium text-sm text-foreground">Factorio Configuration</h4>

      <div className="space-y-2">
        <Label htmlFor="saveName">Save Name *</Label>
        <Input
          id="saveName"
          placeholder="my-factory"
          value={config.save_name || ''}
          onChange={(e) => onChange({ ...config, save_name: e.target.value })}
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label>Visibility *</Label>
        <Select
          value={config.visibility || ''}
          onValueChange={(value) => onChange({ ...config, visibility: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select visibility" />
          </SelectTrigger>
          <SelectContent>
            {visibilityOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
