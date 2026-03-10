import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IHoliday extends Document {
  name: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Holiday: Model<IHoliday> =
  mongoose.models.Holiday || mongoose.model<IHoliday>('Holiday', HolidaySchema);

export default Holiday;

