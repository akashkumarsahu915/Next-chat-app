import { cn } from '../../lib/utils';

export function LoadingSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full animate-pulse bg-white dark:bg-slate-900">
      <div className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 space-x-3">
        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-slate-100 rounded dark:bg-slate-800" />
          <div className="h-2 w-16 bg-slate-100 rounded dark:bg-slate-800" />
        </div>
      </div>
      <div className="flex-1 p-4 space-y-6">
        <div className="flex justify-start">
          <div className="h-10 w-48 bg-slate-50 rounded-2xl dark:bg-slate-800" />
        </div>
        <div className="flex justify-end">
          <div className="h-10 w-32 bg-indigo-50 rounded-2xl dark:bg-indigo-900/20" />
        </div>
        <div className="flex justify-start">
          <div className="h-10 w-64 bg-slate-50 rounded-2xl dark:bg-slate-800" />
        </div>
      </div>
      <div className="h-20 border-t border-slate-100 p-4 dark:border-slate-800 flex items-center space-x-3">
        <div className="h-10 flex-1 bg-slate-50 rounded-2xl dark:bg-slate-800" />
        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}
