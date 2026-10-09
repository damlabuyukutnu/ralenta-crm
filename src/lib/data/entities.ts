import { mutate } from "@/lib/data/store";
import type { Activity, Company, Contact, CrmDatabase, Lead, Opportunity, OpportunityStage } from "@/lib/types/crm";

function createId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export type CompanyInput = Omit<Company, "id" | "createdAt" | "updatedAt">;
export type ContactInput = Omit<Contact, "id" | "createdAt" | "updatedAt">;
export type LeadInput = Omit<Lead, "id" | "createdAt" | "updatedAt" | "convertedContactId" | "convertedCompanyId">;
export type OpportunityInput = Omit<Opportunity, "id" | "createdAt" | "updatedAt">;
export type ActivityInput = Omit<Activity, "id" | "createdAt" | "updatedAt" | "isCompleted" | "completedAt">;

export function createCompany(input: CompanyInput): Company {
  const company: Company = { ...input, id: createId(), createdAt: now(), updatedAt: now() };
  mutate((db) => ({ ...db, companies: [...db.companies, company] }));
  return company;
}

export function updateCompany(id: string, input: CompanyInput): void {
  mutate((db) => ({
    ...db,
    companies: db.companies.map((company) => (company.id === id ? { ...company, ...input, updatedAt: now() } : company)),
  }));
}

export function deleteCompany(id: string): void {
  mutate((db) => ({
    ...db,
    companies: db.companies.filter((company) => company.id !== id),
    contacts: db.contacts.map((contact) => (contact.companyId === id ? { ...contact, companyId: null } : contact)),
    opportunities: db.opportunities.map((opportunity) =>
      opportunity.companyId === id ? { ...opportunity, companyId: null } : opportunity,
    ),
    activities: db.activities.filter((activity) => activity.companyId !== id),
  }));
}

export function createContact(input: ContactInput): Contact {
  const contact: Contact = { ...input, id: createId(), createdAt: now(), updatedAt: now() };
  mutate((db) => ({ ...db, contacts: [...db.contacts, contact] }));
  return contact;
}

export function updateContact(id: string, input: ContactInput): void {
  mutate((db) => ({
    ...db,
    contacts: db.contacts.map((contact) => (contact.id === id ? { ...contact, ...input, updatedAt: now() } : contact)),
  }));
}

export function deleteContact(id: string): void {
  mutate((db) => ({
    ...db,
    contacts: db.contacts.filter((contact) => contact.id !== id),
    leads: db.leads.map((lead) => (lead.convertedContactId === id ? { ...lead, convertedContactId: null } : lead)),
    opportunities: db.opportunities.map((opportunity) =>
      opportunity.contactId === id ? { ...opportunity, contactId: null } : opportunity,
    ),
    activities: db.activities.filter((activity) => activity.contactId !== id),
  }));
}

export function createLead(input: LeadInput): Lead {
  const lead: Lead = {
    ...input,
    id: createId(),
    convertedContactId: null,
    convertedCompanyId: null,
    createdAt: now(),
    updatedAt: now(),
  };
  mutate((db) => ({ ...db, leads: [...db.leads, lead] }));
  return lead;
}

export function updateLead(id: string, input: LeadInput): void {
  mutate((db) => ({
    ...db,
    leads: db.leads.map((lead) => (lead.id === id ? { ...lead, ...input, updatedAt: now() } : lead)),
  }));
}

export function deleteLead(id: string): void {
  mutate((db) => ({
    ...db,
    leads: db.leads.filter((lead) => lead.id !== id),
    opportunities: db.opportunities.map((opportunity) =>
      opportunity.leadId === id ? { ...opportunity, leadId: null } : opportunity,
    ),
    activities: db.activities.filter((activity) => activity.leadId !== id),
  }));
}

function findOrCreateCompanyByName(db: CrmDatabase, name: string, ownerId: string): { db: CrmDatabase; companyId: string } {
  const existing = db.companies.find((company) => company.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return { db, companyId: existing.id };
  }

  const company: Company = {
    id: createId(),
    name,
    industry: null,
    website: null,
    phone: null,
    address: null,
    ownerId,
    createdAt: now(),
    updatedAt: now(),
  };

  return { db: { ...db, companies: [...db.companies, company] }, companyId: company.id };
}

export function convertLeadToContact(leadId: string): { contactId: string; companyId: string | null } {
  let createdContactId = "";
  let createdCompanyId: string | null = null;

  mutate((db) => {
    const lead = db.leads.find((item) => item.id === leadId);
    if (!lead) return db;

    let working = db;
    let companyId: string | null = null;

    if (lead.companyName) {
      const result = findOrCreateCompanyByName(working, lead.companyName, lead.ownerId);
      working = result.db;
      companyId = result.companyId;
    }

    const contact: Contact = {
      id: createId(),
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      jobTitle: null,
      companyId,
      ownerId: lead.ownerId,
      createdAt: now(),
      updatedAt: now(),
    };

    createdContactId = contact.id;
    createdCompanyId = companyId;

    return {
      ...working,
      contacts: [...working.contacts, contact],
      leads: working.leads.map((item) =>
        item.id === leadId
          ? { ...item, status: "converted", convertedContactId: contact.id, convertedCompanyId: companyId, updatedAt: now() }
          : item,
      ),
    };
  });

  return { contactId: createdContactId, companyId: createdCompanyId };
}

export function createOpportunity(input: OpportunityInput): Opportunity {
  const opportunity: Opportunity = { ...input, id: createId(), createdAt: now(), updatedAt: now() };
  mutate((db) => ({ ...db, opportunities: [...db.opportunities, opportunity] }));
  return opportunity;
}

export function updateOpportunity(id: string, input: OpportunityInput): void {
  mutate((db) => ({
    ...db,
    opportunities: db.opportunities.map((opportunity) =>
      opportunity.id === id ? { ...opportunity, ...input, updatedAt: now() } : opportunity,
    ),
  }));
}

export function updateOpportunityStage(id: string, stage: OpportunityStage): void {
  mutate((db) => ({
    ...db,
    opportunities: db.opportunities.map((opportunity) => {
      if (opportunity.id !== id) return opportunity;

      const isClosed = stage === "won" || stage === "lost";
      return {
        ...opportunity,
        stage,
        actualCloseDate: isClosed ? opportunity.actualCloseDate ?? now() : null,
        updatedAt: now(),
      };
    }),
  }));
}

export function deleteOpportunity(id: string): void {
  mutate((db) => ({
    ...db,
    opportunities: db.opportunities.filter((opportunity) => opportunity.id !== id),
    activities: db.activities.filter((activity) => activity.opportunityId !== id),
  }));
}

export function createActivity(input: ActivityInput): Activity {
  const activity: Activity = { ...input, id: createId(), isCompleted: false, completedAt: null, createdAt: now(), updatedAt: now() };
  mutate((db) => ({ ...db, activities: [...db.activities, activity] }));
  return activity;
}

export function updateActivity(id: string, input: ActivityInput): void {
  mutate((db) => ({
    ...db,
    activities: db.activities.map((activity) => (activity.id === id ? { ...activity, ...input, updatedAt: now() } : activity)),
  }));
}

export function toggleActivityComplete(id: string): void {
  mutate((db) => ({
    ...db,
    activities: db.activities.map((activity) =>
      activity.id === id
        ? { ...activity, isCompleted: !activity.isCompleted, completedAt: !activity.isCompleted ? now() : null, updatedAt: now() }
        : activity,
    ),
  }));
}

export function deleteActivity(id: string): void {
  mutate((db) => ({ ...db, activities: db.activities.filter((activity) => activity.id !== id) }));
}
