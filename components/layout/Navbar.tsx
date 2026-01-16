'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Menu, Calendar, History, Settings, Users, FileText, Home } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { cn } from '@/lib/utils';

interface NavbarProps {
  role: 'admin' | 'employee';
}

export function Navbar({ role }: NavbarProps) {
  const pathname = usePathname();

  const employeeLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/leave/request', label: 'Request Leave', icon: Calendar },
    { href: '/leave/history', label: 'History', icon: History },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/requests', label: 'Requests', icon: FileText },
    { href: '/admin/employees', label: 'Employees', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const links = role === 'admin' ? adminLinks : employeeLinks;

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: any }) => {
    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    return (
      <Link href={href}>
        <Button
          variant={isActive ? 'default' : 'ghost'}
          className={cn('w-full justify-start', isActive && 'bg-primary text-primary-foreground')}
        >
          <Icon className="h-4 w-4 mr-2" />
          {label}
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
            <UserButton afterSignOutUrl="/" />
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
