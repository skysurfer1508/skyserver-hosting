import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface MinecraftConfig {
  edition: 'java' | 'bedrock';
  software: 'vanilla' | 'paper' | 'fabric' | 'forge';
  version: string;
  eula_accepted: boolean;
}

interface MinecraftConfigFormProps {
  config: Partial<MinecraftConfig>;
  onChange: (config: Partial<MinecraftConfig>) => void;
}

export function MinecraftConfigForm({ config, onChange }: MinecraftConfigFormProps) {
  return (
    <div className="space-y-4 border-t border-border/50 pt-4 mt-4">
      <h4 className="font-medium text-sm text-muted-foreground">Minecraft Configuration</h4>
      
      <div className="space-y-2">
        <Label>Edition</Label>
        <Select
          value={config.edition || ''}
          onValueChange={(value) => onChange({ ...config, edition: value as MinecraftConfig['edition'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select edition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="java">Java Edition</SelectItem>
            <SelectItem value="bedrock">Bedrock Edition</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Server Software</Label>
        <Select
          value={config.software || ''}
          onValueChange={(value) => onChange({ ...config, software: value as MinecraftConfig['software'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select software" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vanilla">Vanilla</SelectItem>
            <SelectItem value="paper">Paper (Plugins)</SelectItem>
            <SelectItem value="fabric">Fabric (Mods)</SelectItem>
            <SelectItem value="forge">Forge (Mods)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mcVersion">Version *</Label>
        <Input
          id="mcVersion"
          placeholder="e.g., 1.20.4"
          value={config.version || ''}
          onChange={(e) => onChange({ ...config, version: e.target.value })}
          maxLength={20}
        />
      </div>

      <div className="flex items-start space-x-3 pt-2">
        <Checkbox
          id="eula"
          checked={config.eula_accepted || false}
          onCheckedChange={(checked) => onChange({ ...config, eula_accepted: !!checked })}
        />
        <div className="grid gap-1.5 leading-none">
          <Label htmlFor="eula" className="cursor-pointer">
            I agree to the Minecraft EULA
          </Label>
          <p className="text-xs text-muted-foreground">
            By checking this, you accept the{' '}
            <a
              href="https://www.minecraft.net/en-us/eula"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Minecraft End User License Agreement
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
