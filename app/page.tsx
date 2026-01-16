import { SignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { getCurrentUserWithRole } from '@/app/actions/shared-actions';

export default async function Home() {
  const user = await getCurrentUserWithRole();
  
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">DayOff</h1>
          <p className="text-muted-foreground">Employee Leave Management System</p>
        </div>
        <SignedOut>
          <SignIn />
        </SignedOut>
        <SignedIn>
          <div className="text-center">
            <p>Redirecting to dashboard...</p>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}
