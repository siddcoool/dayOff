'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { requestLeave } from '@/app/actions/employee-actions';
import { calculateBusinessDays } from '@/lib/utils/date';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

const leaveRequestSchema = z.object({
  leaveTypeId: z.string().min(1, 'Leave type is required'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  message: z.string().optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

interface LeaveType {
  _id: string;
  name: string;
  color: string;
}

interface LeaveRequestFormProps {
  leaveTypes: LeaveType[];
  onSuccess?: () => void;
}

export function LeaveRequestForm({ leaveTypes, onSuccess }: LeaveRequestFormProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof leaveRequestSchema>>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      message: '',
    },
  });

  const handleDateSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) {
      form.setValue('startDate', range.from);
    }
    if (range?.to) {
      form.setValue('endDate', range.to);
    } else if (range?.from) {
      form.setValue('endDate', range.from);
    }
  };

  const calculateDays = () => {
    if (dateRange?.from && dateRange?.to) {
      return calculateBusinessDays(dateRange.from, dateRange.to);
    }
    return 0;
  };

  const onSubmit = async (values: z.infer<typeof leaveRequestSchema>) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await requestLeave({
        leaveTypeId: values.leaveTypeId,
        startDate: values.startDate,
        endDate: values.endDate,
        message: values.message,
      });

      if (result.error) {
        toast.error(result.error);
        setError(result.error);
      } else {
        toast.success('Leave request submitted successfully!');
        form.reset();
        setDateRange(undefined);
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit leave request';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Leave</CardTitle>
        <CardDescription>Select dates and submit your leave request</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="leaveTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-4 block">Select Dates</Label>
                <div className="flex justify-center py-6 px-4 bg-muted/30 rounded-lg">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateSelect}
                    numberOfMonths={1}
                    className="rounded-md border bg-background p-6 shadow-sm [--cell-size:2.5rem] w-full max-w-lg"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </div>
              </div>
              
              {dateRange?.from && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-muted-foreground block text-xs mb-1">From Date</span>
                      <span className="font-semibold text-base">{format(dateRange.from, 'PPP')}</span>
                    </div>
                  </div>
                  {dateRange.to && (
                    <div className="flex items-center gap-3 text-sm">
                      <CalendarIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-muted-foreground block text-xs mb-1">To Date</span>
                        <span className="font-semibold text-base">{format(dateRange.to, 'PPP')}</span>
                      </div>
                    </div>
                  )}
                  {dateRange.from && dateRange.to && (
                    <div className="pt-3 border-t flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">Business Days:</span>
                      <span className="font-bold text-lg text-primary">{calculateDays()} days</span>
                    </div>
                  )}
                </div>
              )}
              
              <FormField
                control={form.control}
                name="startDate"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to Employer (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional information about your leave request..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can provide context or details about your leave request
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button type="submit" disabled={isSubmitting} className="w-full bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
