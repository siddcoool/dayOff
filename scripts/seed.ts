import connectDB from '../lib/db/mongodb';
import User from '../lib/models/User';
import LeaveType from '../lib/models/LeaveType';
import SystemConfig from '../lib/models/SystemConfig';

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Create default leave types
    const leaveTypes = [
      {
        name: 'Sick Leave',
        color: '#ef4444',
        defaultMonthlyAccrual: 1,
        isActive: true,
      },
      {
        name: 'Vacation',
        color: '#3b82f6',
        defaultMonthlyAccrual: 1,
        isActive: true,
      },
      {
        name: 'Personal',
        color: '#10b981',
        defaultMonthlyAccrual: 1,
        isActive: true,
      },
    ];

    for (const leaveTypeData of leaveTypes) {
      const existing = await LeaveType.findOne({ name: leaveTypeData.name });
      if (!existing) {
        await LeaveType.create(leaveTypeData);
        console.log(`Created leave type: ${leaveTypeData.name}`);
      } else {
        console.log(`Leave type already exists: ${leaveTypeData.name}`);
      }
    }

    // Create system config
    const defaultAccrual = await SystemConfig.findOne({ key: 'defaultMonthlyAccrual' });
    if (!defaultAccrual) {
      await SystemConfig.create({
        key: 'defaultMonthlyAccrual',
        value: 1,
      });
      console.log('Created system config: defaultMonthlyAccrual = 1');
    } else {
      console.log('System config already exists');
    }

    console.log('Seed completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Sign up a user through Clerk');
    console.log('2. Update that user\'s role to "admin" in MongoDB:');
    console.log('   db.users.updateOne({ clerkId: "YOUR_CLERK_ID" }, { $set: { role: "admin" } })');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
