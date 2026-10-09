import { Phone, Users, Mail, CheckSquare, StickyNote, type LucideIcon } from "lucide-react";
import type { BadgeTone } from "@/components/ui/badge";
import type { ActivityType, LeadSource, LeadStatus, OpportunityStage } from "@/lib/types/crm";

export const OPPORTUNITY_STAGE_CONFIG: Record<OpportunityStage, { label: string; tone: BadgeTone }> = {
  new: { label: "New", tone: "neutral" },
  qualified: { label: "Qualified", tone: "blue" },
  proposal: { label: "Proposal", tone: "amber" },
  negotiation: { label: "Negotiation", tone: "violet" },
  won: { label: "Won", tone: "emerald" },
  lost: { label: "Lost", tone: "rose" },
};

export const OPPORTUNITY_STAGES = ["new", "qualified", "proposal", "negotiation", "won", "lost"] as const satisfies readonly OpportunityStage[];

export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; tone: BadgeTone }> = {
  new: { label: "New", tone: "neutral" },
  contacted: { label: "Contacted", tone: "sky" },
  qualified: { label: "Qualified", tone: "blue" },
  unqualified: { label: "Unqualified", tone: "rose" },
  converted: { label: "Converted", tone: "emerald" },
};

export const LEAD_STATUSES = ["new", "contacted", "qualified", "unqualified", "converted"] as const satisfies readonly LeadStatus[];

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  website: "Website",
  referral: "Referral",
  cold_call: "Cold Call",
  social_media: "Social Media",
  event: "Event",
  advertisement: "Advertisement",
  other: "Other",
};

export const LEAD_SOURCES = [
  "website",
  "referral",
  "cold_call",
  "social_media",
  "event",
  "advertisement",
  "other",
] as const satisfies readonly LeadSource[];

export const ACTIVITY_TYPE_CONFIG: Record<ActivityType, { label: string; icon: LucideIcon }> = {
  call: { label: "Call", icon: Phone },
  meeting: { label: "Meeting", icon: Users },
  email: { label: "Email", icon: Mail },
  task: { label: "Task", icon: CheckSquare },
  note: { label: "Note", icon: StickyNote },
};

export const ACTIVITY_TYPES = ["call", "meeting", "email", "task", "note"] as const satisfies readonly ActivityType[];
