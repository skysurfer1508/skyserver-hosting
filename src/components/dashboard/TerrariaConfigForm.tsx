import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface TerrariaConfig {
  software: 'vanilla' | 'tmodloader';
  world_size: 'small' | 'medium' | 'large';
  difficulty: 'classic' | 'expert' | 'master' | 'journey';
}

interface TerrariaConfigFormProps {
  config: Partial<TerrariaConfig>;
  onChange: (config: Partial<TerrariaConfig>) => void;
}

export function TerrariaConfigForm({ config, onChange }: TerrariaConfigFormProps) {
  return (
    <div className="space-y-4 border-t border-border/50 pt-4 mt-4">
      <h4 className="font-medium text-sm text-muted-foreground">Terraria Configuration</h4>
      
      <div className="space-y-2">
        <Label>Software</Label>
        <Select
          value={config.software || ''}
          onValueChange={(value) => onChange({ ...config, software: value as TerrariaConfig['software'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select software" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vanilla">Vanilla</SelectItem>
            <SelectItem value="tmodloader">tModLoader</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>World Size</Label>
        <Select
          value={config.world_size || ''}
          onValueChange={(value) => onChange({ ...config, world_size: value as TerrariaConfig['world_size'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select world size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Difficulty</Label>
        <Select
          value={config.difficulty || ''}
          onValueChange={(value) => onChange({ ...config, difficulty: value as TerrariaConfig['difficulty'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="classic">Classic</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
            <SelectItem value="master">Master</SelectItem>
            <SelectItem value="journey">Journey</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
