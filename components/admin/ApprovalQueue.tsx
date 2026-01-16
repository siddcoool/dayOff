'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { approveLeaveRequest, declineLeaveRequest } from '@/app/actions/admin-actions';
import { formatDate } from '@/lib/utils/date';
import { CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LeaveRequest {
  _id: string;
  employeeId: {
    _id: string;
    name: string;
    email: string;
  };
  leaveTypeId: {
    _id: string;
    name: string;
    color: string;
  };
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'declined';
  message?: string;
  createdAt: string;
}

interface ApprovalQueueProps {
  requests: LeaveRequest[];
}

export function ApprovalQueue({ requests }: ApprovalQueueProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState<string | null>(null);
  const [declineDialogOpen, setDeclineDialogOpen] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const result = await approveLeaveRequest({
        requestId,
        adminNotes: adminNotes || undefined,
      });
      if (result.error) {
        alert(result.error);
      } else {
        setApproveDialogOpen(null);
        setAdminNotes('');
        router.refresh();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requestId: string) => {
    if (!adminNotes.trim()) {
      alert('Please provide a reason for declining');
      return;
    }
    setProcessingId(requestId);
    try {
      const result = await declineLeaveRequest({
        requestId,
        adminNotes,
      });
      if (result.error) {
        alert(result.error);
      } else {
        setDeclineDialogOpen(null);
        setAdminNotes('');
        router.refresh();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to decline request');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Queue</CardTitle>
        <CardDescription>Review and approve or decline leave requests</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No pending requests
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.employeeId.name}</div>
                        <div className="text-sm text-muted-foreground">{request.employeeId.email}</div>
                      </div>
                    </TableCell>
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
                    <TableCell>
                      {request.message ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Employee Message</DialogTitle>
                              <DialogDescription>{request.message}</DialogDescription>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog
                          open={approveDialogOpen === request._id}
                          onOpenChange={(open) => {
                            setApproveDialogOpen(open ? request._id : null);
                            if (!open) setAdminNotes('');
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="default"
                              disabled={processingId === request._id}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Approve Leave Request</DialogTitle>
                              <DialogDescription>
                                Approve leave request for {request.employeeId.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="notes">Admin Notes (Optional)</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Add any notes about this approval..."
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setApproveDialogOpen(null);
                                  setAdminNotes('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleApprove(request._id)}
                                disabled={processingId === request._id}
                              >
                                {processingId === request._id ? 'Processing...' : 'Approve'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Dialog
                          open={declineDialogOpen === request._id}
                          onOpenChange={(open) => {
                            setDeclineDialogOpen(open ? request._id : null);
                            if (!open) setAdminNotes('');
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={processingId === request._id}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Decline Leave Request</DialogTitle>
                              <DialogDescription>
                                Decline leave request for {request.employeeId.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="decline-notes">Reason for Decline *</Label>
                                <Textarea
                                  id="decline-notes"
                                  placeholder="Please provide a reason for declining this request..."
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setDeclineDialogOpen(null);
                                  setAdminNotes('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDecline(request._id)}
                                disabled={processingId === request._id || !adminNotes.trim()}
                              >
                                {processingId === request._id ? 'Processing...' : 'Decline'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
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
