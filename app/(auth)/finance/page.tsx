import { Suspense } from 'react';
import { getCurrentUserWithRole } from '@/app/actions/shared-actions';
import { getMySalaryPayments } from '@/app/actions/employee-actions';
import { EmployeePayslips } from '@/components/finance/EmployeePayslips';
import { EmployeePayslipsSkeleton } from '@/components/skeletons/EmployeePayslipsSkeleton';
import { redirect } from 'next/navigation';

async function EmployeePayslipsContent() {
  const paymentsResult = await getMySalaryPayments();
  const payments = paymentsResult.success ? paymentsResult.data : [];

  return <EmployeePayslips payments={payments} />;
}

export default async function FinancePage() {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect('/');
  }

  if (user.role !== 'employee') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payslips</h1>
        <p className="text-muted-foreground">View and download your salary payslips.</p>
      </div>
      <Suspense fallback={<EmployeePayslipsSkeleton />}>
        <EmployeePayslipsContent />
      </Suspense>
    </div>
  );
}

