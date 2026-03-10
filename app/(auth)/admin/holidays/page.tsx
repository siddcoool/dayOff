import { getCurrentUserWithRole } from '@/app/actions/shared-actions';
import { getAllHolidays } from '@/app/actions/admin-actions';
import { HolidayManagement } from '@/components/admin/HolidayManagement';
import { redirect } from 'next/navigation';

export default async function AdminHolidaysPage() {
  const user = await getCurrentUserWithRole();

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  const holidaysResult = await getAllHolidays();
  const holidays = holidaysResult.success ? holidaysResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Holidays</h1>
        <p className="text-muted-foreground">Manage company holidays</p>
      </div>
      <HolidayManagement holidays={holidays} />
    </div>
  );
}

