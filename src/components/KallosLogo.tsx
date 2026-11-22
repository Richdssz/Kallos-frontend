interface KallosLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
}

export function KallosLogo({
  className = 'h-8 w-8',
  variant = 'light',
}: KallosLogoProps) {
  const primaryFill = variant === 'light' ? '#FAF6F2' : '#334936';
  const accentFill = '#ACBFA9';

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 7C8 5.34315 9.34315 4 11 4H14C15.6569 4 17 5.34315 17 7V33C17 34.6569 15.6569 36 14 36H11C9.34315 36 8 34.6569 8 33V7Z"
        fill={primaryFill}
      />
      <path
        d="M19.5 18.5C19.5 11.2 24.8 5.5 32.2 4.6C33.3 4.46 34.2 5.42 34.04 6.52C32.96 13.86 27.2 19.2 19.5 18.5Z"
        fill={accentFill}
      />
      <path
        d="M17 22.8C24.5 21.8 31.3 25.9 33.8 33.4C34.18 34.54 33.24 35.68 32.06 35.46C24.8 34.12 19.5 29.6 17 22.8Z"
        fill={primaryFill}
      />
    </svg>
  );
}
