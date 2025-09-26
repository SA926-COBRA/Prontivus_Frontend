import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { ModernCard, GradientButton, NotificationBadge, StatusIndicator } from './ModernComponents';

interface ModernLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export const ModernLayout: React.FC<ModernLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  sidebar,
  className
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              {title && (
                <div className="ml-4 lg:ml-0">
                  <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-gray-500">{subtitle}</p>
                  )}
                </div>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="relative">
                <button 
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  title="Alternar tema"
                  aria-label="Alternar tema"
                >
                  {theme === 'light' ? <Sun className="h-5 w-5" /> : 
                   theme === 'dark' ? <Moon className="h-5 w-5" /> : 
                   <Monitor className="h-5 w-5" />}
                </button>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  title="Notificações"
                  aria-label="Ver notificações"
                >
                  <Bell className="h-5 w-5" />
                  <NotificationBadge count={3} />
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Actions */}
              {actions && (
                <div className="flex items-center space-x-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <aside className={cn(
              'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto py-6">
                  {sidebar}
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Main content */}
        <main className={cn(
          'flex-1 overflow-y-auto',
          sidebar ? 'lg:ml-0' : ''
        )}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

interface ModernSidebarProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    href?: string;
    onClick?: () => void;
    badge?: number;
    children?: Array<{
      id: string;
      label: string;
      href?: string;
      onClick?: () => void;
    }>;
  }>;
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({
  items,
  activeItem,
  onItemClick
}) => {
  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <div key={item.id}>
          <button
            onClick={() => {
              if (item.onClick) item.onClick();
              if (onItemClick) onItemClick(item.id);
            }}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
              activeItem === item.id
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                'p-1 rounded-md',
                activeItem === item.id ? 'bg-blue-100' : 'bg-gray-100'
              )}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </div>
            {item.badge && item.badge > 0 && (
              <NotificationBadge count={item.badge} className="ml-auto" />
            )}
          </button>
          
          {/* Submenu */}
          {item.children && activeItem === item.id && (
            <div className="ml-8 mt-2 space-y-1">
              {item.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => {
                    if (child.onClick) child.onClick();
                    if (onItemClick) onItemClick(child.id);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  {child.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

interface ModernPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
  className?: string;
}

export const ModernPageHeader: React.FC<ModernPageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className
}) => {
  return (
    <div className={cn('mb-8', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400">/</span>
                )}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-sm text-gray-900 font-medium">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Title and subtitle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
          )}
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

interface ModernStatsGridProps {
  stats: Array<{
    title: string;
    value: string | number;
    change?: number;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: React.ReactNode;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  }>;
  className?: string;
}

export const ModernStatsGrid: React.FC<ModernStatsGridProps> = ({
  stats,
  className
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {stats.map((stat, index) => (
        <ModernCard key={index} variant="elevated" hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              {stat.change !== undefined && (
                <div className={cn(
                  'flex items-center mt-1 text-xs font-medium',
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-gray-600'
                )}>
                  <span>
                    {stat.changeType === 'positive' ? '↗' :
                     stat.changeType === 'negative' ? '↘' : '→'} 
                    {Math.abs(stat.change)}%
                  </span>
                </div>
              )}
            </div>
            {stat.icon && (
              <div className={cn(
                'p-3 rounded-lg bg-gradient-to-r',
                colorClasses[stat.color || 'blue']
              )}>
                <div className="text-white">
                  {stat.icon}
                </div>
              </div>
            )}
          </div>
        </ModernCard>
      ))}
    </div>
  );
};
