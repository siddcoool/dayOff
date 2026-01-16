import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EmployeeManagementSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 pb-2 border-b">
            <Skeleton className="h-4 w-32" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-4 w-24" />
            ))}
            <Skeleton className="h-4 w-20" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-48" />
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-6 w-16" />
              ))}
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
