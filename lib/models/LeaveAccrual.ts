import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILeaveAccrual extends Document {
  userId: Types.ObjectId;
  leaveTypeId: Types.ObjectId;
  amount: number;
  month: string;
  createdAt: Date;
}

const LeaveAccrualSchema = new Schema<ILeaveAccrual>(
  {
    userId: {
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
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

LeaveAccrualSchema.index({ userId: 1, leaveTypeId: 1, month: 1 }, { unique: true });

const LeaveAccrual: Model<ILeaveAccrual> = mongoose.models.LeaveAccrual || mongoose.model<ILeaveAccrual>('LeaveAccrual', LeaveAccrualSchema);

export default LeaveAccrual;
