import { z } from 'zod';

export const leaveRequestSchema = z.object({
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

export const approveLeaveSchema = z.object({
  requestId: z.string().min(1),
  adminNotes: z.string().optional(),
});

export const declineLeaveSchema = z.object({
  requestId: z.string().min(1),
  adminNotes: z.string().min(1, 'Notes are required when declining'),
});

export const assignLeavesSchema = z.object({
  userId: z.string().min(1),
  leaveTypeId: z.string().min(1),
  amount: z.number().positive('Amount must be positive'),
});

export const updateSystemConfigSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
});

export const createLeaveTypeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  defaultMonthlyAccrual: z.number().min(0, 'Accrual must be non-negative'),
});
