"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { CompanyForm } from "@/components/companies/company-form";
import { useCrmDatabase } from "@/lib/data/store";
import { createCompany, updateCompany, deleteCompany, type CompanyInput } from "@/lib/data/entities";
import { useCurrentUser } from "@/lib/data/session";
import { getTeamMember } from "@/lib/data/team";
import { usePaginatedList } from "@/lib/hooks/use-paginated-list";
import type { Company } from "@/lib/types/crm";
import type { CompanyFormValues } from "@/lib/validations/company";

const PAGE_SIZE = 8;

export default function CompaniesPage() {
  const { companies, contacts, opportunities } = useCrmDatabase();
  const currentUser = useCurrentUser();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return companies;
    return companies.filter((company) =>
      [company.name, company.industry, company.website].some((value) => value?.toLowerCase().includes(query)),
    );
  }, [companies, search]);

  const { page, pageCount, pageItems, setPage, resetPage } = usePaginatedList(filtered, PAGE_SIZE);

  function relatedCounts(companyId: string) {
    return {
      contacts: contacts.filter((contact) => contact.companyId === companyId).length,
      opportunities: opportunities.filter((opportunity) => opportunity.companyId === companyId).length,
    };
  }

  function openCreateForm() {
    setEditingCompany(null);
    setFormOpen(true);
  }

  function openEditForm(company: Company) {
    setEditingCompany(company);
    setFormOpen(true);
  }

  function handleSubmit(values: CompanyFormValues) {
    const input: CompanyInput = {
      name: values.name.trim(),
      industry: values.industry?.trim() || null,
      website: values.website?.trim() || null,
      phone: values.phone?.trim() || null,
      address: values.address?.trim() || null,
      ownerId: values.ownerId,
    };

    if (editingCompany) {
      updateCompany(editingCompany.id, input);
      showToast("Company updated.");
    } else {
      createCompany(input);
      showToast("Company created.");
    }

    setFormOpen(false);
  }

  function handleDelete() {
    if (!deletingCompany) return;
    deleteCompany(deletingCompany.id);
    showToast("Company deleted.");
    setDeletingCompany(null);
  }

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Organizations tied to contacts and open opportunities."
        action={
          <Button type="button" onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            New company
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetPage();
            }}
            placeholder="Search companies..."
            className="pl-9"
            aria-label="Search companies"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={companies.length === 0 ? "No companies yet" : "No companies match your search"}
          description={
            companies.length === 0
              ? "Add your first company to start tracking contacts and opportunities."
              : "Try a different search term."
          }
          action={
            companies.length === 0 ? (
              <Button type="button" onClick={openCreateForm}>
                <Plus className="h-4 w-4" />
                New company
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
                <TableHeaderCell>Industry</TableHeaderCell>
                <TableHeaderCell>Contacts</TableHeaderCell>
                <TableHeaderCell>Opportunities</TableHeaderCell>
                <TableHeaderCell>Owner</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {pageItems.map((company) => {
                const counts = relatedCounts(company.id);
                const owner = getTeamMember(company.ownerId);

                return (
                  <TableRow key={company.id}>
                    <TableCell>
                      <Link href={`/companies/${company.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                        {company.name}
                      </Link>
                    </TableCell>
                    <TableCell>{company.industry ?? "—"}</TableCell>
                    <TableCell>{counts.contacts}</TableCell>
                    <TableCell>{counts.opportunities}</TableCell>
                    <TableCell>{owner?.fullName ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuItem onClick={() => openEditForm(company)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem destructive onClick={() => setDeletingCompany(company)}>
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

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title={editingCompany ? "Edit company" : "New company"}>
        <CompanyForm
          defaultValues={
            editingCompany
              ? {
                  name: editingCompany.name,
                  industry: editingCompany.industry ?? "",
                  website: editingCompany.website ?? "",
                  phone: editingCompany.phone ?? "",
                  address: editingCompany.address ?? "",
                  ownerId: editingCompany.ownerId,
                }
              : { ownerId: currentUser.id }
          }
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitLabel={editingCompany ? "Save changes" : "Create company"}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deletingCompany}
        title="Delete company"
        description={`This removes ${deletingCompany?.name ?? "this company"} and unlinks it from related contacts and opportunities.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeletingCompany(null)}
      />
    </div>
  );
}
