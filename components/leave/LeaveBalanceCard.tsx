'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LeaveBalance {
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeColor: string;
  currentBalance: number;
  pendingDays: number;
  availableBalance: number;
}

interface LeaveBalanceCardProps {
  balances: LeaveBalance[];
}

export function LeaveBalanceCard({ balances }: LeaveBalanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Balance</CardTitle>
        <CardDescription>Your current leave balances and pending requests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {balances.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leave types configured</p>
        ) : (
          balances.map((balance) => (
            <div key={balance.leaveTypeId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: balance.leaveTypeColor }}
                />
                <div>
                  <p className="font-medium">{balance.leaveTypeName}</p>
                  {balance.pendingDays > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {balance.pendingDays} day(s) pending
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-lg font-semibold">
                  {balance.availableBalance.toFixed(1)}
                </Badge>
                {balance.currentBalance !== balance.availableBalance && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Total: {balance.currentBalance.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
