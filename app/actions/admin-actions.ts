'use server';

import connectDB from '@/lib/db/mongodb';
import { requireAdmin } from '@/lib/auth/clerk';
import User from '@/lib/models/User';
import LeaveRequest from '@/lib/models/LeaveRequest';
import LeaveType from '@/lib/models/LeaveType';
import SystemConfig from '@/lib/models/SystemConfig';
import {
  approveLeaveSchema,
  declineLeaveSchema,
  assignLeavesSchema,
  updateSystemConfigSchema,
  createLeaveTypeSchema,
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
  value: any;
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
