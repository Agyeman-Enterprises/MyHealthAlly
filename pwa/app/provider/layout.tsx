'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';

export default function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, role, logout } = useAuthStore();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // CRITICAL: ALWAYS allow login page to render FIRST (before any auth checks)
  // This prevents blocking during Zustand hydration or SSR
  // During SSR (!mounted), always render children to avoid hydration mismatch
  // On login page, always render immediately
  const isLoginPage = pathname === '/provider/login';
  
  if (!mounted || isLoginPage) {
    // During SSR (!mounted) or on login page, render immediately
    return <>{children}</>;
  }

  useEffect(() => {
    // Wait a moment for Zustand to hydrate from localStorage
    const checkAuth = setTimeout(() => {
      // Strong security: Check authentication and role
      if (!isAuthenticated) {
        router.push('/provider/login?redirect=' + encodeURIComponent(pathname));
        return;
      }
      
      // Strong security: Enforce role-based access control
      if (role !== 'provider' && role !== 'admin') {
        // User is authenticated but doesn't have provider/admin role
        // This prevents patients from accessing provider routes
        router.push('/provider/login?redirect=' + encodeURIComponent(pathname));
        return;
      }
    }, 100); // Small delay to allow Zustand hydration

    return () => clearTimeout(checkAuth);
  }, [isAuthenticated, role, router, pathname]);

  // Strong security: Don't render anything if not authorized
  // (login page already handled above)
  if (!isAuthenticated || (role !== 'provider' && role !== 'admin')) {
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/provider/dashboard" className="text-2xl font-bold text-primary-600">
                MyHealth Ally
              </Link>
              <span className="ml-4 text-sm text-gray-500">Provider Portal</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href="/provider/dashboard"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                isActive('/provider/dashboard')
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/provider/messages"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                isActive('/provider/messages')
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Messages
            </Link>
            <Link
              href="/provider/work-items"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                isActive('/provider/work-items')
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Work Items
            </Link>
            <Link
              href="/provider/alerts"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                isActive('/provider/alerts')
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Alerts
            </Link>
            <Link
              href="/provider/patients"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                isActive('/provider/patients')
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Patients
            </Link>
            {role === 'admin' && (
              <Link
                href="/provider/settings"
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive('/provider/settings')
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Settings
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
