import { Suspense } from 'react';
import { getCurrentUserWithRole } from '@/app/actions/shared-actions';
import { getAllEmployees, getAllLeaveTypes } from '@/app/actions/admin-actions';
import { EmployeeManagement } from '@/components/admin/EmployeeManagement';
import { EmployeeManagementSkeleton } from '@/components/skeletons/EmployeeManagementSkeleton';
import { redirect } from 'next/navigation';

async function EmployeeManagementContent() {
  const [employeesResult, leaveTypesResult] = await Promise.all([
    getAllEmployees(),
    getAllLeaveTypes(),
  ]);

  const employees = employeesResult.success ? employeesResult.data : [];
  const leaveTypes = leaveTypesResult.success ? leaveTypesResult.data : [];

  return <EmployeeManagement employees={employees} leaveTypes={leaveTypes} />;
}

export default async function EmployeesPage() {
  const user = await getCurrentUserWithRole();
  
  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <p className="text-muted-foreground">View and manage employee leave balances</p>
      </div>
      <Suspense fallback={<EmployeeManagementSkeleton />}>
        <EmployeeManagementContent />
      </Suspense>
    </div>
  );
}
