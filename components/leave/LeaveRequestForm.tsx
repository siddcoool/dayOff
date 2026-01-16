'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { requestLeave } from '@/app/actions/employee-actions';
import { calculateBusinessDays } from '@/lib/utils/date';
import { CalendarIcon, AlertCircle } from 'lucide-react';
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
        setError(result.error);
      } else {
        setSuccess(true);
        form.reset();
        setDateRange(undefined);
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request');
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

            <div className="space-y-4">
              <FormLabel>Select Dates</FormLabel>
              <div className="flex justify-center">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={handleDateSelect}
                  numberOfMonths={1}
                  className="rounded-md border"
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </div>
              {dateRange?.from && (
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">From:</span>
                    <span className="font-medium">{format(dateRange.from, 'PPP')}</span>
                  </div>
                  {dateRange.to && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-medium">{format(dateRange.to, 'PPP')}</span>
                    </div>
                  )}
                  {dateRange.from && dateRange.to && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Business Days:</span>
                      <span className="font-semibold">{calculateDays()} days</span>
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

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Leave request submitted successfully!</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
