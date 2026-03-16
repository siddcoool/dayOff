'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Menu,
  Calendar,
  History,
  Settings,
  Users,
  FileText,
  Home,
  LogOut,
  User,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { cn } from '@/lib/utils'

interface NavbarProps {
  role: 'admin' | 'employee';
  hasPendingAdminRequests?: boolean;
}

export function Navbar({ role, hasPendingAdminRequests = false }: NavbarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

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

  const links = role === 'admin' ? adminLinks : employeeLinks

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: any
  }) => {
    const isActive =
      pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
    const showPendingDot =
      role === 'admin' && hasPendingAdminRequests && href === '/admin/requests'

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
    )
  };

  return (
    <>
      {/* Mobile top bar with drawer navigation */}
      <nav className="border-b bg-background flex items-center justify-between px-4 h-16 md:hidden">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="font-bold text-xl">
            DayOff
          </Link>
        </div>
        <div className="flex items-center gap-2">
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
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px]">
              <div className="mt-8 space-y-4">
                <div className="px-2">
                  <p className="font-semibold text-lg">Navigation</p>
                </div>
                <nav className="flex flex-col gap-2">
                  {links.map((link) => (
                    <NavLink key={link.href} {...link} />
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:border-r md:bg-background md:sticky md:top-0 md:h-screen">
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <Link href="/dashboard" className="font-bold text-xl">
            DayOff
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {links.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>
        <div className="border-t px-4 py-4 space-y-2">
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
      </aside>
    </>
  )
}
