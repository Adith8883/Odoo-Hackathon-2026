import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className,
  fullPage = false,
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center p-6 space-y-3', className)}>
      <Loader2 className={cn('animate-spin text-indigo-600', sizeMap[size])} />
      {label && <p className="text-sm font-medium text-slate-500 animate-pulse">{label}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};
