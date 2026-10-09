"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRightLeft, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { LeadForm } from "@/components/leads/lead-form";
import { ActivityList } from "@/components/activities/activity-list";
import { useCrmDatabase } from "@/lib/data/store";
import { updateLead, deleteLead, convertLeadToContact, type LeadInput } from "@/lib/data/entities";
import { getTeamMember } from "@/lib/data/team";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_CONFIG } from "@/lib/constants/crm";
import type { LeadFormValues } from "@/lib/validations/lead";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { leads, contacts, companies, activities } = useCrmDatabase();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);

  const lead = leads.find((item) => item.id === params.id);

  if (!lead) {
    return (
      <div>
        <Link href="/leads" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back to leads
        </Link>
        <p className="mt-6 text-sm text-slate-500">This lead no longer exists.</p>
      </div>
    );
  }

  const convertedContact = lead.convertedContactId ? contacts.find((item) => item.id === lead.convertedContactId) : null;
  const convertedCompany = lead.convertedCompanyId ? companies.find((item) => item.id === lead.convertedCompanyId) : null;
  const relatedActivities = activities.filter((activity) => activity.leadId === lead.id);
  const owner = getTeamMember(lead.ownerId);
  const statusConfig = LEAD_STATUS_CONFIG[lead.status];

  const handleUpdate = (values: LeadFormValues) => {
    const input: LeadInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email?.trim() || null,
      phone: values.phone?.trim() || null,
      companyName: values.companyName?.trim() || null,
      source: values.source,
      status: values.status,
      ownerId: values.ownerId,
      notes: values.notes?.trim() || null,
    };
    updateLead(lead.id, input);
    showToast("Lead updated.");
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteLead(lead.id);
    showToast("Lead deleted.");
    router.push("/leads");
  };

  const handleConvert = () => {
    const result = convertLeadToContact(lead.id);
    setConvertOpen(false);
    showToast("Lead converted to a contact.");
    router.push(`/contacts/${result.contactId}`);
  };

  return (
    <div>
      <Link href="/leads" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </Link>

      <PageHeader
        title={`${lead.firstName} ${lead.lastName}`}
        description={lead.companyName ?? undefined}
        action={
          <>
            {lead.status !== "converted" ? (
              <Button type="button" variant="outline" onClick={() => setConvertOpen(true)}>
                <ArrowRightLeft className="h-4 w-4" />
                Convert to contact
              </Button>
            ) : null}
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
              <CardTitle>Lead details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Badge tone={statusConfig.tone}>{statusConfig.label}</Badge>
                <Badge tone="neutral">{LEAD_SOURCE_LABELS[lead.source]}</Badge>
              </div>
              {lead.email ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <a href={`mailto:${lead.email}`} className="truncate hover:text-brand-700">
                    {lead.email}
                  </a>
                </div>
              ) : null}
              {lead.phone ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  {lead.phone}
                </div>
              ) : null}
              <div className="text-slate-500">Owner: {owner?.fullName ?? "—"}</div>
              {convertedContact ? (
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700">
                  Converted to{" "}
                  <Link href={`/contacts/${convertedContact.id}`} className="font-medium hover:underline">
                    {convertedContact.firstName} {convertedContact.lastName}
                  </Link>
                  {convertedCompany ? (
                    <>
                      {" "}
                      at{" "}
                      <Link href={`/companies/${convertedCompany.id}`} className="font-medium hover:underline">
                        {convertedCompany.name}
                      </Link>
                    </>
                  ) : null}
                </div>
              ) : null}
              {lead.notes ? <p className="whitespace-pre-wrap pt-2 text-slate-600">{lead.notes}</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityList activities={relatedActivities} emptyLabel="No activities linked to this lead." />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit lead">
        <LeadForm
          defaultValues={{
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email ?? "",
            phone: lead.phone ?? "",
            companyName: lead.companyName ?? "",
            source: lead.source,
            status: lead.status,
            ownerId: lead.ownerId,
            notes: lead.notes ?? "",
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          submitLabel="Save changes"
        />
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete lead"
        description={`This removes ${lead.firstName} ${lead.lastName} and its linked activities.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <ConfirmDialog
        open={convertOpen}
        title="Convert lead to contact"
        description="This creates a new contact (and company, if a company name was provided) from this lead's details and marks the lead as converted."
        confirmLabel="Convert"
        onConfirm={handleConvert}
        onCancel={() => setConvertOpen(false)}
      />
    </div>
  );
}
