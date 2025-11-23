import React from 'react';
import { cn } from '@/lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const Grid: React.FC<GridProps> = ({
  children,
  className,
  cols = 12,
  gap = 'md',
  responsive = true,
  ...props
}) => {
  const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
  };

  const gridCols = responsive
    ? `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols > 2 ? Math.min(cols, 3) : cols}`
    : `grid-cols-${cols}`;

  return (
    <div
      className={cn('grid', gridCols, gapClasses[gap], className)}
      {...props}
    >
      {children}
    </div>
  );
};

