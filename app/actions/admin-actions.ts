'use server';

import connectDB from '@/lib/db/mongodb';
import { requireAdmin } from '@/lib/auth/clerk';
import User from '@/lib/models/User';
import LeaveRequest from '@/lib/models/LeaveRequest';
import LeaveType from '@/lib/models/LeaveType';
import SystemConfig from '@/lib/models/SystemConfig';
import Holiday from '@/lib/models/Holiday';
import SalaryPayment from '@/lib/models/SalaryPayment';
import {
  approveLeaveSchema,
  declineLeaveSchema,
  assignLeavesSchema,
  updateSystemConfigSchema,
  createLeaveTypeSchema,
  createHolidaySchema,
  updateEmployeeSalarySchema,
  markSalariesAsPaidSchema,
} from '@/lib/utils/validation';
import { revalidatePath } from 'next/cache';

export async function approveLeaveRequest(formData: {
  requestId: string;
  adminNotes?: string;
}) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const validated = approveLeaveSchema.parse(formData);
    const request = await LeaveRequest.findById(validated.requestId)
      .populate('employeeId')
      .populate('leaveTypeId');

    if (!request) {
      return { error: 'Leave request not found' };
    }

    if (request.status !== 'pending') {
      return { error: 'Request already processed' };
    }

    const employee = await User.findById(request.employeeId);
    if (!employee) {
      return { error: 'Employee not found' };
    }

    const currentBalance = employee.leaveBalances.get(request.leaveTypeId._id.toString()) || 0;
    if (currentBalance < request.days) {
      return { error: 'Employee has insufficient balance' };
    }

    const newBalance = currentBalance - request.days;
    employee.leaveBalances.set(request.leaveTypeId._id.toString(), newBalance);
    await employee.save();

    request.status = 'approved';
    request.reviewedBy = admin._id;
    request.reviewedAt = new Date();
    if (validated.adminNotes) {
      request.adminNotes = validated.adminNotes;
    }
    await request.save();

    revalidatePath('/admin/requests');
    revalidatePath('/dashboard');
    revalidatePath('/leave/history');

    return { success: true, data: JSON.parse(JSON.stringify(request)) };
  } catch (error: any) {
    console.error('Error approving leave:', error);
    return { error: error.message || 'Failed to approve leave request' };
  }
}

export async function declineLeaveRequest(formData: {
  requestId: string;
  adminNotes: string;
}) {
  try {
    const admin = await requireAdmin();
    await connectDB();

    const validated = declineLeaveSchema.parse(formData);
    const request = await LeaveRequest.findById(validated.requestId);

    if (!request) {
      return { error: 'Leave request not found' };
    }

    if (request.status !== 'pending') {
      return { error: 'Request already processed' };
    }

    request.status = 'declined';
    request.reviewedBy = admin._id;
    request.reviewedAt = new Date();
    request.adminNotes = validated.adminNotes;
    await request.save();

    revalidatePath('/admin/requests');
    revalidatePath('/dashboard');
    revalidatePath('/leave/history');

    return { success: true, data: JSON.parse(JSON.stringify(request)) };
  } catch (error: any) {
    console.error('Error declining leave:', error);
    return { error: error.message || 'Failed to decline leave request' };
  }
}

export async function assignAdditionalLeaves(formData: {
  userId: string;
  leaveTypeId: string;
  amount: number;
}) {
  try {
    await requireAdmin();
    await connectDB();

    const validated = assignLeavesSchema.parse(formData);
    const user = await User.findById(validated.userId);
    const leaveType = await LeaveType.findById(validated.leaveTypeId);

    if (!user) {
      return { error: 'User not found' };
    }
    if (!leaveType) {
      return { error: 'Leave type not found' };
    }

    const currentBalance = user.leaveBalances.get(validated.leaveTypeId) || 0;
    const newBalance = currentBalance + validated.amount;
    user.leaveBalances.set(validated.leaveTypeId, newBalance);
    await user.save();

    revalidatePath('/admin/employees');
    revalidatePath('/dashboard');

    return { success: true, data: { newBalance } };
  } catch (error: any) {
    console.error('Error assigning leaves:', error);
    return { error: error.message || 'Failed to assign leaves' };
  }
}

export async function getAllEmployees() {
  try {
    await requireAdmin();
    await connectDB();

    const employees = await User.find({ role: 'employee' })
      .select('name email leaveBalances createdAt')
      .sort({ name: 1 });

    const leaveTypes = await LeaveType.find({ isActive: true });

    const employeesWithBalances = employees.map((emp) => {
      const balances = leaveTypes.map((type) => ({
        leaveTypeId: type._id.toString(),
        leaveTypeName: type.name,
        leaveTypeColor: type.color,
        balance: emp.leaveBalances.get(type._id.toString()) || 0,
      }));

      return {
        _id: emp._id.toString(),
        name: emp.name,
        email: emp.email,
        balances,
        createdAt: emp.createdAt,
      };
    });

    return { success: true, data: employeesWithBalances };
  } catch (error: any) {
    console.error('Error getting employees:', error);
    return { error: error.message || 'Failed to get employees' };
  }
}

export async function getAllLeaveRequests(filters?: {
  status?: string;
  employeeId?: string;
}) {
  try {
    await requireAdmin();
    await connectDB();

    const query: any = {};
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.employeeId) {
      query.employeeId = filters.employeeId;
    }

    const requests = await LeaveRequest.find(query)
      .populate('employeeId', 'name email')
      .populate('leaveTypeId', 'name color')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(100);

    return { success: true, data: JSON.parse(JSON.stringify(requests)) };
  } catch (error: any) {
    console.error('Error getting leave requests:', error);
    return { error: error.message || 'Failed to get leave requests' };
  }
}

export async function updateSystemConfig(formData: {
  key: string;
  value: unknown;
}) {
  try {
    await requireAdmin();
    await connectDB();

    const validated = updateSystemConfigSchema.parse(formData);
    const config = await SystemConfig.findOneAndUpdate(
      { key: validated.key },
      { value: validated.value },
      { upsert: true, new: true }
    );

    revalidatePath('/admin/settings');

    return { success: true, data: JSON.parse(JSON.stringify(config)) };
  } catch (error: any) {
    console.error('Error updating system config:', error);
    return { error: error.message || 'Failed to update system config' };
  }
}

export async function createLeaveType(formData: {
  name: string;
  color: string;
  defaultMonthlyAccrual: number;
}) {
  try {
    await requireAdmin();
    await connectDB();

    const validated = createLeaveTypeSchema.parse(formData);
    const leaveType = await LeaveType.create(validated);

    revalidatePath('/admin/settings');

    return { success: true, data: JSON.parse(JSON.stringify(leaveType)) };
  } catch (error: any) {
    console.error('Error creating leave type:', error);
    if (error.code === 11000) {
      return { error: 'Leave type with this name already exists' };
    }
    return { error: error.message || 'Failed to create leave type' };
  }
}

export async function updateLeaveType(formData: {
  leaveTypeId: string;
  name?: string;
  color?: string;
  defaultMonthlyAccrual?: number;
  isActive?: boolean;
}) {
  try {
    await requireAdmin();
    await connectDB();

    const { leaveTypeId, ...updates } = formData;
    const leaveType = await LeaveType.findByIdAndUpdate(
      leaveTypeId,
      updates,
      { new: true }
    );

    if (!leaveType) {
      return { error: 'Leave type not found' };
    }

    revalidatePath('/admin/settings');

    return { success: true, data: JSON.parse(JSON.stringify(leaveType)) };
  } catch (error: any) {
    console.error('Error updating leave type:', error);
    return { error: error.message || 'Failed to update leave type' };
  }
}

export async function getSystemConfig() {
  try {
    await requireAdmin();
    await connectDB();

    const configs = await SystemConfig.find();
    const configMap: Record<string, any> = {};
    configs.forEach((config) => {
      configMap[config.key] = config.value;
    });

    return { success: true, data: configMap };
  } catch (error: any) {
    console.error('Error getting system config:', error);
    return { error: error.message || 'Failed to get system config' };
  }
}

export async function getAllLeaveTypes() {
  try {
    await requireAdmin();
    await connectDB();

    const leaveTypes = await LeaveType.find().sort({ name: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(leaveTypes)) };
  } catch (error: any) {
    console.error('Error getting leave types:', error);
    return { error: error.message || 'Failed to get leave types' };
  }
}

export async function getAllHolidays() {
  try {
    await requireAdmin();
    await connectDB();

    const holidays = await Holiday.find().sort({ date: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(holidays)) };
  } catch (error: any) {
    console.error('Error getting holidays:', error);
    return { error: error.message || 'Failed to get holidays' };
  }
}

export async function createHoliday(formData: { name: string; date: Date }) {
  try {
    await requireAdmin();
    await connectDB();

    const validated = createHolidaySchema.parse({
      ...formData,
      date: new Date(formData.date),
    });

    const existing = await Holiday.findOne({ date: validated.date });
    if (existing) {
      return { error: 'A holiday already exists on this date' };
    }

    const holiday = await Holiday.create(validated);

    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return { success: true, data: JSON.parse(JSON.stringify(holiday)) };
  } catch (error: any) {
    console.error('Error creating holiday:', error);
    return { error: error.message || 'Failed to create holiday' };
  }
}

export async function deleteHoliday(formData: { holidayId: string }) {
  try {
    await requireAdmin();
    await connectDB();

    const deleted = await Holiday.findByIdAndDelete(formData.holidayId);
    if (!deleted) {
      return { error: 'Holiday not found' };
    }

    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting holiday:', error);
    return { error: error.message || 'Failed to delete holiday' };
  }
}

export async function getAllEmployeesWithFinance() {
  try {
    await requireAdmin();
    await connectDB();

    const employees = await User.find({ role: 'employee' })
      .select('name email baseSalary createdAt')
      .sort({ name: 1 });

    const employeeIds = employees.map((emp) => emp._id);

    const payments = await SalaryPayment.find({
      employeeId: { $in: employeeIds },
    })
      .sort({ payDate: -1 })
      .lean();

    const latestPaymentByEmployee = new Map<
      string,
      {
        amount: number;
        payDate: Date;
        periodMonth: number;
        periodYear: number;
      }
    >();

    for (const payment of payments) {
      const key = payment.employeeId.toString();
      if (!latestPaymentByEmployee.has(key)) {
        latestPaymentByEmployee.set(key, {
          amount: payment.amount,
          payDate: payment.payDate,
          periodMonth: payment.periodMonth,
          periodYear: payment.periodYear,
        });
      }
    }

    const result = employees.map((emp) => {
      const key = emp._id.toString();
      const latest = latestPaymentByEmployee.get(key) || null;

      return {
        _id: key,
        name: emp.name,
        email: emp.email,
        baseSalary: emp.baseSalary ?? null,
        latestPayment: latest
          ? {
              amount: latest.amount,
              payDate: latest.payDate,
              periodMonth: latest.periodMonth,
              periodYear: latest.periodYear,
            }
          : null,
        createdAt: emp.createdAt,
      };
    });

    return { success: true, data: JSON.parse(JSON.stringify(result)) };
  } catch (error: any) {
    console.error('Error getting employees with finance data:', error);
    return { error: error.message || 'Failed to get employees' };
  }
}

export async function updateEmployeeSalary(formData: {
  userId: string;
  baseSalary: number;
}) {
  try {
    await requireAdmin();
    await connectDB();

    const { userId, baseSalary } = updateEmployeeSalarySchema.parse(formData);

    const user = await User.findOneAndUpdate(
      { _id: userId, role: 'employee' },
      { baseSalary },
      { new: true }
    );

    if (!user) {
      return { error: 'Employee not found' };
    }

    revalidatePath('/admin/finance');

    return {
      success: true,
      data: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        baseSalary: user.baseSalary ?? null,
      },
    };
  } catch (error: any) {
    console.error('Error updating employee salary:', error);
    return { error: error.message || 'Failed to update employee salary' };
  }
}

export async function markSalariesAsPaid(formData: {
  employeeIds: string[];
  periodMonth: number;
  periodYear: number;
  payDate: Date;
}) {
  try {
    await requireAdmin();
    await connectDB();

    const { employeeIds, periodMonth, periodYear, payDate } =
      markSalariesAsPaidSchema.parse({
        ...formData,
        payDate: new Date(formData.payDate),
      });

    const employees = await User.find({
      _id: { $in: employeeIds },
      role: 'employee',
    });

    if (employees.length === 0) {
      return { error: 'No valid employees found' };
    }

    const missingSalary: string[] = [];

    for (const emp of employees) {
      if (emp.baseSalary == null || typeof emp.baseSalary !== 'number' || emp.baseSalary <= 0) {
        missingSalary.push(emp.name || emp.email);
      }
    }

    if (missingSalary.length > 0) {
      return {
        error: `Base salary not set for: ${missingSalary.join(', ')}`,
      };
    }

    let createdCount = 0;

    for (const emp of employees) {
      await SalaryPayment.findOneAndUpdate(
        {
          employeeId: emp._id,
          periodMonth,
          periodYear,
        },
        {
          $set: {
            amount: emp.baseSalary,
            payDate,
            status: 'PAID',
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
      createdCount += 1;
    }

    revalidatePath('/admin/finance');

    return {
      success: true,
      data: {
        processedEmployees: createdCount,
        periodMonth,
        periodYear,
        payDate,
      },
    };
  } catch (error: any) {
    console.error('Error marking salaries as paid:', error);
    return { error: error.message || 'Failed to mark salaries as paid' };
  }
}
