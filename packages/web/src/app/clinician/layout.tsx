'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RouteGuard } from '@/components/auth/RouteGuard';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  MessageSquare,
  FlaskConical,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LogoIcon } from '@/components/branding/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/clinician/dashboard', icon: LayoutDashboard },
  { name: 'Patients', href: '/clinician/patients', icon: Users },
  { name: 'Triage', href: '/clinician/triage', icon: AlertTriangle },
  { name: 'Tasks', href: '/clinician/tasks', icon: CheckSquare },
  { name: 'Messages', href: '/clinician/messages', icon: MessageSquare },
  { name: 'Labs', href: '/clinician/labs', icon: FlaskConical },
];

export default function ClinicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [onCallStatus, setOnCallStatus] = useState<'available' | 'in_visit' | 'offline'>('available');

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Status colors now use theme variables via inline styles

  return (
    <RouteGuard allowedRoles={['PROVIDER', 'MEDICAL_ASSISTANT', 'ADMIN']} redirectTo="/patient/login">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 border-r bg-white border-slate-200',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <LogoIcon size={32} />
                <span className="font-semibold text-h3 text-slate-900">
                  MyHealthAlly
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-body font-medium transition-colors',
                      isActive ? 'bg-teal-50 text-teal-600' : 'text-slate-600 hover:bg-slate-50'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* On-call status */}
            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-caption text-slate-600">
                  Status
                </span>
                <Badge
                  className={
                    onCallStatus === 'available'
                      ? 'bg-emerald-500 text-white'
                      : onCallStatus === 'in_visit'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-400 text-white'
                  }
                >
                  {onCallStatus === 'available' && 'Available'}
                  {onCallStatus === 'in_visit' && 'In Visit'}
                  {onCallStatus === 'offline' && 'Offline'}
                </Badge>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-slate-600"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-h3 text-slate-900">
                    {navigation.find((n) => pathname === n.href || pathname.startsWith(n.href + '/'))?.name || 'Dashboard'}
                  </h1>
                  <p className="text-caption text-slate-600">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="" alt="Dr. Smith" />
                      <AvatarFallback className="bg-teal-50 text-teal-600">
                        DS
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-body font-medium text-slate-900">
                        Dr. Sarah Smith
                      </p>
                      <p className="text-caption text-slate-600">
                        Primary Care
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 hidden md:block text-slate-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main className="max-w-7xl mx-auto p-6">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
