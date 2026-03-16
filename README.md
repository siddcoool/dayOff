# DayOff - Employee Leave Management System

A modern, full-featured employee leave management system built with Next.js 16, NextAuth authentication, MongoDB, and shadcn/ui.

## Features

- **Authentication**: Secure authentication using NextAuth (credentials: email/password)
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
- **Authentication**: NextAuth (Credentials provider)
- **Database**: MongoDB with Mongoose
- **UI**: shadcn/ui, Tailwind CSS
- **Validation**: Zod
- **Date Handling**: date-fns, react-day-picker

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Create a `.env.local` file:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_string

# MongoDB
MONGODB_URI=mongodb://localhost:27017/dayoff
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dayoff

# Cron Job Security (optional, for production)
CRON_SECRET=your_random_secret_string
```

Generate a secure value for `NEXTAUTH_SECRET` (e.g. `openssl rand -base64 32`).

3. Seed the database:

```bash
npm run seed
```

4. Create an account and set up your first admin user:

- Open [http://localhost:3000](http://localhost:3000) and sign up with email/password.
- To make a user an admin, update their role in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or use MongoDB Compass/Atlas UI to update the user document.

5. Run the development server:

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
| `NEXTAUTH_URL` | Full URL of your app (e.g. `http://localhost:3000`) | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT signing (use `openssl rand -base64 32`) | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `CRON_SECRET` | Secret for cron job authentication | Optional |

## License

MIT
# dayOff
