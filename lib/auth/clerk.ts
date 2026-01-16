import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  await connectDB();
  
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  let user = await User.findOne({ clerkId: userId });

  if (!user) {
    user = await User.create({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.firstName || clerkUser.emailAddresses[0]?.emailAddress || 'User',
      role: 'employee',
    });
  } else {
    // Update user info from Clerk if changed
    const email = clerkUser.emailAddresses[0]?.emailAddress || user.email;
    const name = clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.firstName || user.name;
    
    if (user.email !== email || user.name !== name) {
      user.email = email;
      user.name = name;
      await user.save();
    }
  }

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}
