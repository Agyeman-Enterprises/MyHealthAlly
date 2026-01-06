'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * Theme Provider Component
 * Applies dark mode based on user's appearance preferences
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load theme from database
    const loadTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userRecord } = await supabase
            .from('users')
            .select('appearance_preferences')
            .eq('supabase_auth_id', user.id)
            .single();
          
          if (userRecord?.appearance_preferences) {
            const prefs = userRecord.appearance_preferences as { theme?: 'light' | 'dark' | 'system' };
            const savedTheme = prefs.theme || 'system';
            setTheme(savedTheme);
          }
        }
      } catch (err) {
        console.error('Error loading theme:', err);
        // Fallback to system
        setTheme('system');
      }
    };
    
    loadTheme();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Determine actual theme to apply
    let appliedTheme: 'light' | 'dark';
    if (theme === 'system') {
      appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      appliedTheme = theme;
    }

    // Apply theme class
    if (appliedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Listen for system theme changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, mounted]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
