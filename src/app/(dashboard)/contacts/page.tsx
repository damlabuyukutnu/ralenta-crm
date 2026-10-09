"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { ContactForm } from "@/components/contacts/contact-form";
import { useCrmDatabase } from "@/lib/data/store";
import { createContact, updateContact, deleteContact, type ContactInput } from "@/lib/data/entities";
import { useCurrentUser } from "@/lib/data/session";
import { getTeamMember } from "@/lib/data/team";
import { usePaginatedList } from "@/lib/hooks/use-paginated-list";
import type { Contact } from "@/lib/types/crm";
import type { ContactFormValues } from "@/lib/validations/contact";

const PAGE_SIZE = 8;
const ALL_COMPANIES = "all";

export default function ContactsPage() {
  const { contacts, companies } = useCrmDatabase();
  const currentUser = useCurrentUser();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState(ALL_COMPANIES);
  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  const companyName = useCallback(
    (companyId: string | null) => {
      if (!companyId) return null;
      return companies.find((company) => company.id === companyId)?.name ?? null;
    },
    [companies],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return contacts.filter((contact) => {
      if (companyFilter !== ALL_COMPANIES && contact.companyId !== companyFilter) return false;
      if (!query) return true;

      const haystack = [
        `${contact.firstName} ${contact.lastName}`,
        contact.email,
        contact.jobTitle,
        companyName(contact.companyId),
      ];
      return haystack.some((value) => value?.toLowerCase().includes(query));
    });
  }, [contacts, search, companyFilter, companyName]);

  const { page, pageCount, pageItems, setPage, resetPage } = usePaginatedList(filtered, PAGE_SIZE);

  function openCreateForm() {
    setEditingContact(null);
    setFormOpen(true);
  }

  function openEditForm(contact: Contact) {
    setEditingContact(contact);
    setFormOpen(true);
  }

  function handleSubmit(values: ContactFormValues) {
    const input: ContactInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email?.trim() || null,
      phone: values.phone?.trim() || null,
      jobTitle: values.jobTitle?.trim() || null,
      companyId: values.companyId || null,
      ownerId: values.ownerId,
    };

    if (editingContact) {
      updateContact(editingContact.id, input);
      showToast("Contact updated.");
    } else {
      createContact(input);
      showToast("Contact created.");
    }

    setFormOpen(false);
  }

  function handleDelete() {
    if (!deletingContact) return;
    deleteContact(deletingContact.id);
    showToast("Contact deleted.");
    setDeletingContact(null);
  }

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="People associated with companies, leads, and opportunities."
        action={
          <Button type="button" onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            New contact
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
            placeholder="Search contacts..."
            className="pl-9"
            aria-label="Search contacts"
          />
        </div>
        <Select
          value={companyFilter}
          onChange={(event) => {
            setCompanyFilter(event.target.value);
            resetPage();
          }}
          className="w-auto"
          aria-label="Filter by company"
        >
          <option value={ALL_COMPANIES}>All companies</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={contacts.length === 0 ? "No contacts yet" : "No contacts match your filters"}
          description={
            contacts.length === 0
              ? "Add your first contact to start tracking relationships."
              : "Try a different search term or filter."
          }
          action={
            contacts.length === 0 ? (
              <Button type="button" onClick={openCreateForm}>
                <Plus className="h-4 w-4" />
                New contact
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
                <TableHeaderCell>Job title</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Owner</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {pageItems.map((contact) => {
                const owner = getTeamMember(contact.ownerId);

                return (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <Link href={`/contacts/${contact.id}`} className="font-medium text-slate-900 hover:text-brand-700">
                        {contact.firstName} {contact.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>{companyName(contact.companyId) ?? "—"}</TableCell>
                    <TableCell>{contact.jobTitle ?? "—"}</TableCell>
                    <TableCell>{contact.email ?? "—"}</TableCell>
                    <TableCell>{owner?.fullName ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuItem onClick={() => openEditForm(contact)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem destructive onClick={() => setDeletingContact(contact)}>
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

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} title={editingContact ? "Edit contact" : "New contact"}>
        <ContactForm
          defaultValues={
            editingContact
              ? {
                  firstName: editingContact.firstName,
                  lastName: editingContact.lastName,
                  email: editingContact.email ?? "",
                  phone: editingContact.phone ?? "",
                  jobTitle: editingContact.jobTitle ?? "",
                  companyId: editingContact.companyId ?? "",
                  ownerId: editingContact.ownerId,
                }
              : { ownerId: currentUser.id }
          }
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitLabel={editingContact ? "Save changes" : "Create contact"}
        />
      </Dialog>

      <ConfirmDialog
        open={!!deletingContact}
        title="Delete contact"
        description={`This removes ${deletingContact ? `${deletingContact.firstName} ${deletingContact.lastName}` : "this contact"} and its linked activities.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setDeletingContact(null)}
      />
    </div>
  );
}
