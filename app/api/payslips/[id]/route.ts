import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import SalaryPayment from '@/lib/models/SalaryPayment';
import User from '@/lib/models/User';
import { generatePayslip } from '@/lib/utils/payslipGenerator';
import { requireAuth } from '@/lib/auth/clerk';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    await connectDB();

    const payment = await SalaryPayment.findById(params.id).populate('employeeId', 'name email');

    if (!payment) {
      return NextResponse.json({ error: 'Payslip not found' }, { status: 404 });
    }

    const employee = payment.employeeId as typeof User | null;

    const isOwner =
      employee && 'id' in employee
        ? (employee as any)._id.toString() === user._id.toString()
        : employee?.toString() === user._id.toString();

    if (!isOwner && user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized to view this payslip' }, { status: 403 });
    }

    const employeeName =
      employee && 'name' in employee ? (employee as any).name : user.name || 'Employee';

    const paymentDateIso = new Date(payment.payDate).toISOString().slice(0, 10);

    const html = generatePayslip({
      employeeName,
      paymentDate: paymentDateIso,
      amountINR: payment.amount,
    });

    return NextResponse.json(
      {
        html,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating payslip HTML:', error);
    return NextResponse.json(
      { error: 'Failed to generate payslip' },
      {
        status: 500,
      }
    );
  }
}

