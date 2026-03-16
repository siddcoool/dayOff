import { EmployeePayslipsSkeleton } from '@/components/skeletons/EmployeePayslipsSkeleton';

export default function LoadingFinance() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded-md bg-muted animate-pulse mt-2" />
      </div>
      <EmployeePayslipsSkeleton />
    </div>
  );
}

