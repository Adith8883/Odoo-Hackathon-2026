import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/helpers';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 flex-shrink-0" />,
  };

  const bgStyles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-between p-3.5 rounded-xl border shadow-lg transition-all transform ease-out duration-300 animate-in fade-in slide-in-from-bottom-2',
        bgStyles[type]
      )}
      role="alert"
    >
      <div className="flex items-center space-x-3 text-sm font-medium pr-2">
        {icons[type]}
        <span>{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-700 transition p-1 rounded-lg hover:bg-black/5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
