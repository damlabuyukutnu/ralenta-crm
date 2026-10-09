import { OPPORTUNITY_STAGES } from "@/lib/constants/crm";
import type { Activity, CrmDatabase, LeadSource, OpportunityStage } from "@/lib/types/crm";

export function getActiveOpportunities(db: CrmDatabase) {
  return db.opportunities.filter((opportunity) => opportunity.stage !== "won" && opportunity.stage !== "lost");
}

export function getWonOpportunities(db: CrmDatabase) {
  return db.opportunities.filter((opportunity) => opportunity.stage === "won");
}

export function getLostOpportunities(db: CrmDatabase) {
  return db.opportunities.filter((opportunity) => opportunity.stage === "lost");
}

export function getWonRevenue(db: CrmDatabase): number {
  return getWonOpportunities(db).reduce((sum, opportunity) => sum + opportunity.amount, 0);
}

export function getConversionRate(db: CrmDatabase): number | null {
  if (db.leads.length === 0) return null;
  const converted = db.leads.filter((lead) => lead.status === "converted").length;
  return converted / db.leads.length;
}

export function getWinRate(db: CrmDatabase): number | null {
  const closed = getWonOpportunities(db).length + getLostOpportunities(db).length;
  if (closed === 0) return null;
  return getWonOpportunities(db).length / closed;
}

export function getUpcomingActivities(db: CrmDatabase, limit = 5): Activity[] {
  return db.activities
    .filter((activity) => !activity.isCompleted && activity.dueDate)
    .sort((a, b) => new Date(a.dueDate as string).getTime() - new Date(b.dueDate as string).getTime())
    .slice(0, limit);
}

export function getRecentActivities(db: CrmDatabase, limit = 6): Activity[] {
  return [...db.activities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getStageSummary(db: CrmDatabase): { stage: OpportunityStage; count: number; amount: number }[] {
  return OPPORTUNITY_STAGES.map((stage) => {
    const stageOpportunities = db.opportunities.filter((opportunity) => opportunity.stage === stage);
    return {
      stage,
      count: stageOpportunities.length,
      amount: stageOpportunities.reduce((sum, opportunity) => sum + opportunity.amount, 0),
    };
  });
}

export function getRevenueByMonth(db: CrmDatabase, months = 6): { month: string; revenue: number }[] {
  const now = new Date();
  const buckets: { key: string; label: string; revenue: number }[] = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
      revenue: 0,
    });
  }

  for (const opportunity of getWonOpportunities(db)) {
    if (!opportunity.actualCloseDate) continue;
    const closeDate = new Date(opportunity.actualCloseDate);
    const key = `${closeDate.getFullYear()}-${closeDate.getMonth()}`;
    const bucket = buckets.find((item) => item.key === key);
    if (bucket) bucket.revenue += opportunity.amount;
  }

  return buckets.map(({ label, revenue }) => ({ month: label, revenue }));
}

export function getLeadSourceBreakdown(db: CrmDatabase): { source: LeadSource; count: number }[] {
  const counts = new Map<LeadSource, number>();
  for (const lead of db.leads) {
    counts.set(lead.source, (counts.get(lead.source) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([source, count]) => ({ source, count }));
}
