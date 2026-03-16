import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  /** Hashed password for NextAuth credentials sign-in. Optional when using OAuth only. */
  password?: string;
  role: 'admin' | 'employee';
  leaveBalances: Map<string, number>;
  /**
   * Fixed monthly base salary amount in INR.
   * When undefined/null, finance actions should treat salary as not configured.
   */
  baseSalary?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
  
    password: {
      type: String,
      required: false,
      select: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee',
    },
    leaveBalances: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    baseSalary: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
