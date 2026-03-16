import { Suspense } from 'react';
import { getCurrentUserWithRole } from '@/app/actions/shared-actions';
import { getAllEmployeesWithFinance } from '@/app/actions/admin-actions';
import { FinanceManagement } from '@/components/admin/FinanceManagement';
import { FinanceManagementSkeleton } from '@/components/skeletons/FinanceManagementSkeleton';
import { redirect } from 'next/navigation';

async function FinanceManagementContent() {
  const employeesResult = await getAllEmployeesWithFinance();

  const employees = employeesResult.success ? employeesResult.data : [];

  return <FinanceManagement employees={employees} />;
}

export default async function AdminFinancePage() {
  const user = await getCurrentUserWithRole();

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance</h1>
        <p className="text-muted-foreground">
          Manage employee base salaries and record monthly payments
        </p>
      </div>
      <Suspense fallback={<FinanceManagementSkeleton />}>
        <FinanceManagementContent />
      </Suspense>
    </div>
  );
}

