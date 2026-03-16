'use server';

import bcrypt from 'bcrypt';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

export async function registerUser(formData: {
  email: string;
  password: string;
  name: string;
}) {
  try {
    const { email, password, name } = formData;
    if (!email?.trim() || !password || !name?.trim()) {
      return { error: 'Email, password, and name are required' };
    }
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters' };
    }
    await connectDB();
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return { error: 'An account with this email already exists' };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      email: email.trim().toLowerCase(),
      name: name.trim(),
      password: hashedPassword,
      role: 'employee',
    });
    return { success: true };
  } catch (err) {
    console.error('Register error:', err);
    return { error: 'Failed to create account' };
  }
}
