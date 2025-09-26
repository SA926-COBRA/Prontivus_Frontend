import React from 'react';
import { cn } from '@/lib/utils';

// Modern Color Palette
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  medical: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  }
};

// Modern Typography System
export const typography = {
  h1: 'text-4xl font-bold tracking-tight text-gray-900',
  h2: 'text-3xl font-bold tracking-tight text-gray-900',
  h3: 'text-2xl font-semibold tracking-tight text-gray-900',
  h4: 'text-xl font-semibold tracking-tight text-gray-900',
  h5: 'text-lg font-semibold tracking-tight text-gray-900',
  h6: 'text-base font-semibold tracking-tight text-gray-900',
  body: 'text-base text-gray-700',
  bodySmall: 'text-sm text-gray-600',
  caption: 'text-xs text-gray-500',
  label: 'text-sm font-medium text-gray-700',
  button: 'text-sm font-medium',
  link: 'text-sm font-medium text-blue-600 hover:text-blue-500',
};

// Modern Spacing System
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
};

// Modern Shadow System
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
  none: 'shadow-none',
  glow: 'shadow-lg shadow-blue-500/25',
  glowGreen: 'shadow-lg shadow-green-500/25',
  glowRed: 'shadow-lg shadow-red-500/25',
};

// Modern Border Radius System
export const borderRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

// Modern Animation System
export const animations = {
  fadeIn: 'animate-fade-in',
  slideIn: 'animate-slide-in',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  ping: 'animate-ping',
  wiggle: 'animate-wiggle',
  float: 'animate-float',
};

// Modern Transition System
export const transitions = {
  fast: 'transition-all duration-150 ease-in-out',
  normal: 'transition-all duration-200 ease-in-out',
  slow: 'transition-all duration-300 ease-in-out',
  bounce: 'transition-all duration-200 ease-bounce',
  elastic: 'transition-all duration-300 ease-elastic',
};

// Modern Gradient System
export const gradients = {
  primary: 'bg-gradient-to-r from-blue-500 to-blue-600',
  secondary: 'bg-gradient-to-r from-gray-500 to-gray-600',
  success: 'bg-gradient-to-r from-green-500 to-green-600',
  warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
  danger: 'bg-gradient-to-r from-red-500 to-red-600',
  medical: 'bg-gradient-to-r from-cyan-500 to-blue-600',
  sunset: 'bg-gradient-to-r from-orange-400 to-pink-400',
  ocean: 'bg-gradient-to-r from-blue-400 to-cyan-400',
  forest: 'bg-gradient-to-r from-green-400 to-emerald-400',
  glass: 'bg-gradient-to-r from-white/20 to-white/10',
};

// Modern Glassmorphism System
export const glassmorphism = {
  light: 'bg-white/30 backdrop-blur-sm border border-white/20',
  medium: 'bg-white/50 backdrop-blur-md border border-white/30',
  strong: 'bg-white/70 backdrop-blur-lg border border-white/40',
  dark: 'bg-black/30 backdrop-blur-sm border border-black/20',
};

// Modern Card Variants
export const cardVariants = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white border-0 shadow-lg',
  outlined: 'bg-transparent border-2 border-gray-200',
  glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg',
  gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-md',
  medical: 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 shadow-md',
};

// Modern Button Variants
export const buttonVariants = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  outline: 'border-2 border-gray-300 hover:border-gray-400 text-gray-700',
  ghost: 'hover:bg-gray-100 text-gray-700',
  link: 'text-blue-600 hover:text-blue-500 underline',
  gradient: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
};

// Modern Input Variants
export const inputVariants = {
  default: 'border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
  error: 'border border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500',
  success: 'border border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-500',
  glass: 'bg-white/50 backdrop-blur-sm border border-white/30 focus:border-white/50',
};

// Modern Badge Variants
export const badgeVariants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  medical: 'bg-cyan-100 text-cyan-800',
  gradient: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
};

// Utility Functions
export const createVariant = (base: string, variants: Record<string, string>) => {
  return (variant: string, className?: string) => {
    return cn(base, variants[variant], className);
  };
};

export const createResponsiveVariant = (base: string, variants: Record<string, string>) => {
  return (variant: string, className?: string) => {
    return cn(base, variants[variant], className);
  };
};

// Modern Layout Components
export const ModernContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => {
  return (
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
};

export const ModernSection: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ children, className, padding = 'lg' }) => {
  const paddings = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24'
  };

  return (
    <section className={cn(paddings[padding], className)}>
      {children}
    </section>
  );
};

export const ModernGrid: React.FC<{
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ children, cols = 3, gap = 'md', className }) => {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const gaps = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  return (
    <div className={cn('grid', colClasses[cols], gaps[gap], className)}>
      {children}
    </div>
  );
};

// Modern Responsive Utilities
export const responsive = {
  mobile: 'sm:block',
  tablet: 'md:block',
  desktop: 'lg:block',
  mobileOnly: 'block sm:hidden',
  tabletOnly: 'hidden sm:block md:hidden',
  desktopOnly: 'hidden md:block',
};

// Modern Focus States
export const focusStates = {
  default: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  error: 'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  success: 'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
};

// Modern Hover States
export const hoverStates = {
  lift: 'hover:transform hover:-translate-y-1 hover:shadow-lg',
  scale: 'hover:transform hover:scale-105',
  glow: 'hover:shadow-lg hover:shadow-blue-500/25',
  color: 'hover:bg-blue-50 hover:text-blue-700',
};

// Export all utilities
export const modernUI = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  animations,
  transitions,
  gradients,
  glassmorphism,
  cardVariants,
  buttonVariants,
  inputVariants,
  badgeVariants,
  responsive,
  focusStates,
  hoverStates,
};
