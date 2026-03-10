import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISalaryPayment extends Document {
  employeeId: mongoose.Types.ObjectId;
  amount: number;
  periodMonth: number;
  periodYear: number;
  payDate: Date;
  status: 'PAID';
  createdAt: Date;
  updatedAt: Date;
}

const SalaryPaymentSchema = new Schema<ISalaryPayment>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    periodMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    periodYear: {
      type: Number,
      required: true,
      min: 2000,
    },
    payDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['PAID'],
      default: 'PAID',
    },
  },
  {
    timestamps: true,
  }
);

SalaryPaymentSchema.index(
  { employeeId: 1, periodMonth: 1, periodYear: 1 },
  { unique: true }
);

const SalaryPayment: Model<ISalaryPayment> =
  mongoose.models.SalaryPayment ||
  mongoose.model<ISalaryPayment>('SalaryPayment', SalaryPaymentSchema);

export default SalaryPayment;

