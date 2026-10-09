"use client";

import type { DragEvent } from "react";
import Link from "next/link";
import { Building2, Calendar } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { OPPORTUNITY_STAGE_CONFIG, OPPORTUNITY_STAGES } from "@/lib/constants/crm";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Opportunity, OpportunityStage } from "@/lib/types/crm";

interface OpportunityCardProps {
  opportunity: Opportunity;
  companyName: string | null;
  contactName: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onMoveStage: (stage: OpportunityStage) => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
}

export function OpportunityCard({
  opportunity,
  companyName,
  contactName,
  onEdit,
  onDelete,
  onMoveStage,
  onDragStart,
}: OpportunityCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/pipeline/${opportunity.id}`} className="text-sm font-medium text-slate-900 hover:text-brand-700">
          {opportunity.name}
        </Link>
        <DropdownMenu>
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
          <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-slate-400">Move to</p>
          {OPPORTUNITY_STAGES.filter((stage) => stage !== opportunity.stage).map((stage) => (
            <DropdownMenuItem key={stage} onClick={() => onMoveStage(stage)}>
              {OPPORTUNITY_STAGE_CONFIG[stage].label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem destructive onClick={onDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
      {companyName || contactName ? (
        <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
          <Building2 className="h-3 w-3 shrink-0" />
          {companyName ?? contactName}
        </p>
      ) : null}
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium text-slate-700">{formatCurrency(opportunity.amount)}</span>
        {opportunity.expectedCloseDate ? (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(opportunity.expectedCloseDate)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
