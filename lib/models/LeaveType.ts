import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaveType extends Document {
  name: string;
  color: string;
  isActive: boolean;
  defaultMonthlyAccrual: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveTypeSchema = new Schema<ILeaveType>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    color: {
      type: String,
      required: true,
      default: '#3b82f6',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    defaultMonthlyAccrual: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const LeaveType: Model<ILeaveType> = mongoose.models.LeaveType || mongoose.model<ILeaveType>('LeaveType', LeaveTypeSchema);

export default LeaveType;
