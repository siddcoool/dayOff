'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assignAdditionalLeaves } from '@/app/actions/admin-actions';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface Employee {
  _id: string;
  name: string;
  email: string;
  balances: Array<{
    leaveTypeId: string;
    leaveTypeName: string;
    leaveTypeColor: string;
    balance: number;
  }>;
}

interface LeaveType {
  _id: string;
  name: string;
  color: string;
}

interface EmployeeManagementProps {
  employees: Employee[];
  leaveTypes: LeaveType[];
}

export function EmployeeManagement({ employees, leaveTypes }: EmployeeManagementProps) {
  const router = useRouter();
  const [assignDialogOpen, setAssignDialogOpen] = useState<string | null>(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssignLeaves = async (userId: string) => {
    if (!selectedLeaveType || !amount || parseFloat(amount) <= 0) {
      toast.error('Please select a leave type and enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await assignAdditionalLeaves({
        userId,
        leaveTypeId: selectedLeaveType,
        amount: parseFloat(amount),
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Successfully assigned ${amount} leave days`);
        setAssignDialogOpen(null);
        setSelectedLeaveType('');
        setAmount('');
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign leaves');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Management</CardTitle>
        <CardDescription>View employee leave balances and assign additional leaves</CardDescription>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No employees found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  {leaveTypes.map((type) => (
                    <TableHead key={type._id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        {type.name}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">{employee.email}</div>
                      </div>
                    </TableCell>
                    {leaveTypes.map((type) => {
                      const balance = employee.balances.find((b) => b.leaveTypeId === type._id);
                      return (
                        <TableCell key={type._id}>
                          <Badge variant="outline">{balance?.balance.toFixed(1) || '0.0'}</Badge>
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      <Dialog
                        open={assignDialogOpen === employee._id}
                        onOpenChange={(open) => {
                          setAssignDialogOpen(open ? employee._id : null);
                          if (!open) {
                            setSelectedLeaveType('');
                            setAmount('');
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-1" />
                            Assign
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Additional Leaves</DialogTitle>
                            <DialogDescription>
                              Assign additional leave days to {employee.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="leave-type">Leave Type</Label>
                              <Select value={selectedLeaveType} onValueChange={setSelectedLeaveType}>
                                <SelectTrigger id="leave-type">
                                  <SelectValue placeholder="Select leave type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {leaveTypes.map((type) => (
                                    <SelectItem key={type._id} value={type._id}>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="h-3 w-3 rounded-full"
                                          style={{ backgroundColor: type.color }}
                                        />
                                        {type.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="amount">Amount (days)</Label>
                              <Input
                                id="amount"
                                type="number"
                                step="0.5"
                                min="0.5"
                                placeholder="Enter number of days"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setAssignDialogOpen(null);
                                setSelectedLeaveType('');
                                setAmount('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleAssignLeaves(employee._id)}
                              disabled={isSubmitting || !selectedLeaveType || !amount}
                            >
                              {isSubmitting ? 'Assigning...' : 'Assign'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
