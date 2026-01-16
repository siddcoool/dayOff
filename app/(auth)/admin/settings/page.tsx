import { getCurrentUserWithRole } from '@/app/actions/shared-actions';
import { getAllLeaveTypes, getSystemConfig } from '@/app/actions/admin-actions';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const user = await getCurrentUserWithRole();
  
  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  const [leaveTypesResult, configResult] = await Promise.all([
    getAllLeaveTypes(),
    getSystemConfig(),
  ]);

  const leaveTypes = leaveTypesResult.success ? leaveTypesResult.data : [];
  const config = configResult.success ? configResult.data : {};
  const monthlyAccrual = config.defaultMonthlyAccrual || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure leave types and system settings</p>
      </div>
      <SystemSettings leaveTypes={leaveTypes} monthlyAccrual={monthlyAccrual} />
    </div>
  );
}
