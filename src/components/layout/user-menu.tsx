"use client";

import { useState } from "react";
import { ChevronsUpDown, RotateCcw, Check } from "lucide-react";
import { useCurrentUser, setCurrentUserId } from "@/lib/data/session";
import { TEAM_MEMBERS } from "@/lib/data/team";
import { resetToSeedData } from "@/lib/data/store";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";

export function UserMenu() {
  const currentUser = useCurrentUser();
  const { showToast } = useToast();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  function handleReset() {
    resetToSeedData();
    setResetDialogOpen(false);
    showToast("Demo data has been reset to its original state.");
  }

  return (
    <div className="border-t border-slate-100 px-3 py-3">
      <DropdownMenu
        placement="top"
        triggerClassName="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-slate-50"
        trigger={
          <>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {getInitials(currentUser.fullName)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-slate-900">{currentUser.fullName}</span>
              <span className="block truncate text-xs text-slate-400">
                {currentUser.role === "admin" ? "Admin" : "Sales Representative"}
              </span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
          </>
        }
      >
        <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-slate-400">Viewing as (demo)</p>
        {TEAM_MEMBERS.map((member) => (
          <DropdownMenuItem key={member.id} active={member.id === currentUser.id} onClick={() => setCurrentUserId(member.id)}>
            <span className="flex-1 truncate">{member.fullName}</span>
            {member.id === currentUser.id ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
          </DropdownMenuItem>
        ))}
        <div className="my-1 border-t border-slate-100" />
        <DropdownMenuItem onClick={() => setResetDialogOpen(true)}>
          <RotateCcw className="h-3.5 w-3.5 shrink-0" />
          Reset demo data
        </DropdownMenuItem>
      </DropdownMenu>

      <ConfirmDialog
        open={resetDialogOpen}
        title="Reset demo data"
        description="This restores all companies, contacts, leads, opportunities, and activities to their original demo state. Changes you have made will be lost."
        confirmLabel="Reset data"
        destructive
        onConfirm={handleReset}
        onCancel={() => setResetDialogOpen(false)}
      />
    </div>
  );
}
