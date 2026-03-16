import { FinanceManagementSkeleton } from '@/components/skeletons/FinanceManagementSkeleton';

export default function LoadingAdminFinance() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-40 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-80 rounded-md bg-muted animate-pulse mt-2" />
      </div>
      <FinanceManagementSkeleton />
    </div>
  );
}

