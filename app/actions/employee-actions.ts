'use server';

import connectDB from '@/lib/db/mongodb';
import { requireAuth } from '@/lib/auth/clerk';
import User from '@/lib/models/User';
import LeaveRequest from '@/lib/models/LeaveRequest';
import LeaveType from '@/lib/models/LeaveType';
import Holiday from '@/lib/models/Holiday';
import SalaryPayment from '@/lib/models/SalaryPayment';
import { leaveRequestSchema } from '@/lib/utils/validation';
import { calculateBusinessDays } from '@/lib/utils/date';
import { revalidatePath } from 'next/cache';

export async function requestLeave(formData: {
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  message?: string;
}) {
  try {
    const user = await requireAuth();
    await connectDB();

    const validated = leaveRequestSchema.parse({
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
    });

    const leaveType = await LeaveType.findById(validated.leaveTypeId);
    if (!leaveType || !leaveType.isActive) {
      return { error: 'Invalid leave type' };
    }

    const days = calculateBusinessDays(validated.startDate, validated.endDate);
    if (days <= 0) {
      return { error: 'Invalid date range' };
    }

    const userDoc = await User.findById(user._id);
    if (!userDoc) {
      return { error: 'User not found' };
    }

    const currentBalance = userDoc.leaveBalances.get(validated.leaveTypeId) || 0;
    
    // Check pending requests for this leave type
    const pendingRequests = await LeaveRequest.find({
      employeeId: user._id,
      leaveTypeId: validated.leaveTypeId,
      status: 'pending',
    });
    
    const pendingDays = pendingRequests.reduce((sum, req) => sum + req.days, 0);
    const availableBalance = currentBalance - pendingDays;

    if (days > availableBalance) {
      return { error: `Insufficient balance. Available: ${availableBalance} days` };
    }

    const leaveRequest = await LeaveRequest.create({
      employeeId: user._id,
      leaveTypeId: validated.leaveTypeId,
      startDate: validated.startDate,
      endDate: validated.endDate,
      days,
      message: validated.message,
      status: 'pending',
    });

    revalidatePath('/dashboard');
    revalidatePath('/leave/history');
    revalidatePath('/admin/requests');

    return { success: true, data: JSON.parse(JSON.stringify(leaveRequest)) };
  } catch (error: any) {
    console.error('Error requesting leave:', error);
    return { error: error.message || 'Failed to request leave' };
  }
}

export async function getMyLeaveBalance() {
  try {
    const user = await requireAuth();
    await connectDB();

    const userDoc = await User.findById(user._id).populate('leaveBalances');
    if (!userDoc) {
      return { error: 'User not found' };
    }

    const leaveTypes = await LeaveType.find({ isActive: true });
    const pendingRequests = await LeaveRequest.find({
      employeeId: user._id,
      status: 'pending',
    });

    const balances = leaveTypes.map((type) => {
      const currentBalance = userDoc.leaveBalances.get(type._id.toString()) || 0;
      const pendingDays = pendingRequests
        .filter((req) => req.leaveTypeId.toString() === type._id.toString())
        .reduce((sum, req) => sum + req.days, 0);
      
      return {
        leaveTypeId: type._id.toString(),
        leaveTypeName: type.name,
        leaveTypeColor: type.color,
        currentBalance,
        pendingDays,
        availableBalance: currentBalance - pendingDays,
      };
    });

    return { success: true, data: balances };
  } catch (error: any) {
    console.error('Error getting leave balance:', error);
    return { error: error.message || 'Failed to get leave balance' };
  }
}

export async function getMyLeaveHistory() {
  try {
    const user = await requireAuth();
    await connectDB();

    const requests = await LeaveRequest.find({ employeeId: user._id })
      .populate('leaveTypeId', 'name color')
      .sort({ createdAt: -1 })
      .limit(50);

    return { success: true, data: JSON.parse(JSON.stringify(requests)) };
  } catch (error: any) {
    console.error('Error getting leave history:', error);
    return { error: error.message || 'Failed to get leave history' };
  }
}

export async function getMyPendingRequests() {
  try {
    const user = await requireAuth();
    await connectDB();

    const requests = await LeaveRequest.find({
      employeeId: user._id,
      status: 'pending',
    })
      .populate('leaveTypeId', 'name color')
      .sort({ createdAt: -1 });

    return { success: true, data: JSON.parse(JSON.stringify(requests)) };
  } catch (error: any) {
    console.error('Error getting pending requests:', error);
    return { error: error.message || 'Failed to get pending requests' };
  }
}

export async function getHolidays() {
  try {
    await requireAuth();
    await connectDB();

    const holidays = await Holiday.find().sort({ date: 1 });
    return { success: true, data: JSON.parse(JSON.stringify(holidays)) };
  } catch (error: any) {
    console.error('Error getting holidays:', error);
    return { error: error.message || 'Failed to get holidays' };
  }
}

export async function getMySalaryPayments() {
  try {
    const user = await requireAuth();
    await connectDB();

    const payments = await SalaryPayment.find({
      employeeId: user._id,
    })
      .sort({ payDate: -1 })
      .lean();

    return {
      success: true,
      data: payments.map((p) => ({
        _id: p._id.toString(),
        amount: p.amount,
        periodMonth: p.periodMonth,
        periodYear: p.periodYear,
        payDate: p.payDate,
        status: p.status,
      })),
    };
  } catch (error: any) {
    console.error('Error getting salary payments:', error);
    return { error: error.message || 'Failed to get salary payments' };
  }
}

export async function getPayslipById(id: string) {
  try {
    const user = await requireAuth();
    await connectDB();

    const payment = await SalaryPayment.findById(id).populate('employeeId', 'name email');

    if (!payment) {
      return { error: 'Payslip not found' };
    }

    const isOwner =
      payment.employeeId && 'id' in payment.employeeId
        ? (payment.employeeId as any)._id.toString() === user._id.toString()
        : payment.employeeId?.toString() === user._id.toString();

    if (!isOwner && user.role !== 'admin') {
      return { error: 'Not authorized to view this payslip' };
    }

    const employeeName =
      payment.employeeId && 'name' in payment.employeeId
        ? (payment.employeeId as any).name
        : undefined;

    return {
      success: true,
      data: {
        _id: payment._id.toString(),
        employeeName: employeeName || 'Employee',
        employeeId: payment.employeeId,
        amount: payment.amount,
        periodMonth: payment.periodMonth,
        periodYear: payment.periodYear,
        payDate: payment.payDate,
        status: payment.status,
      },
    };
  } catch (error: any) {
    console.error('Error getting payslip:', error);
    return { error: error.message || 'Failed to get payslip' };
  }
}
