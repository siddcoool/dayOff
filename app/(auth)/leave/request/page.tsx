import { getLeaveTypes } from '@/app/actions/shared-actions';
import { LeaveRequestForm } from '@/components/leave/LeaveRequestForm';
import { redirect } from 'next/navigation';
import { getCurrentUserWithRole } from '@/app/actions/shared-actions';

export default async function RequestLeavePage() {
  const user = await getCurrentUserWithRole();
  
  if (!user) {
    redirect('/');
  }

  if (user.role === 'admin') {
    redirect('/admin');
  }

  const leaveTypes = await getLeaveTypes();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Request Leave</h1>
        <p className="text-muted-foreground">Submit a new leave request</p>
      </div>
      <LeaveRequestForm leaveTypes={leaveTypes} />
    </div>
  );
}
