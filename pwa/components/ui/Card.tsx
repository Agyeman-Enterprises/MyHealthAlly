import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  hover?: boolean;
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  hover = false,
  className,
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl p-6 transition-all duration-300';
  
  const variants = {
    default: 'bg-white shadow-md border border-gray-100',
    elevated: 'bg-white shadow-xl border border-gray-100',
    outlined: 'bg-white border-2 border-gray-200',
    gradient: 'bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200',
  };
  
  const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';
  
  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
