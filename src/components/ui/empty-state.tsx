import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white">
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        {description ? <p className="max-w-sm text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
