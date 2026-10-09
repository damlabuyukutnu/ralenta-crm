"use client";

import { useState, type DragEvent } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { OpportunityForm } from "@/components/pipeline/opportunity-form";
import { OpportunityCard } from "@/components/pipeline/opportunity-card";
import { useCrmDatabase } from "@/lib/data/store";
import {
  createOpportunity,
  updateOpportunity,
  updateOpportunityStage,
  deleteOpportunity,
  type OpportunityInput,
} from "@/lib/data/entities";
import { useCurrentUser } from "@/lib/data/session";
import { OPPORTUNITY_STAGE_CONFIG, OPPORTUNITY_STAGES } from "@/lib/constants/crm";
import { cn, formatCurrency } from "@/lib/utils";
import type { Opportunity, OpportunityStage } from "@/lib/types/crm";
import type { OpportunityFormValues } from "@/lib/validations/opportunity";

export default function PipelinePage() {
  const { opportunities, companies, contacts } = useCrmDatabase();
  const currentUser = useCurrentUser();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [deletingOpportunity, setDeletingOpportunity] = useState<Opportunity | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OpportunityStage | null>(null);

  function companyName(id: string | null) {
    if (!id) return null;
    return companies.find((company) => company.id === id)?.name ?? null;
  }

  function contactName(id: string | null) {
    if (!id) return null;
    const contact = contacts.find((item) => item.id === id);
    return contact ? `${contact.firstName} ${contact.lastName}` : null;
  }

  function openCreateForm() {
    setEditingOpportunity(null);
    setFormOpen(true);
  }

  function openEditForm(opportunity: Opportunity) {
    setEditingOpportunity(opportunity);
    setFormOpen(true);
  }

  function handleSubmit(values: OpportunityFormValues) {
    const input: OpportunityInput = {
      name: values.name.trim(),
      companyId: values.companyId || null,
      contactId: values.contactId || null,
      leadId: editingOpportunity?.leadId ?? null,
      stage: values.stage,
      amount: Number(values.amount),
      probability: values.probability ? Number(values.probability) : null,
      expectedCloseDate: values.expectedCloseDate || null,
      actualCloseDate: editingOpportunity?.actualCloseDate ?? null,
      ownerId: values.ownerId,
      notes: values.notes?.trim() || null,
    };

    if (editingOpportunity) {
      updateOpportunity(editingOpportunity.id, input);
      showToast("Opportunity updated.");
    } else {
      createOpportunity(input);
      showToast("Opportunity created.");
    }

    setFormOpen(false);
  }

  function handleDelete() {
    if (!deletingOpportunity) return;
    deleteOpportunity(deletingOpportunity.id);
    showToast("Opportunity deleted.");
    setDeletingOpportunity(null);
  }

  function handleDragStart(event: DragEvent<HTMLDivElement>, opportunityId: string) {
    event.dataTransfer.setData("text/plain", opportunityId);
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, stage: OpportunityStage) {
    event.preventDefault();
    const opportunityId = event.dataTransfer.getData("text/plain");
    if (opportunityId) {
      updateOpportunityStage(opportunityId, stage);
    }
    setDragOverStage(null);
  }

  return (
    <div>
      <PageHeader
        title="Pipeline"
        description="Drag opportunities across stages, or use the card menu on touch devices."
        action={
          <Button type="button" onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            New opportunity
          </Button>
        }
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {OPPORTUNITY_STAGES.map((stage) => {
          const stageOpportunities = opportunities.filter((opportunity) => opportunity.stage === stage);
          const stageTotal = stageOpportunities.reduce((sum, opportunity) => sum + opportunity.amount, 0);
          const config = OPPORTUNITY_STAGE_CONFIG[stage];

          return (
            <div
              key={stage}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverStage(stage);
              }}
              onDragLeave={() => setDragOverStage((current) => (current === stage ? null : current))}
              onDrop={(event) => handleDrop(event, stage)}
              className={cn(
                "flex w-72 shrink-0 flex-col rounded-xl border bg-slate-50/60 transition-colors",
                dragOverStage === stage ? "border-brand-400 bg-brand-50/60" : "border-slate-200",
              )}
            >
              <div className="border-b border-slate-200 px-3 py-3">
                <p className="text-sm font-semibold text-slate-900">{config.label}</p>
                <p className="text-xs text-slate-500">
                  {stageOpportunities.length} deals · {formatCurrency(stageTotal)}
                </p>
              </div>
              <div className="flex-1 space-y-2 p-2">
                {stageOpportunities.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-slate-400">No opportunities</p>
                ) : (
                  stageOpportunities.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      companyName={companyName(opportunity.companyId)}
                      contactName={contactName(opportunity.contactId)}
                      onEdit={() => openEditForm(opportunity)}
                      onDelete={() => setDeletingOpportunity(opportunity)}
                      onMoveStage={(nextStage) => updateOpportunityStage(opportunity.id, nextStage)}
                      onDragStart={(event) => handleDragStart(event, opportunity.id)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingOpportunity ? "Edit opportunity" : "New opportunity"}
      >
        <OpportunityForm
          defaultValues={
            editingOpportunity
              ? {
                  name: editingOpportunity.name,
                  companyId: editingOpportunity.companyId ?? "",
                  contactId: editingOpportunity.contactId ?? "",
                  stage: editingOpportunity.stage,
                  amount: String(editingOpportunity.amount),
                  probability: editingOpportunity.probability === null ? "" : String(editingOpportunity.probability),
                  expectedCloseDate: editingOpportunity.expectedCloseDate?.slice(0, 10) ?? "",
                  ownerId: editingOpportunity.ownerId,
                  notes: editingOpportunity.notes ?? "",
                }
              : { ownerId: currentUser.id }
          }
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitLabel={editingOpportunity ? "Save changes" : "Create opportunity"}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deletingOpportunity}
        title="Delete opportunity"
        description={`This removes ${deletingOpportunity?.name ?? "this opportunity"} and its linked activities.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeletingOpportunity(null)}
      />
    </div>
  );
}
