'use client';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'gradient' | 'outline';
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false, 
  onClick 
}: CardProps) {
  const variantStyles = {
    default: 'bg-white shadow-sm border border-gray-100',
    elevated: 'bg-white shadow-xl border border-gray-100',
    gradient: 'bg-gradient-to-br from-primary-50 to-white border border-primary-100',
    outline: 'bg-white border-2 border-gray-200',
  };

  return (
    <div
      className={`rounded-2xl p-6 ${variantStyles[variant]} ${
        hover ? 'hover:shadow-md hover:border-primary-200 transition-all cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
