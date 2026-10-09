"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { LeadForm } from "@/components/leads/lead-form";
import { useCrmDatabase } from "@/lib/data/store";
import { createLead, updateLead, deleteLead, type LeadInput } from "@/lib/data/entities";
import { useCurrentUser } from "@/lib/data/session";
import { TEAM_MEMBERS, getTeamMember } from "@/lib/data/team";
import { LEAD_SOURCE_LABELS, LEAD_STATUS_CONFIG, LEAD_STATUSES } from "@/lib/constants/crm";
import { usePaginatedList } from "@/lib/hooks/use-paginated-list";
import type { Lead } from "@/lib/types/crm";
import type { LeadFormValues } from "@/lib/validations/lead";

const PAGE_SIZE = 8;
const ALL = "all";

export default function LeadsPage() {
  const { leads } = useCrmDatabase();
  const currentUser = useCurrentUser();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [ownerFilter, setOwnerFilter] = useState(ALL);
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      if (statusFilter !== ALL && lead.status !== statusFilter) return false;
      if (ownerFilter !== ALL && lead.ownerId !== ownerFilter) return false;
      if (!query) return true;

      const haystack = [`${lead.firstName} ${lead.lastName}`, lead.email, lead.companyName];
      return haystack.some((value) => value?.toLowerCase().includes(query));
    });
  }, [leads, search, statusFilter, ownerFilter]);

  const { page, pageCount, pageItems, setPage, resetPage } = usePaginatedList(filtered, PAGE_SIZE);

  function openCreateForm() {
    setEditingLead(null);
    setFormOpen(true);
  }

  function openEditForm(lead: Lead) {
    setEditingLead(lead);
    setFormOpen(true);
  }

  function handleSubmit(values: LeadFormValues) {
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

    if (editingLead) {
      updateLead(editingLead.id, input);
      showToast("Lead updated.");
    } else {
      createLead(input);
      showToast("Lead created.");
    }

    setFormOpen(false);
  }

  function handleDelete() {
    if (!deletingLead) return;
    deleteLead(deletingLead.id);
    showToast("Lead deleted.");
    setDeletingLead(null);
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Track and qualify incoming prospects before they enter the pipeline."
        action={
          <Button type="button" onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            New lead
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetPage();
            }}
            placeholder="Search leads..."
            className="pl-9"
            aria-label="Search leads"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            resetPage();
          }}
          className="w-auto"
          aria-label="Filter by status"
        >
          <option value={ALL}>All statuses</option>
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {LEAD_STATUS_CONFIG[status].label}
            </option>
          ))}
        </Select>
        <Select
          value={ownerFilter}
          onChange={(event) => {
            setOwnerFilter(event.target.value);
            resetPage();
          }}
          className="w-auto"
          aria-label="Filter by owner"
        >
          <option value={ALL}>All owners</option>
          {TEAM_MEMBERS.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title={leads.length === 0 ? "No leads yet" : "No leads match your filters"}
          description={
            leads.length === 0 ? "Add your first lead to start building your pipeline." : "Try a different search term or filter."
          }
          action={
            leads.length === 0 ? (
              <Button type="button" onClick={openCreateForm}>
                <Plus className="h-4 w-4" />
                New lead
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Company</TableHeaderCell>
                <TableHeaderCell>Source</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Owner</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {pageItems.map((lead) => {
                const owner = getTeamMember(lead.ownerId);
                const statusConfig = LEAD_STATUS_CONFIG[lead.status];

                return (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Link href={`/leads/${lead.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                        {lead.firstName} {lead.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>{lead.companyName ?? "—"}</TableCell>
                    <TableCell>{LEAD_SOURCE_LABELS[lead.source]}</TableCell>
                    <TableCell>
                      <Badge tone={statusConfig.tone}>{statusConfig.label}</Badge>
                    </TableCell>
                    <TableCell>{owner?.fullName ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuItem onClick={() => openEditForm(lead)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem destructive onClick={() => setDeletingLead(lead)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </div>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title={editingLead ? "Edit lead" : "New lead"}>
        <LeadForm
          defaultValues={
            editingLead
              ? {
                  firstName: editingLead.firstName,
                  lastName: editingLead.lastName,
                  email: editingLead.email ?? "",
                  phone: editingLead.phone ?? "",
                  companyName: editingLead.companyName ?? "",
                  source: editingLead.source,
                  status: editingLead.status,
                  ownerId: editingLead.ownerId,
                  notes: editingLead.notes ?? "",
                }
              : { ownerId: currentUser.id }
          }
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitLabel={editingLead ? "Save changes" : "Create lead"}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deletingLead}
        title="Delete lead"
        description={`This removes ${deletingLead ? `${deletingLead.firstName} ${deletingLead.lastName}` : "this lead"} and its linked activities.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeletingLead(null)}
      />
    </div>
  );
}
