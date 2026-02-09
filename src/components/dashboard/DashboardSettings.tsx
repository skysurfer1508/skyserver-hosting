import { ProfileSettingsCard } from './ProfileSettingsCard';
import { SecuritySettingsCard } from './SecuritySettingsCard';

export function DashboardSettings() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ProfileSettingsCard />
      <SecuritySettingsCard />
    </div>
  );
}
