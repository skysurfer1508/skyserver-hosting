import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SatisfactoryConfig {
  branch: 'early_access' | 'experimental';
}

interface SatisfactoryConfigFormProps {
  config: Partial<SatisfactoryConfig>;
  onChange: (config: Partial<SatisfactoryConfig>) => void;
}

export function SatisfactoryConfigForm({ config, onChange }: SatisfactoryConfigFormProps) {
  return (
    <div className="space-y-4 border-t border-border/50 pt-4 mt-4">
      <h4 className="font-medium text-sm text-muted-foreground">Satisfactory Configuration</h4>
      
      <div className="space-y-2">
        <Label>Branch</Label>
        <Select
          value={config.branch || ''}
          onValueChange={(value) => onChange({ ...config, branch: value as SatisfactoryConfig['branch'] })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="early_access">Early Access (Stable)</SelectItem>
            <SelectItem value="experimental">Experimental</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
