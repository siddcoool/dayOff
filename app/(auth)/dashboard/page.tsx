import { getCurrentUserWithRole } from '@/app/actions/shared-actions';
import { getMyLeaveBalance, getMyPendingRequests } from '@/app/actions/employee-actions';
import { getAllLeaveRequests, getAllEmployees } from '@/app/actions/admin-actions';
import { LeaveBalanceCard } from '@/components/leave/LeaveBalanceCard';
import { LeaveHistoryTable } from '@/components/leave/LeaveHistoryTable';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ApprovalQueue } from '@/components/admin/ApprovalQueue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { startOfMonth, endOfMonth } from 'date-fns';

export default async function DashboardPage() {
  const user = await getCurrentUserWithRole();
  
  if (!user) {
    redirect('/');
  }

  if (user.role === 'admin') {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage leave requests and employees</p>
        </div>
        <AdminDashboard
          stats={{
            totalEmployees: employees.length,
            pendingRequests: pendingRequests.length,
            approvedThisMonth,
            declinedThisMonth,
          }}
        />
        <ApprovalQueue requests={requests} />
      </div>
    );
  }

  // Employee dashboard
  const [balanceResult, historyResult, pendingResult] = await Promise.all([
    getMyLeaveBalance(),
    getMyLeaveHistory(),
    getMyPendingRequests(),
  ]);

  const balances = balanceResult.success ? balanceResult.data : [];
  const history = historyResult.success ? historyResult.data : [];
  const pending = pendingResult.success ? pendingResult.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}</p>
      </div>
      <LeaveBalanceCard balances={balances} />
      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Your leave requests awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <LeaveHistoryTable requests={pending} />
          </CardContent>
        </Card>
      )}
      <LeaveHistoryTable requests={history.slice(0, 10)} />
    </div>
  );
}
