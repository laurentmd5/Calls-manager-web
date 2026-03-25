import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

const variantStyles = {
  default: 'border-t-2 border-t-slate-200',
  primary: 'border-t-2 border-t-indigo-500',
  success: 'border-t-2 border-t-emerald-500',
  warning: 'border-t-2 border-t-amber-500',
  destructive: 'border-t-2 border-t-red-500',
};

const iconVariantStyles = {
  default: 'bg-slate-100 text-slate-600',
  primary: 'bg-indigo-100 text-indigo-600',
  success: 'bg-emerald-100 text-emerald-600',
  warning: 'bg-amber-100 text-amber-600',
  destructive: 'bg-red-100 text-red-600',
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatCardProps) => {
  return (
    <Card className={cn(
      'w-full bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200',
      variantStyles[variant]
    )}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-slate-500">{title}</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 break-words">{value}</p>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span
                  className={cn(
                    'text-xs sm:text-sm font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap',
                    trend.isPositive 
                      ? 'text-emerald-600 bg-emerald-50' 
                      : 'text-red-600 bg-red-50'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">vs semaine dernière</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 items-center justify-center rounded-lg',
              iconVariantStyles[variant]
            )}
          >
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
