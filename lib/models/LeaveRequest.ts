import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILeaveRequest extends Document {
  employeeId: Types.ObjectId;
  leaveTypeId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  days: number;
  status: 'pending' | 'approved' | 'declined';
  message?: string;
  adminNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    leaveTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'LeaveType',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    days: {
      type: Number,
      required: true,
      min: 0.5,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined'],
      default: 'pending',
      index: true,
    },
    message: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const LeaveRequest: Model<ILeaveRequest> = mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;
