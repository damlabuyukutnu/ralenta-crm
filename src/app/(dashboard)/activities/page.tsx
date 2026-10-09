"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Clock, ListChecks, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { ActivityForm } from "@/components/activities/activity-form";
import { useCrmDatabase } from "@/lib/data/store";
import {
  createActivity,
  updateActivity,
  deleteActivity,
  toggleActivityComplete,
  type ActivityInput,
} from "@/lib/data/entities";
import { useCurrentUser } from "@/lib/data/session";
import { getTeamMember } from "@/lib/data/team";
import { ACTIVITY_TYPE_CONFIG } from "@/lib/constants/crm";
import { getActivityRelatedRecord } from "@/lib/activity-link";
import { cn, formatDate } from "@/lib/utils";
import type { Activity } from "@/lib/types/crm";
import type { ActivityFormValues } from "@/lib/validations/activity";

type FilterTab = "all" | "upcoming" | "overdue" | "completed";

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

export default function ActivitiesPage() {
  const database = useCrmDatabase();
  const { activities } = database;
  const currentUser = useCurrentUser();
  const { showToast } = useToast();

  const [tab, setTab] = useState<FilterTab>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(null);

  const [now] = useState(() => Date.now());

  const sorted = useMemo(() => {
    const filtered = activities.filter((activity) => {
      if (tab === "completed") return activity.isCompleted;
      if (tab === "overdue") return !activity.isCompleted && !!activity.dueDate && new Date(activity.dueDate).getTime() < now;
      if (tab === "upcoming") {
        return !activity.isCompleted && (!activity.dueDate || new Date(activity.dueDate).getTime() >= now);
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });
  }, [activities, tab, now]);

  function openCreateForm() {
    setEditingActivity(null);
    setFormOpen(true);
  }

  function openEditForm(activity: Activity) {
    setEditingActivity(activity);
    setFormOpen(true);
  }

  function handleSubmit(values: ActivityFormValues) {
    const input: ActivityInput = {
      type: values.type,
      subject: values.subject.trim(),
      description: values.description?.trim() || null,
      dueDate: values.dueDate || null,
      ownerId: values.ownerId,
      leadId: values.relatedType === "lead" ? values.relatedId : null,
      contactId: values.relatedType === "contact" ? values.relatedId : null,
      companyId: values.relatedType === "company" ? values.relatedId : null,
      opportunityId: values.relatedType === "opportunity" ? values.relatedId : null,
    };

    if (editingActivity) {
      updateActivity(editingActivity.id, input);
      showToast("Activity updated.");
    } else {
      createActivity(input);
      showToast("Activity created.");
    }

    setFormOpen(false);
  }

  function handleDelete() {
    if (!deletingActivity) return;
    deleteActivity(deletingActivity.id);
    showToast("Activity deleted.");
    setDeletingActivity(null);
  }

  function editingDefaults(activity: Activity): Partial<ActivityFormValues> {
    const relatedType = activity.leadId
      ? "lead"
      : activity.contactId
        ? "contact"
        : activity.companyId
          ? "company"
          : "opportunity";
    const relatedId = activity.leadId ?? activity.contactId ?? activity.companyId ?? activity.opportunityId ?? "";

    return {
      type: activity.type,
      subject: activity.subject,
      description: activity.description ?? "",
      dueDate: activity.dueDate?.slice(0, 10) ?? "",
      ownerId: activity.ownerId,
      relatedType,
      relatedId,
    };
  }

  return (
    <div>
      <PageHeader
        title="Activities"
        description="Calls, meetings, emails, tasks, and notes across every record."
        action={
          <Button type="button" onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            New activity
          </Button>
        }
      />

      <div className="mb-4 flex w-fit gap-1 rounded-lg bg-slate-100 p-1 text-sm font-medium">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              tab === item.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={activities.length === 0 ? "No activities yet" : "No activities in this view"}
          description={
            activities.length === 0
              ? "Log your first call, meeting, email, task, or note."
              : "Try a different tab to see other activities."
          }
          action={
            activities.length === 0 ? (
              <Button type="button" onClick={openCreateForm}>
                <Plus className="h-4 w-4" />
                New activity
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
          {sorted.map((activity) => {
            const config = ACTIVITY_TYPE_CONFIG[activity.type];
            const Icon = config.icon;
            const owner = getTeamMember(activity.ownerId);
            const related = getActivityRelatedRecord(activity, database);
            const isOverdue = !activity.isCompleted && !!activity.dueDate && new Date(activity.dueDate).getTime() < now;

            return (
              <div key={activity.id} className="flex items-start gap-3 px-4 py-3">
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
                      "text-sm font-medium",
                      activity.isCompleted ? "text-slate-400 line-through" : "text-slate-900",
                    )}
                  >
                    {activity.subject}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Icon className="h-3.5 w-3.5" />
                      {config.label}
                    </span>
                    {activity.dueDate ? (
                      <span className={cn("flex items-center gap-1", isOverdue ? "font-medium text-rose-600" : "")}>
                        <Clock className="h-3 w-3" />
                        {formatDate(activity.dueDate)}
                      </span>
                    ) : null}
                    {related ? (
                      <Link href={related.href} className="hover:text-brand-700">
                        {related.label}
                      </Link>
                    ) : null}
                    <span>{owner?.fullName ?? "—"}</span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuItem onClick={() => openEditForm(activity)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem destructive onClick={() => setDeletingActivity(activity)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title={editingActivity ? "Edit activity" : "New activity"}>
        <ActivityForm
          defaultValues={editingActivity ? editingDefaults(editingActivity) : { ownerId: currentUser.id }}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitLabel={editingActivity ? "Save changes" : "Create activity"}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deletingActivity}
        title="Delete activity"
        description={`This removes "${deletingActivity?.subject ?? "this activity"}".`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeletingActivity(null)}
      />
    </div>
  );
}
