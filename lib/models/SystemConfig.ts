import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemConfig extends Document {
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

const SystemConfigSchema = new Schema<ISystemConfig>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const SystemConfig: Model<ISystemConfig> = mongoose.models.SystemConfig || mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);

export default SystemConfig;
