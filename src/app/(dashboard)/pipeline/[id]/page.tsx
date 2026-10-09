"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Calendar, Pencil, Trash2, User } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { OpportunityForm } from "@/components/pipeline/opportunity-form";
import { ActivityList } from "@/components/activities/activity-list";
import { useCrmDatabase } from "@/lib/data/store";
import { updateOpportunity, deleteOpportunity, type OpportunityInput } from "@/lib/data/entities";
import { getTeamMember } from "@/lib/data/team";
import { OPPORTUNITY_STAGE_CONFIG } from "@/lib/constants/crm";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OpportunityFormValues } from "@/lib/validations/opportunity";

export default function OpportunityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { opportunities, companies, contacts, activities } = useCrmDatabase();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const opportunity = opportunities.find((item) => item.id === params.id);

  if (!opportunity) {
    return (
      <div>
        <Link href="/pipeline" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back to pipeline
        </Link>
        <p className="mt-6 text-sm text-slate-500">This opportunity no longer exists.</p>
      </div>
    );
  }

  const company = opportunity.companyId ? companies.find((item) => item.id === opportunity.companyId) : null;
  const contact = opportunity.contactId ? contacts.find((item) => item.id === opportunity.contactId) : null;
  const relatedActivities = activities.filter((activity) => activity.opportunityId === opportunity.id);
  const owner = getTeamMember(opportunity.ownerId);
  const stageConfig = OPPORTUNITY_STAGE_CONFIG[opportunity.stage];

  const handleUpdate = (values: OpportunityFormValues) => {
    const input: OpportunityInput = {
      name: values.name.trim(),
      companyId: values.companyId || null,
      contactId: values.contactId || null,
      leadId: opportunity.leadId,
      stage: values.stage,
      amount: Number(values.amount),
      probability: values.probability ? Number(values.probability) : null,
      expectedCloseDate: values.expectedCloseDate || null,
      actualCloseDate: opportunity.actualCloseDate,
      ownerId: values.ownerId,
      notes: values.notes?.trim() || null,
    };
    updateOpportunity(opportunity.id, input);
    showToast("Opportunity updated.");
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteOpportunity(opportunity.id);
    showToast("Opportunity deleted.");
    router.push("/pipeline");
  };

  return (
    <div>
      <Link href="/pipeline" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Back to pipeline
      </Link>

      <PageHeader
        title={opportunity.name}
        description={formatCurrency(opportunity.amount)}
        action={
          <>
            <Button type="button" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Opportunity details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Badge tone={stageConfig.tone}>{stageConfig.label}</Badge>
              {opportunity.probability !== null ? (
                <p className="text-slate-600">Probability: {opportunity.probability}%</p>
              ) : null}
              {company ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                  <Link href={`/companies/${company.id}`} className="truncate hover:text-brand-700">
                    {company.name}
                  </Link>
                </div>
              ) : null}
              {contact ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="h-4 w-4 shrink-0 text-slate-400" />
                  <Link href={`/contacts/${contact.id}`} className="truncate hover:text-brand-700">
                    {contact.firstName} {contact.lastName}
                  </Link>
                </div>
              ) : null}
              {opportunity.expectedCloseDate ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                  Expected: {formatDate(opportunity.expectedCloseDate)}
                </div>
              ) : null}
              {opportunity.actualCloseDate ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                  Closed: {formatDate(opportunity.actualCloseDate)}
                </div>
              ) : null}
              <div className="pt-2 text-slate-500">Owner: {owner?.fullName ?? "—"}</div>
              {opportunity.notes ? <p className="whitespace-pre-wrap pt-2 text-slate-600">{opportunity.notes}</p> : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity history</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityList activities={relatedActivities} emptyLabel="No activities linked to this opportunity." />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit opportunity">
        <OpportunityForm
          defaultValues={{
            name: opportunity.name,
            companyId: opportunity.companyId ?? "",
            contactId: opportunity.contactId ?? "",
            stage: opportunity.stage,
            amount: String(opportunity.amount),
            probability: opportunity.probability === null ? "" : String(opportunity.probability),
            expectedCloseDate: opportunity.expectedCloseDate?.slice(0, 10) ?? "",
            ownerId: opportunity.ownerId,
            notes: opportunity.notes ?? "",
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          submitLabel="Save changes"
        />
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete opportunity"
        description={`This removes ${opportunity.name} and its linked activities.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
