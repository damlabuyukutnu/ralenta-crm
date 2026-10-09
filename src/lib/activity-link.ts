import type { Activity, CrmDatabase } from "@/lib/types/crm";

export function getActivityRelatedRecord(activity: Activity, db: CrmDatabase): { label: string; href: string } | null {
  if (activity.leadId) {
    const lead = db.leads.find((item) => item.id === activity.leadId);
    return lead ? { label: `${lead.firstName} ${lead.lastName}`, href: `/leads/${lead.id}` } : null;
  }

  if (activity.contactId) {
    const contact = db.contacts.find((item) => item.id === activity.contactId);
    return contact ? { label: `${contact.firstName} ${contact.lastName}`, href: `/contacts/${contact.id}` } : null;
  }

  if (activity.companyId) {
    const company = db.companies.find((item) => item.id === activity.companyId);
    return company ? { label: company.name, href: `/companies/${company.id}` } : null;
  }

  if (activity.opportunityId) {
    const opportunity = db.opportunities.find((item) => item.id === activity.opportunityId);
    return opportunity ? { label: opportunity.name, href: `/pipeline/${opportunity.id}` } : null;
  }

  return null;
}
