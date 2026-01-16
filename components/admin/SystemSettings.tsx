'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateSystemConfig, createLeaveType, updateLeaveType } from '@/app/actions/admin-actions';
import { useRouter } from 'next/navigation';
import { Plus, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface LeaveType {
  _id: string;
  name: string;
  color: string;
  defaultMonthlyAccrual: number;
  isActive: boolean;
}

interface SystemSettingsProps {
  leaveTypes: LeaveType[];
  monthlyAccrual?: number;
}

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#10b981', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#84cc16', label: 'Lime' },
];

export function SystemSettings({ leaveTypes, monthlyAccrual = 1 }: SystemSettingsProps) {
  const router = useRouter();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState<string | null>(null);
  const [newLeaveType, setNewLeaveType] = useState({ name: '', color: '#3b82f6', defaultMonthlyAccrual: 1 });
  const [editLeaveType, setEditLeaveType] = useState<LeaveType | null>(null);
  const [monthlyAccrualValue, setMonthlyAccrualValue] = useState(monthlyAccrual.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateLeaveType = async () => {
    if (!newLeaveType.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createLeaveType(newLeaveType);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Leave type created successfully');
        setCreateDialogOpen(false);
        setNewLeaveType({ name: '', color: '#3b82f6', defaultMonthlyAccrual: 1 });
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create leave type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLeaveType = async () => {
    if (!editLeaveType) return;

    setIsSubmitting(true);
    try {
      const result = await updateLeaveType({
        leaveTypeId: editLeaveType._id,
        ...editLeaveType,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Leave type updated successfully');
        setEditDialogOpen(null);
        setEditLeaveType(null);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update leave type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMonthlyAccrual = async () => {
    const value = parseFloat(monthlyAccrualValue);
    if (isNaN(value) || value < 0) {
      toast.error('Please enter a valid number');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateSystemConfig({
        key: 'defaultMonthlyAccrual',
        value,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Monthly accrual rate updated successfully');
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update monthly accrual');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Accrual Rate</CardTitle>
          <CardDescription>Set the default number of leave days employees gain per month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="monthly-accrual">Days per Month</Label>
              <Input
                id="monthly-accrual"
                type="number"
                step="0.1"
                min="0"
                value={monthlyAccrualValue}
                onChange={(e) => setMonthlyAccrualValue(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleUpdateMonthlyAccrual} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leave Types</CardTitle>
              <CardDescription>Manage leave types and their default accrual rates</CardDescription>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Leave Type
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Leave Type</DialogTitle>
                  <DialogDescription>Add a new leave type to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newLeaveType.name}
                      onChange={(e) => setNewLeaveType({ ...newLeaveType, name: e.target.value })}
                      placeholder="e.g., Sick Leave"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Select
                      value={newLeaveType.color}
                      onValueChange={(value) => setNewLeaveType({ ...newLeaveType, color: value })}
                    >
                      <SelectTrigger id="color">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-4 w-4 rounded-full"
                                style={{ backgroundColor: color.value }}
                              />
                              {color.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accrual">Default Monthly Accrual</Label>
                    <Input
                      id="accrual"
                      type="number"
                      step="0.1"
                      min="0"
                      value={newLeaveType.defaultMonthlyAccrual}
                      onChange={(e) =>
                        setNewLeaveType({
                          ...newLeaveType,
                          defaultMonthlyAccrual: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateLeaveType} disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveTypes.map((type) => (
              <div
                key={type._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <div>
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Default accrual: {type.defaultMonthlyAccrual} days/month
                    </div>
                  </div>
                </div>
                <Dialog
                  open={editDialogOpen === type._id}
                  onOpenChange={(open) => {
                    setEditDialogOpen(open ? type._id : null);
                    if (open) {
                      setEditLeaveType(type);
                    } else {
                      setEditLeaveType(null);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Leave Type</DialogTitle>
                      <DialogDescription>Update leave type details</DialogDescription>
                    </DialogHeader>
                    {editLeaveType && (
                      <>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                              id="edit-name"
                              value={editLeaveType.name}
                              onChange={(e) =>
                                setEditLeaveType({ ...editLeaveType, name: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-color">Color</Label>
                            <Select
                              value={editLeaveType.color}
                              onValueChange={(value) =>
                                setEditLeaveType({ ...editLeaveType, color: value })
                              }
                            >
                              <SelectTrigger id="edit-color">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {COLOR_OPTIONS.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="h-4 w-4 rounded-full"
                                        style={{ backgroundColor: color.value }}
                                      />
                                      {color.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-accrual">Default Monthly Accrual</Label>
                            <Input
                              id="edit-accrual"
                              type="number"
                              step="0.1"
                              min="0"
                              value={editLeaveType.defaultMonthlyAccrual}
                              onChange={(e) =>
                                setEditLeaveType({
                                  ...editLeaveType,
                                  defaultMonthlyAccrual: parseFloat(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditDialogOpen(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateLeaveType} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                          </Button>
                        </DialogFooter>
                      </>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
