import { ProfileSettingsCard } from './ProfileSettingsCard';
import { SecuritySettingsCard } from './SecuritySettingsCard';
import { DeleteAccountCard } from './DeleteAccountCard';

export function DashboardSettings() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSettingsCard />
        <SecuritySettingsCard />
      </div>
      <DeleteAccountCard />
    </div>
  );
}
