"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2, Mail, Pencil, Phone, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ContactForm } from "@/components/contacts/contact-form";
import { ActivityList } from "@/components/activities/activity-list";
import { useCrmDatabase } from "@/lib/data/store";
import { updateContact, deleteContact, type ContactInput } from "@/lib/data/entities";
import { getTeamMember } from "@/lib/data/team";
import { OPPORTUNITY_STAGE_CONFIG } from "@/lib/constants/crm";
import { formatCurrency } from "@/lib/utils";
import type { ContactFormValues } from "@/lib/validations/contact";

export default function ContactDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { contacts, companies, opportunities, activities } = useCrmDatabase();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const contact = contacts.find((item) => item.id === params.id);

  if (!contact) {
    return (
      <div>
        <Link href="/contacts" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back to contacts
        </Link>
        <p className="mt-6 text-sm text-slate-500">This contact no longer exists.</p>
      </div>
    );
  }

  const company = contact.companyId ? companies.find((item) => item.id === contact.companyId) : null;
  const relatedOpportunities = opportunities.filter((opportunity) => opportunity.contactId === contact.id);
  const relatedActivities = activities.filter((activity) => activity.contactId === contact.id);
  const owner = getTeamMember(contact.ownerId);

  const handleUpdate = (values: ContactFormValues) => {
    const input: ContactInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email?.trim() || null,
      phone: values.phone?.trim() || null,
      jobTitle: values.jobTitle?.trim() || null,
      companyId: values.companyId || null,
      ownerId: values.ownerId,
    };
    updateContact(contact.id, input);
    showToast("Contact updated.");
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteContact(contact.id);
    showToast("Contact deleted.");
    router.push("/contacts");
  };

  return (
    <div>
      <Link href="/contacts" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Back to contacts
      </Link>

      <PageHeader
        title={`${contact.firstName} ${contact.lastName}`}
        description={contact.jobTitle ?? undefined}
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
              <CardTitle>Contact details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {contact.email ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <a href={`mailto:${contact.email}`} className="truncate hover:text-brand-700">
                    {contact.email}
                  </a>
                </div>
              ) : null}
              {contact.phone ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  {contact.phone}
                </div>
              ) : null}
              {company ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                  <Link href={`/companies/${company.id}`} className="truncate hover:text-brand-700">
                    {company.name}
                  </Link>
                </div>
              ) : null}
              <div className="pt-2 text-slate-500">Owner: {owner?.fullName ?? "—"}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityList activities={relatedActivities} emptyLabel="No activities linked to this contact." />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Opportunities ({relatedOpportunities.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {relatedOpportunities.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-500">No opportunities linked to this contact yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {relatedOpportunities.map((opportunity) => (
                    <li key={opportunity.id} className="flex items-center justify-between gap-4 px-5 py-3">
                      <Link
                        href={`/pipeline/${opportunity.id}`}
                        className="truncate text-sm font-medium text-slate-900 hover:text-brand-700"
                      >
                        {opportunity.name}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>{formatCurrency(opportunity.amount)}</span>
                        <Badge tone={OPPORTUNITY_STAGE_CONFIG[opportunity.stage].tone}>
                          {OPPORTUNITY_STAGE_CONFIG[opportunity.stage].label}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit contact">
        <ContactForm
          defaultValues={{
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email ?? "",
            phone: contact.phone ?? "",
            jobTitle: contact.jobTitle ?? "",
            companyId: contact.companyId ?? "",
            ownerId: contact.ownerId,
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          submitLabel="Save changes"
        />
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete contact"
        description={`This removes ${contact.firstName} ${contact.lastName} and its linked activities.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
