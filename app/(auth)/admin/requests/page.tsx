import { Suspense } from 'react';
import { getCurrentUserWithRole } from '@/app/actions/shared-actions';
import { getAllLeaveRequests } from '@/app/actions/admin-actions';
import { LeaveHistoryTable } from '@/components/leave/LeaveHistoryTable';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';
import { redirect } from 'next/navigation';

async function AdminRequestsContent() {
  const requestsResult = await getAllLeaveRequests();
  const requests = requestsResult.success ? requestsResult.data : [];
  return <LeaveHistoryTable requests={requests} showEmployee={true} />;
}

export default async function AdminRequestsPage() {
  const user = await getCurrentUserWithRole();
  
  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Leave Requests</h1>
        <p className="text-muted-foreground">View and manage all leave requests</p>
      </div>
      <Suspense fallback={<TableSkeleton rows={10} />}>
        <AdminRequestsContent />
      </Suspense>
    </div>
  );
}
