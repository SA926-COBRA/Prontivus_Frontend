import React from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  hover?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({ 
  children, 
  className, 
  variant = 'default',
  hover = false 
}) => {
  const variants = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white border-0 shadow-lg',
    outlined: 'bg-transparent border-2 border-gray-200',
    glass: 'bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg'
  };

  return (
    <div 
      className={cn(
        'rounded-xl p-6 transition-all duration-200',
        variants[variant],
        hover && 'hover:shadow-xl hover:scale-[1.02] cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className
}) => {
  const variants = {
    primary: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    secondary: 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
    success: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    warning: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
    danger: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'bg-gradient-to-r text-white font-medium rounded-lg transition-all duration-200',
        'hover:shadow-lg hover:scale-105 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
};

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  className,
  prefix = '',
  suffix = ''
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setDisplayValue(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
};

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = '#e5e7eb',
  className
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-gray-700">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label,
  position = 'bottom-right',
  className
}) => {
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600',
        'text-white rounded-full shadow-lg hover:shadow-xl',
        'hover:scale-110 active:scale-95 transition-all duration-200',
        'flex items-center justify-center',
        positions[position],
        className
      )}
      title={label}
    >
      {icon}
    </button>
  );
};

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'busy' | 'away';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'md',
  className
}) => {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const colors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500'
  };

  return (
    <div
      className={cn(
        'rounded-full',
        sizes[size],
        colors[status],
        className
      )}
    />
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'text-blue-500',
  className
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-200',
        'border-t-current',
        sizes[size],
        color,
        className
      )}
    />
  );
};

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  className
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <div
      className={cn(
        'absolute -top-2 -right-2 bg-red-500 text-white text-xs',
        'rounded-full min-w-[20px] h-5 flex items-center justify-center',
        'px-1 font-medium',
        className
      )}
    >
      {displayCount}
    </div>
  );
};

interface GlassmorphismCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'strong';
}

export const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  className,
  intensity = 'medium'
}) => {
  const intensities = {
    light: 'bg-white/30 backdrop-blur-sm',
    medium: 'bg-white/50 backdrop-blur-md',
    strong: 'bg-white/70 backdrop-blur-lg'
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 shadow-xl',
        intensities[intensity],
        className
      )}
    >
      {children}
    </div>
  );
};

interface DataVisualizationCardProps {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const DataVisualizationCard: React.FC<DataVisualizationCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  className
}) => {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  const changeIcons = {
    positive: '↗',
    negative: '↘',
    neutral: '→'
  };

  return (
    <ModernCard variant="elevated" hover className={className}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={cn('flex items-center mt-1', changeColors[changeType])}>
              <span className="text-xs font-medium">
                {changeIcons[changeType]} {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-50 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </ModernCard>
  );
};
