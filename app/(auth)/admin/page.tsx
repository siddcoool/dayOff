import { Suspense } from 'react';
import { getCurrentUserWithRole } from '@/app/actions/shared-actions';
import { getAllLeaveRequests, getAllEmployees } from '@/app/actions/admin-actions';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ApprovalQueue } from '@/components/admin/ApprovalQueue';
import { AdminDashboardSkeleton } from '@/components/skeletons/AdminDashboardSkeleton';
import { redirect } from 'next/navigation';
import { startOfMonth, endOfMonth } from 'date-fns';

async function AdminDashboardContent() {
  const [requestsResult, employeesResult] = await Promise.all([
    getAllLeaveRequests(),
    getAllEmployees(),
  ]);

  const requests = requestsResult.success ? requestsResult.data : [];
  const employees = employeesResult.success ? employeesResult.data : [];
  
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const pendingRequests = requests.filter((r: any) => r.status === 'pending');
  const approvedThisMonth = requests.filter(
    (r: any) => r.status === 'approved' && 
    new Date(r.reviewedAt || r.createdAt) >= monthStart &&
    new Date(r.reviewedAt || r.createdAt) <= monthEnd
  ).length;
  const declinedThisMonth = requests.filter(
    (r: any) => r.status === 'declined' && 
    new Date(r.reviewedAt || r.createdAt) >= monthStart &&
    new Date(r.reviewedAt || r.createdAt) <= monthEnd
  ).length;

  return (
    <>
      <AdminDashboard
        stats={{
          totalEmployees: employees.length,
          pendingRequests: pendingRequests.length,
          approvedThisMonth,
          declinedThisMonth,
        }}
      />
      <ApprovalQueue requests={requests} />
    </>
  );
}

export default async function AdminPage() {
  const user = await getCurrentUserWithRole();
  
  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage leave requests and employees</p>
      </div>
      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboardContent />
      </Suspense>
    </div>
  );
}
