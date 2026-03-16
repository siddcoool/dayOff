import { getCurrentUserWithRole } from '@/app/actions/shared-actions';
import { getAllLeaveRequests } from '@/app/actions/admin-actions';
import { Navbar } from '@/components/layout/Navbar';
import { redirect } from 'next/navigation';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithRole()

  if (!user) {
    redirect('/')
  }

  let hasPendingAdminRequests = false

  if (user.role === 'admin') {
    const requestsResult = await getAllLeaveRequests({ status: 'pending' })
    const requests = requestsResult.success ? requestsResult.data : []
    hasPendingAdminRequests = requests.length > 0
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Navbar
        role={user.role}
        hasPendingAdminRequests={hasPendingAdminRequests}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
