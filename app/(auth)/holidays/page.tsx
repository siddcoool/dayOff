import { Suspense } from 'react';
import { getCurrentUserWithRole } from '@/app/actions/shared-actions';
import { getHolidays } from '@/app/actions/employee-actions';
import { HolidayList } from '@/components/holiday/HolidayList';
import { redirect } from 'next/navigation';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

async function HolidaysContent() {
  const holidaysResult = await getHolidays();
  const holidays = holidaysResult.success ? holidaysResult.data : [];
  return <HolidayList holidays={holidays} />;
}

export default async function HolidaysPage() {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect('/');
  }

  if (user.role === 'admin') {
    redirect('/admin/holidays');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Holidays</h1>
        <p className="text-muted-foreground">View upcoming company holidays</p>
      </div>
      <Suspense fallback={<TableSkeleton rows={8} />}>
        <HolidaysContent />
      </Suspense>
    </div>
  );
}

