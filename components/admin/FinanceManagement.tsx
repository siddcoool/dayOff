'use client';

import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { markSalariesAsPaid, updateEmployeeSalary } from '@/app/actions/admin-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface LatestPayment {
  amount: number;
  periodMonth: number;
  periodYear: number;
  payDate: string;
}

interface FinanceEmployee {
  _id: string;
  name: string;
  email: string;
  baseSalary: number | null;
  latestPayment: LatestPayment | null;
}

interface FinanceManagementProps {
  employees: FinanceEmployee[];
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function FinanceManagement({ employees }: FinanceManagementProps) {
  const router = useRouter();
  const [editingSalaries, setEditingSalaries] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const emp of employees) {
      if (emp.baseSalary != null) {
        initial[emp._id] = emp.baseSalary.toString();
      }
    }
    return initial;
  });
  const [savingSalaryFor, setSavingSalaryFor] = useState<string | null>(null);

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  const [month, setMonth] = useState<string>(() => {
    const now = new Date();
    return String(now.getMonth() + 1);
  });
  const [year, setYear] = useState<string>(() => String(new Date().getFullYear()));
  const [payDate, setPayDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  });
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  const allSelected = useMemo(() => {
    if (employees.length === 0) return false;
    return employees.every((e) => selectedEmployeeIds.has(e._id));
  }, [employees, selectedEmployeeIds]);

  const totalSelectedAmount = useMemo(() => {
    let total = 0;
    for (const emp of employees) {
      if (selectedEmployeeIds.has(emp._id) && emp.baseSalary != null) {
        total += emp.baseSalary;
      }
    }
    return total;
  }, [employees, selectedEmployeeIds]);

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedEmployeeIds((prev) => {
      if (employees.length === 0) return prev;
      if (prev.size === employees.length) {
        return new Set();
      }
      return new Set(employees.map((e) => e._id));
    });
  };

  const handleSaveSalary = async (employeeId: string) => {
    const value = editingSalaries[employeeId];
    const amount = Number(value);

    if (!value || Number.isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid salary amount');
      return;
    }

    setSavingSalaryFor(employeeId);
    try {
      const result = await updateEmployeeSalary({
        userId: employeeId,
        baseSalary: amount,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Salary updated');
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update salary');
    } finally {
      setSavingSalaryFor(null);
    }
  };

  const handleMarkPaid = async () => {
    if (selectedEmployeeIds.size === 0) {
      toast.error('Please select at least one employee');
      return;
    }

    const periodMonth = Number(month);
    const periodYear = Number(year);

    if (
      Number.isNaN(periodMonth) ||
      Number.isNaN(periodYear) ||
      periodMonth < 1 ||
      periodMonth > 12
    ) {
      toast.error('Please select a valid month and year');
      return;
    }

    if (!payDate) {
      toast.error('Please select a pay date');
      return;
    }

    setIsMarkingPaid(true);
    try {
      const result = await markSalariesAsPaid({
        employeeIds: Array.from(selectedEmployeeIds),
        periodMonth,
        periodYear,
        payDate: new Date(payDate),
      } as any);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Salaries marked as paid');
        setSelectedEmployeeIds(new Set());
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to mark salaries as paid');
    } finally {
      setIsMarkingPaid(false);
    }
  };

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const range: number[] = [];
    for (let y = currentYear - 2; y <= currentYear + 2; y += 1) {
      range.push(y);
    }
    return range;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finance Management</CardTitle>
        <CardDescription>
          Set fixed monthly salaries and record payouts for ClassyEndeavors employees.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 items-end">
          <div className="space-y-2">
            <Label>Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m) => (
                  <SelectItem key={m.value} value={String(m.value)}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Pay date</Label>
            <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="invisible">Actions</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className="w-full"
                  variant="outline"
                  disabled={isMarkingPaid}
                >
                  Mark selected as paid
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="bg-background">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Confirm salary payments</p>
                  <p className="text-xs text-muted-foreground">
                    You are about to record salaries as paid for{' '}
                    <span className="font-semibold">{selectedEmployeeIds.size}</span> employee
                    {selectedEmployeeIds.size === 1 ? '' : 's'} for{' '}
                    <span className="font-semibold">
                      {MONTHS.find((m) => String(m.value) === month)?.label} {year}
                    </span>
                    .
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total amount:{' '}
                    <span className="font-semibold">
                      ₹ {totalSelectedAmount.toLocaleString('en-IN')}
                    </span>
                  </p>
                  <Button
                    className="w-full"
                    onClick={handleMarkPaid}
                    disabled={isMarkingPaid || selectedEmployeeIds.size === 0}
                  >
                    {isMarkingPaid ? 'Recording...' : 'Confirm & mark as paid'}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {employees.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No employees found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Base salary (INR)</TableHead>
                  <TableHead>Last paid</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => {
                  const latest = employee.latestPayment;
                  const salaryValue = editingSalaries[employee._id] ?? '';

                  return (
                    <TableRow key={employee._id}>
                      <TableCell>
                        <Input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={selectedEmployeeIds.has(employee._id)}
                          onChange={() => toggleEmployee(employee._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-muted-foreground">{employee.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-xs">
                          <Input
                            type="number"
                            min={0}
                            step={1000}
                            value={salaryValue}
                            onChange={(e) =>
                              setEditingSalaries((prev) => ({
                                ...prev,
                                [employee._id]: e.target.value,
                              }))
                            }
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveSalary(employee._id)}
                            disabled={savingSalaryFor === employee._id}
                          >
                            {savingSalaryFor === employee._id ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {latest ? (
                          <div className="text-sm">
                            <div>
                              {MONTHS.find((m) => m.value === latest.periodMonth)?.label}{' '}
                              {latest.periodYear}
                            </div>
                            <div className="text-muted-foreground">
                              ₹ {latest.amount.toLocaleString('en-IN')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No payments yet</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {selectedEmployeeIds.has(employee._id) ? (
                          <span className="text-xs text-muted-foreground">
                            Included in current payout
                          </span>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

