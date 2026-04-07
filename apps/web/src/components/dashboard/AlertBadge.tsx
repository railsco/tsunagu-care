import { AlertCircle, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertBadgeProps {
  type: 'concern' | 'lowScore';
  className?: string;
}

export function AlertBadge({ type, className }: AlertBadgeProps) {
  if (type === 'concern') {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-6 w-6 rounded-full bg-orange-100',
          className
        )}
        title="気になることがあります"
      >
        <AlertCircle className="h-4 w-4 text-orange-600" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center h-6 w-6 rounded-full bg-red-100',
        className
      )}
      title="低いスコアがあります"
    >
      <TrendingDown className="h-4 w-4 text-red-600" />
    </div>
  );
}
