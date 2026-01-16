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

  const email = clerkUser.emailAddresses[0]?.emailAddress || '';
  
  // First, try to find by clerkId
  let user = await User.findOne({ clerkId: userId });

  // If not found by clerkId, check by email (in case user recreated Clerk account)
  if (!user && email) {
    user = await User.findOne({ email });
    // If found by email, update the clerkId
    if (user) {
      user.clerkId = userId;
      await user.save();
    }
  }

  if (!user) {
    // Create new user only if neither clerkId nor email exists
    try {
      user = await User.create({
        clerkId: userId,
        email: email || `user-${userId}@temp.com`,
        name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || email || 'User',
        role: 'employee',
      });
    } catch (error: any) {
      // If still fails (race condition), try to find again
      if (error.code === 11000) {
        user = await User.findOne({ clerkId: userId }) || await User.findOne({ email });
        if (!user) {
          throw error;
        }
      } else {
        throw error;
      }
    }
  } else {
    // Update user info from Clerk if changed
    const name = clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser.firstName || user.name;
    
    if (user.email !== email || user.name !== name || user.clerkId !== userId) {
      user.email = email || user.email;
      user.name = name;
      user.clerkId = userId;
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
