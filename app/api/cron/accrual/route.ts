import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import LeaveType from '@/lib/models/LeaveType';
import LeaveAccrual from '@/lib/models/LeaveAccrual';
import SystemConfig from '@/lib/models/SystemConfig';
import { getCurrentMonth } from '@/lib/utils/date';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a cron job (you can add additional security here)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const currentMonth = getCurrentMonth();
    
    // Get default monthly accrual from system config
    const config = await SystemConfig.findOne({ key: 'defaultMonthlyAccrual' });
    const defaultAccrual = config?.value || 1;

    // Get all active leave types
    const leaveTypes = await LeaveType.find({ isActive: true });

    // Get all employees
    const employees = await User.find({ role: 'employee' });

    let processed = 0;
    let errors = 0;

    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        // Check if accrual already processed for this month
        const existingAccrual = await LeaveAccrual.findOne({
          userId: employee._id,
          leaveTypeId: leaveType._id,
          month: currentMonth,
        });

        if (existingAccrual) {
          continue; // Already processed
        }

        try {
          // Use leave type's default accrual or system default
          const accrualAmount = leaveType.defaultMonthlyAccrual || defaultAccrual;

          // Update employee's leave balance
          const currentBalance = employee.leaveBalances.get(leaveType._id.toString()) || 0;
          const newBalance = currentBalance + accrualAmount;
          employee.leaveBalances.set(leaveType._id.toString(), newBalance);
          await employee.save();

          // Create accrual record
          await LeaveAccrual.create({
            userId: employee._id,
            leaveTypeId: leaveType._id,
            amount: accrualAmount,
            month: currentMonth,
          });

          processed++;
        } catch (error) {
          console.error(`Error processing accrual for user ${employee._id}, leave type ${leaveType._id}:`, error);
          errors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processed} accruals, ${errors} errors`,
      month: currentMonth,
    });
  } catch (error: any) {
    console.error('Error in accrual cron job:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({ message: 'Accrual endpoint. Use POST with authorization.' });
}
