import { getMyLeaveHistory } from '@/app/actions/employee-actions';
import { LeaveHistoryTable } from '@/components/leave/LeaveHistoryTable';
import { redirect } from 'next/navigation';
import { getCurrentUserWithRole } from '@/app/actions/shared-actions';

export default async function LeaveHistoryPage() {
  const user = await getCurrentUserWithRole();
  
  if (!user) {
    redirect('/');
  }

  if (user.role === 'admin') {
    redirect('/admin');
  }

  const historyResult = await getMyLeaveHistory();
  const history = historyResult.success ? historyResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave History</h1>
        <p className="text-muted-foreground">View all your leave requests</p>
      </div>
      <LeaveHistoryTable requests={history} />
    </div>
  );
}
