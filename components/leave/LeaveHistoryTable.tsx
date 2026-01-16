'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils/date';

interface LeaveRequest {
  _id: string;
  leaveTypeId: {
    _id: string;
    name: string;
    color: string;
  };
  employeeId?: {
    _id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'declined';
  message?: string;
  adminNotes?: string;
  createdAt: string;
}

interface LeaveHistoryTableProps {
  requests: LeaveRequest[];
  showEmployee?: boolean;
}

export function LeaveHistoryTable({ requests, showEmployee = false }: LeaveHistoryTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave History</CardTitle>
        <CardDescription>
          {showEmployee ? 'All leave requests' : 'Your past and pending leave requests'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No leave requests yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {showEmployee && <TableHead>Employee</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    {showEmployee && request.employeeId && (
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.employeeId.name}</div>
                          <div className="text-sm text-muted-foreground">{request.employeeId.email}</div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: request.leaveTypeId.color }}
                        />
                        <span>{request.leaveTypeId.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(request.startDate)}</TableCell>
                    <TableCell>{formatDate(request.endDate)}</TableCell>
                    <TableCell>{request.days}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>{formatDate(request.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
