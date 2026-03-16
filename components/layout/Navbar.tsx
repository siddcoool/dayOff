'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, Calendar, History, Settings, Users, FileText, Home, LogOut, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';

interface NavbarProps {
  role: 'admin' | 'employee';
  hasPendingAdminRequests?: boolean;
}

export function Navbar({ role, hasPendingAdminRequests = false }: NavbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const employeeLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/leave/request', label: 'Request Leave', icon: Calendar },
    { href: '/leave/history', label: 'History', icon: History },
    { href: '/holidays', label: 'Holidays', icon: Calendar },
    { href: '/finance', label: 'Payslips', icon: FileText },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/requests', label: 'Requests', icon: FileText },
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/holidays', label: 'Holidays', icon: Calendar },
    { href: '/admin/finance', label: 'Finance', icon: FileText },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const links = role === 'admin' ? adminLinks : employeeLinks;

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: any;
  }) => {
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    const showPendingDot =
      role === 'admin' && hasPendingAdminRequests && href === '/admin/requests';

    return (
      <Link href={href}>
        <Button
          variant={isActive ? 'default' : 'ghost'}
          className={cn('w-full justify-start', isActive && 'bg-primary text-primary-foreground')}
        >
          <div className="flex items-center">
            <Icon className="h-4 w-4 mr-2" />
            <span className="relative inline-flex items-center">
              <span>{label}</span>
              {showPendingDot && (
                <span className="absolute -top-1 -right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
            </span>
          </div>
        </Button>
      </Link>
    );
  };

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="font-bold text-xl">
              DayOff
            </Link>
            <div className="hidden md:flex items-center gap-2">
              {links.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56" align="end">
                <div className="space-y-2">
                  {session?.user?.name && (
                    <p className="text-sm font-medium truncate">{session.user.name}</p>
                  )}
                  {session?.user?.email && (
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <nav className="flex flex-col gap-2 mt-8">
                  {links.map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-sm font-medium">Theme</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
