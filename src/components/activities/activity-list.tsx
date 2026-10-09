"use client";

import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { ACTIVITY_TYPE_CONFIG } from "@/lib/constants/crm";
import { toggleActivityComplete } from "@/lib/data/entities";
import { cn, formatDate } from "@/lib/utils";
import type { Activity } from "@/lib/types/crm";

interface ActivityListProps {
  activities: Activity[];
  emptyLabel?: string;
}

export function ActivityList({ activities, emptyLabel = "No activities yet." }: ActivityListProps) {
  const [now] = useState(() => Date.now());

  if (activities.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  const sorted = [...activities].sort((a, b) => {
    const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  });

  return (
    <ul className="space-y-3">
      {sorted.map((activity) => {
        const config = ACTIVITY_TYPE_CONFIG[activity.type];
        const Icon = config.icon;
        const isOverdue = !activity.isCompleted && activity.dueDate && new Date(activity.dueDate).getTime() < now;

        return (
          <li key={activity.id} className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => toggleActivityComplete(activity.id)}
              aria-label={activity.isCompleted ? "Mark as not completed" : "Mark as completed"}
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                activity.isCompleted
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-300 text-transparent hover:border-brand-400",
              )}
            >
              <Check className="h-3 w-3" />
            </button>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-medium",
                  activity.isCompleted ? "text-slate-400 line-through" : "text-slate-900",
                )}
              >
                {activity.subject}
              </p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                <Icon className="h-3.5 w-3.5" />
                {config.label}
                {activity.dueDate ? (
                  <span className={cn("flex items-center gap-1", isOverdue ? "font-medium text-rose-600" : "")}>
                    <Clock className="h-3 w-3" />
                    {formatDate(activity.dueDate)}
                  </span>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
