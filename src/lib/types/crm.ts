export type UserRole = "admin" | "sales_rep";

export type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted";

export type LeadSource = "website" | "referral" | "cold_call" | "social_media" | "event" | "advertisement" | "other";

export type OpportunityStage = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export type ActivityType = "call" | "meeting" | "email" | "task" | "note";

export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  companyId: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  source: LeadSource;
  status: LeadStatus;
  ownerId: string;
  convertedContactId: string | null;
  convertedCompanyId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  name: string;
  contactId: string | null;
  companyId: string | null;
  leadId: string | null;
  stage: OpportunityStage;
  amount: number;
  probability: number | null;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  ownerId: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  ownerId: string;
  leadId: string | null;
  contactId: string | null;
  companyId: string | null;
  opportunityId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CrmDatabase {
  companies: Company[];
  contacts: Contact[];
  leads: Lead[];
  opportunities: Opportunity[];
  activities: Activity[];
}
