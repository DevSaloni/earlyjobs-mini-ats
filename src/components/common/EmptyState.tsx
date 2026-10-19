import React from 'react';
import { Users, Plus, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-2xs max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4">
        <Users className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs md:text-sm text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
        {description}
      </p>

      {(onAction || onSecondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {onAction && actionText && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs md:text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>{actionText}</span>
            </button>
          )}
          {onSecondaryAction && secondaryActionText && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{secondaryActionText}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
