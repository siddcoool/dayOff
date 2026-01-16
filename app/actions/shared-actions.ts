'use server';

import connectDB from '@/lib/db/mongodb';
import { getCurrentUser } from '@/lib/auth/clerk';
import LeaveType from '@/lib/models/LeaveType';
import User from '@/lib/models/User';

export async function getLeaveTypes() {
  await connectDB();
  const leaveTypes = await LeaveType.find({ isActive: true }).sort({ name: 1 });
  return JSON.parse(JSON.stringify(leaveTypes));
}

export async function getCurrentUserWithRole() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return JSON.parse(JSON.stringify(user));
}
