'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

const mainNavItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Messages', href: '/messages' },
  { label: 'Vitals', href: '/vitals' },
  { label: 'Labs', href: '/labs' },
  { label: 'Medications', href: '/medications' },
  { label: 'Appointments', href: '/appointments' },
  { label: 'Care Plan', href: '/care-plan' },
];

const moreNavItems = [
  { label: 'Documents', href: '/documents' },
  { label: 'Billing', href: '/billing' },
  { label: 'Intake Forms', href: '/intake' },
  { label: 'Education', href: '/education' },
  { label: 'Referrals', href: '/referrals' },
  { label: 'Settings', href: '/settings' },
];

const allNavItems = [...mainNavItems, ...moreNavItems];

// Logo component with fallback
function LogoImage() {
  const [logoError, setLogoError] = useState(false);
  const [usePng, setUsePng] = useState(false);

  if (logoError && !usePng) {
    // Try PNG fallback
    return (
      <img
        src="/images/mha_logo_512.png"
        alt="MyHealth Ally"
        className="w-10 h-10 rounded-xl object-cover shadow-sm"
        onError={() => setUsePng(true)}
      />
    );
  }

  if (usePng) {
    // Final fallback to gradient icon
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-sm">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src="/images/MHA_logo.jpg"
      alt="MyHealth Ally"
      className="w-10 h-10 rounded-xl object-cover shadow-sm"
      onError={() => setLogoError(true)}
    />
  );
}

const labelMap: Record<string, string> = {
  'dashboard': 'Home',
  'messages': 'Messages',
  'vitals': 'Vitals',
  'labs': 'Lab Results',
  'medications': 'Medications',
  'appointments': 'Appointments',
  'care-plan': 'Care Plan',
  'documents': 'Documents',
  'billing': 'Billing',
  'intake': 'Intake Forms',
  'education': 'Education',
  'referrals': 'Referrals',
  'settings': 'Settings',
  'new': 'New',
  'request': 'Request',
  'refill': 'Refill Request',
  'calendar': 'Calendar',
  'upload': 'Upload',
  'language': 'Language',
  'notifications': 'Notifications',
  'appearance': 'Appearance',
  'profile': 'Profile',
  'security': 'Security',
  'devices': 'Connected Devices',
  'legal': 'Terms & Privacy',
  'help': 'Help & FAQ',
  'contact': 'Contact Us',
  'hospital-admission': 'Hospital Admission',
  'voice': 'Voice Message',
};

function getBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; href?: string }[] = [{ label: 'Home', href: '/dashboard' }];

  if (pathname === '/dashboard') return [{ label: 'Home' }];

  let path = '';
  segments.forEach((segment, index) => {
    if (segment.match(/^[0-9a-f-]{8,}$/i) || segment.match(/^\d+$/)) return;
    if (segment === 'dashboard') return;
    
    path += `/${segment}`;
    const isLast = index === segments.length - 1;
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    const breadcrumb: { label: string; href?: string } = { label };
    if (!isLast) {
      breadcrumb.href = path;
    }
    breadcrumbs.push(breadcrumb);
  });

  return breadcrumbs;
}

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
}

export function Header({ title, showBack, backHref }: HeaderProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <>
      <header 
        className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back button + Logo/Title */}
            <div className="flex items-center gap-2">
              {showBack && (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-primary-50 transition-colors mr-2"
                  aria-label="Go back"
                >
                  <svg className="w-5 h-5 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {title ? (
                <h1 className="text-xl font-bold text-navy-600">{title}</h1>
              ) : (
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LogoImage />
                  <span className="text-xl font-bold text-navy-600">MyHealth Ally</span>
                </Link>
              )}
            </div>

            {/* Desktop Nav - hide if showing title */}
            {!title && (
              <nav className="hidden lg:flex items-center gap-1">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-navy-700'
                        : 'text-gray-600 hover:bg-primary-50 hover:text-navy-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                
                {/* More Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                    onBlur={() => setTimeout(() => setShowMoreDropdown(false), 150)}
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-primary-50 flex items-center gap-1"
                  >
                    More
                    <svg className={`w-4 h-4 transition-transform ${showMoreDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showMoreDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      {moreNavItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isActive(item.href)
                              ? 'bg-primary-50 text-navy-700'
                              : 'text-gray-700 hover:bg-primary-50'
                          }`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </nav>
            )}

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <svg className="w-6 h-6 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button onClick={handleLogout} className="hidden sm:block text-sm text-gray-500 hover:text-navy-600">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs - hide if showing custom title */}
        {!title && breadcrumbs.length > 1 && (
          <div className="bg-primary-50 border-t border-primary-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <nav className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-gray-400">›</span>}
                    {crumb.href ? (
                      <Link href={crumb.href} className="text-primary-600 hover:text-primary-700 hover:underline">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-navy-600 font-medium">{crumb.label}</span>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="text-lg font-bold text-navy-600">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-lg hover:bg-primary-50">
                <svg className="w-6 h-6 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
              {allNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl transition-colors ${
                    isActive(item.href) ? 'bg-primary-100 text-navy-700 font-medium' : 'text-gray-700 hover:bg-primary-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <hr className="my-4" />
              <button
                onClick={() => { setIsMenuOpen(false); handleLogout(); }}
                className="w-full px-4 py-3 rounded-xl text-left text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
