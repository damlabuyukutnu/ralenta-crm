"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Globe, MapPin, Phone, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { CompanyForm } from "@/components/companies/company-form";
import { ActivityList } from "@/components/activities/activity-list";
import { useCrmDatabase } from "@/lib/data/store";
import { updateCompany, deleteCompany, type CompanyInput } from "@/lib/data/entities";
import { getTeamMember } from "@/lib/data/team";
import { OPPORTUNITY_STAGE_CONFIG } from "@/lib/constants/crm";
import { formatCurrency } from "@/lib/utils";
import type { CompanyFormValues } from "@/lib/validations/company";

export default function CompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const { companies, contacts, opportunities, activities } = useCrmDatabase();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const company = companies.find((item) => item.id === params.id);

  if (!company) {
    return (
      <div>
        <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back to companies
        </Link>
        <p className="mt-6 text-sm text-slate-500">This company no longer exists.</p>
      </div>
    );
  }

  const relatedContacts = contacts.filter((contact) => contact.companyId === company.id);
  const relatedOpportunities = opportunities.filter((opportunity) => opportunity.companyId === company.id);
  const relatedActivities = activities.filter((activity) => activity.companyId === company.id);
  const owner = getTeamMember(company.ownerId);

  const handleUpdate = (values: CompanyFormValues) => {
    const input: CompanyInput = {
      name: values.name.trim(),
      industry: values.industry?.trim() || null,
      website: values.website?.trim() || null,
      phone: values.phone?.trim() || null,
      address: values.address?.trim() || null,
      ownerId: values.ownerId,
    };
    updateCompany(company.id, input);
    showToast("Company updated.");
    setEditOpen(false);
  };

  const handleDelete = () => {
    deleteCompany(company.id);
    showToast("Company deleted.");
    router.push("/companies");
  };

  return (
    <div>
      <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Back to companies
      </Link>

      <PageHeader
        title={company.name}
        description={company.industry ?? undefined}
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
              <CardTitle>Company details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {company.website ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Globe className="h-4 w-4 shrink-0 text-slate-400" />
                  <a href={company.website} target="_blank" rel="noreferrer" className="truncate hover:text-brand-700">
                    {company.website}
                  </a>
                </div>
              ) : null}
              {company.phone ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                  {company.phone}
                </div>
              ) : null}
              {company.address ? (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                  {company.address}
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
              <ActivityList activities={relatedActivities} emptyLabel="No activities linked to this company." />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contacts ({relatedContacts.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {relatedContacts.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-500">No contacts linked to this company yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {relatedContacts.map((contact) => (
                    <li key={contact.id} className="flex items-center justify-between px-5 py-3">
                      <Link href={`/contacts/${contact.id}`} className="text-sm font-medium text-slate-900 hover:text-brand-700">
                        {contact.firstName} {contact.lastName}
                      </Link>
                      <span className="text-sm text-slate-500">{contact.jobTitle ?? "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opportunities ({relatedOpportunities.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {relatedOpportunities.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-500">No opportunities linked to this company yet.</p>
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

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit company">
        <CompanyForm
          defaultValues={{
            name: company.name,
            industry: company.industry ?? "",
            website: company.website ?? "",
            phone: company.phone ?? "",
            address: company.address ?? "",
            ownerId: company.ownerId,
          }}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          submitLabel="Save changes"
        />
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete company"
        description={`This removes ${company.name} and unlinks it from related contacts and opportunities.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
