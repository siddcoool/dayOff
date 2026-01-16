import { getCurrentUserWithRole } from '@/app/actions/shared-actions';
import { Navbar } from '@/components/layout/Navbar';
import { redirect } from 'next/navigation';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserWithRole();
  
  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar role={user.role} />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
