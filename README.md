# DayOff - Employee Leave Management System

A modern, full-featured employee leave management system built with Next.js 16, Clerk authentication, MongoDB, and shadcn/ui.

## Features

- **Authentication**: Secure authentication using Clerk
- **Role-Based Access**: Admin and Employee roles with different permissions
- **Leave Management**: 
  - Multiple leave types (Sick Leave, Vacation, Personal, etc.)
  - Calendar-based date selection
  - Automatic business day calculation
  - Leave balance tracking
- **Admin Features**:
  - Approve/decline leave requests
  - Assign additional leaves to employees
  - Manage leave types and system settings
  - View all employees and their balances
- **Automatic Accrual**: Monthly leave accrual via cron job
- **Modern UI**: Responsive design with shadcn/ui components
- **Server Actions**: All operations use Next.js server actions

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Clerk
- **Database**: MongoDB with Mongoose
- **UI**: shadcn/ui, Tailwind CSS
- **Validation**: Zod
- **Date Handling**: date-fns, react-day-picker

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- Clerk account

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB
MONGODB_URI=mongodb://localhost:27017/dayoff
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dayoff

# Cron Job Security (optional, for production)
CRON_SECRET=your_random_secret_string
```

3. Set up Clerk:

- Create a Clerk account at https://clerk.com
- Create a new application
- Copy your publishable key and secret key to `.env.local`

4. Seed the database:

```bash
npm run seed
```

5. Set up your first admin user:

After signing up through Clerk, update the user's role in MongoDB:

```javascript
db.users.updateOne(
  { clerkId: "YOUR_CLERK_USER_ID" },
  { $set: { role: "admin" } }
)
```

Or use MongoDB Compass/Atlas UI to update the user document.

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Monthly Leave Accrual

The system includes a cron job endpoint at `/api/cron/accrual` that automatically adds leaves to employees each month.

### Vercel Deployment

If deploying to Vercel, the cron job is configured in `vercel.json` to run on the 1st of each month. Make sure to set the `CRON_SECRET` environment variable in Vercel.

### Manual Testing

You can test the accrual endpoint manually:

```bash
curl -X POST http://localhost:3000/api/cron/accrual \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Other Platforms

For other hosting platforms, set up a cron job to call the `/api/cron/accrual` endpoint monthly with the `CRON_SECRET` in the Authorization header.

## Project Structure

```
app/
  (auth)/          # Protected routes
    dashboard/     # Role-based dashboard
    leave/         # Employee leave pages
    admin/         # Admin pages
  actions/         # Server actions
  api/
    cron/          # Cron job endpoints
components/
  ui/              # shadcn/ui components
  leave/           # Leave-related components
  admin/           # Admin components
  layout/          # Layout components
lib/
  db/              # Database connection
  models/          # Mongoose models
  auth/            # Auth helpers
  utils/           # Utility functions
scripts/
  seed.ts          # Database seed script
```

## Usage

### For Employees

1. **View Dashboard**: See your leave balances and pending requests
2. **Request Leave**: 
   - Select leave type
   - Choose dates using the calendar
   - Add optional message
   - Submit request
3. **View History**: See all your past and pending leave requests

### For Admins

1. **Dashboard**: View statistics and pending requests
2. **Approve/Decline**: Review and process leave requests
3. **Employee Management**: View all employees and assign additional leaves
4. **Settings**: 
   - Configure monthly accrual rate
   - Manage leave types (create, edit, deactivate)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `CRON_SECRET` | Secret for cron job authentication | Optional |

## License

MIT
# dayOff
