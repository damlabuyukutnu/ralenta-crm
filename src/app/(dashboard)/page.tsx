"use client";

import Link from "next/link";
import { useState } from "react";
import { BarChart3, Percent, Trophy, UserPlus, Workflow } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/overview/stat-card";
import { useCrmDatabase } from "@/lib/data/store";
import {
  getActiveOpportunities,
  getConversionRate,
  getRecentActivities,
  getRevenueByMonth,
  getStageSummary,
  getUpcomingActivities,
  getWonRevenue,
} from "@/lib/data/metrics";
import { getActivityRelatedRecord } from "@/lib/activity-link";
import { ACTIVITY_TYPE_CONFIG, OPPORTUNITY_STAGE_CONFIG } from "@/lib/constants/crm";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export default function OverviewPage() {
  const database = useCrmDatabase();
  const [now] = useState(() => Date.now());
  const activeOpportunities = getActiveOpportunities(database);
  const wonRevenue = getWonRevenue(database);
  const conversionRate = getConversionRate(database);
  const upcoming = getUpcomingActivities(database, 5);
  const recent = getRecentActivities(database, 6);
  const stageSummary = getStageSummary(database);
  const revenueByMonth = getRevenueByMonth(database);

  const stageTotal = database.opportunities.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" description="A summary of pipeline health, lead volume, and upcoming follow-ups." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total leads" value={String(database.leads.length)} icon={UserPlus} />
        <StatCard label="Active opportunities" value={String(activeOpportunities.length)} icon={Workflow} />
        <StatCard label="Won revenue" value={formatCurrency(wonRevenue)} icon={Trophy} />
        <StatCard
          label="Conversion rate"
          value={conversionRate === null ? "—" : `${Math.round(conversionRate * 100)}%`}
          icon={Percent}
          hint={conversionRate === null ? "No leads yet" : "Leads converted to contacts"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales performance</CardTitle>
          </CardHeader>
          <CardContent>
            {wonRevenue === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No won deals yet"
                description="Won revenue will appear here once opportunities close."
              />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke="#94a3b8"
                      width={72}
                      tickFormatter={(value) => formatCurrency(Number(value))}
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} cursor={{ fill: "#f1f5f9" }} />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline by stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stageTotal === 0 ? (
              <p className="text-sm text-slate-500">No opportunities yet.</p>
            ) : (
              stageSummary.map(({ stage, count, amount }) => {
                const config = OPPORTUNITY_STAGE_CONFIG[stage];
                const width = Math.round((count / stageTotal) * 100);

                return (
                  <div key={stage}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <Badge tone={config.tone}>{config.label}</Badge>
                      <span className="text-slate-500">
                        {count} · {formatCurrency(amount)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            action={
              <Link href="/activities" className="text-sm font-medium text-brand-700 hover:underline">
                View all
              </Link>
            }
          >
            <CardTitle>Upcoming follow-ups</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {upcoming.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">Nothing due soon.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {upcoming.map((activity) => {
                  const related = getActivityRelatedRecord(activity, database);
                  const isOverdue = activity.dueDate ? new Date(activity.dueDate).getTime() < now : false;

                  return (
                    <li key={activity.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">{activity.subject}</p>
                        {related ? <p className="truncate text-xs text-slate-500">{related.label}</p> : null}
                      </div>
                      <span className={cn("shrink-0 text-xs", isOverdue ? "font-medium text-rose-600" : "text-slate-500")}>
                        {formatDate(activity.dueDate)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recent.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recent.map((activity) => {
                  const config = ACTIVITY_TYPE_CONFIG[activity.type];
                  const Icon = config.icon;
                  const related = getActivityRelatedRecord(activity, database);

                  return (
                    <li key={activity.id} className="flex items-start gap-3 px-5 py-3">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-slate-900">{activity.subject}</p>
                        {related ? <p className="truncate text-xs text-slate-500">{related.label}</p> : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
