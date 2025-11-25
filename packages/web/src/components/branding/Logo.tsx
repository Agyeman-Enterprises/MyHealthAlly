import Image from 'next/image';
import logo from '@/branding/logo.svg';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
}

export function Logo({ className = '', width = 200, height = 60, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={logo}
        alt="MyHealthAlly"
        width={width}
        height={height}
        priority
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );
}

// Compact version for sidebars/navbars
export function LogoIcon({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, var(--color-gradientStart), var(--color-gradientEnd))',
      }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" fill="white" opacity="0.2" />
        <path
          d="M12 6V18M6 12H18"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

