'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { createHoliday, deleteHoliday } from '@/app/actions/admin-actions';
import { useRouter } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';

interface Holiday {
  _id: string;
  name: string;
  date: string;
}

interface HolidayManagementProps {
  holidays: Holiday[];
}

export function HolidayManagement({ holidays }: HolidayManagementProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreateHoliday = async () => {
    if (!name.trim() || !date) {
      toast.error('Please enter a name and date');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createHoliday({
        name: name.trim(),
        date,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Holiday created successfully');
        setDialogOpen(false);
        setName('');
        setDate(undefined);
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteHoliday = async (holidayId: string) => {
    setDeletingId(holidayId);
    try {
      const result = await deleteHoliday({ holidayId });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Holiday deleted successfully');
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete holiday');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (value: string) => {
    const d = new Date(value);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Holidays</CardTitle>
          <CardDescription>Manage company holidays visible to employees</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Holiday
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Holiday</DialogTitle>
              <DialogDescription>Add a new holiday with name and date</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="holiday-name">Name</Label>
                <Input
                  id="holiday-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., New Year"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="holiday-date">Date</Label>
                <div className="border rounded-md p-3">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateHoliday} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {holidays.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No holidays defined yet. Create the first holiday.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays.map((holiday) => (
                  <TableRow key={holiday._id}>
                    <TableCell>{holiday.name}</TableCell>
                    <TableCell>{formatDate(holiday.date)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteHoliday(holiday._id)}
                        disabled={deletingId === holiday._id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
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

