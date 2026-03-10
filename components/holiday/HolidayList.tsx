'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Holiday {
  _id: string;
  name: string;
  date: string;
}

interface HolidayListProps {
  holidays: Holiday[];
}

export function HolidayList({ holidays }: HolidayListProps) {
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
      <CardHeader>
        <CardTitle>Company Holidays</CardTitle>
        <CardDescription>View upcoming holidays scheduled by your company</CardDescription>
      </CardHeader>
      <CardContent>
        {holidays.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No holidays have been scheduled yet.
          </p>
        ) : (
          <div className="space-y-3">
            {holidays.map((holiday) => (
              <div
                key={holiday._id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="font-medium">{holiday.name}</div>
                <div className="text-sm text-muted-foreground">{formatDate(holiday.date)}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

