"use client";

import { useMemo, useState } from "react";
import { BarChart3, Percent, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/overview/stat-card";
import { useCrmDatabase } from "@/lib/data/store";
import {
  getConversionRate,
  getLeadSourceBreakdown,
  getLostOpportunities,
  getRevenueByMonth,
  getStageSummary,
  getWinRate,
  getWonOpportunities,
} from "@/lib/data/metrics";
import { LEAD_SOURCE_LABELS, OPPORTUNITY_STAGE_CONFIG } from "@/lib/constants/crm";
import { formatCurrency } from "@/lib/utils";

const STAGE_COLORS: Record<string, string> = {
  new: "#94a3b8",
  qualified: "#2563eb",
  proposal: "#d97706",
  negotiation: "#7c3aed",
  won: "#059669",
  lost: "#e11d48",
};

export default function AnalyticsPage() {
  const database = useCrmDatabase();
  const [rangeMonths, setRangeMonths] = useState(6);

  const leadSourceData = useMemo(
    () =>
      getLeadSourceBreakdown(database).map((item) => ({
        source: LEAD_SOURCE_LABELS[item.source],
        count: item.count,
      })),
    [database],
  );

  const stageSummary = getStageSummary(database);
  const revenueByMonth = getRevenueByMonth(database, rangeMonths);
  const conversionRate = getConversionRate(database);
  const winRate = getWinRate(database);
  const wonCount = getWonOpportunities(database).length;
  const lostCount = getLostOpportunities(database).length;

  const winLossData = [
    { label: "Won", count: wonCount, color: "#059669" },
    { label: "Lost", count: lostCount, color: "#e11d48" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Lead sources, pipeline distribution, win rate, and revenue trends." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Conversion rate"
          value={conversionRate === null ? "—" : `${Math.round(conversionRate * 100)}%`}
          icon={Percent}
          hint="Leads converted to contacts"
        />
        <StatCard
          label="Win rate"
          value={winRate === null ? "—" : `${Math.round(winRate * 100)}%`}
          icon={TrendingUp}
          hint="Of closed opportunities"
        />
        <StatCard
          label="Closed opportunities"
          value={String(wonCount + lostCount)}
          icon={PieChartIcon}
          hint={`${wonCount} won · ${lostCount} lost`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads by source</CardTitle>
          </CardHeader>
          <CardContent>
            {leadSourceData.length === 0 ? (
              <EmptyState icon={BarChart3} title="No leads yet" description="Lead sources will appear here once leads are added." />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadSourceData} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                    <YAxis
                      type="category"
                      dataKey="source"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke="#94a3b8"
                      width={100}
                    />
                    <Tooltip cursor={{ fill: "#f1f5f9" }} />
                    <Bar dataKey="count" fill="#1c7d68" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opportunities by stage</CardTitle>
          </CardHeader>
          <CardContent>
            {database.opportunities.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No opportunities yet"
                description="Pipeline distribution will appear here once opportunities are added."
              />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageSummary.map((item) => ({ ...item, label: OPPORTUNITY_STAGE_CONFIG[item.stage].label }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} stroke="#94a3b8" width={32} />
                    <Tooltip cursor={{ fill: "#f1f5f9" }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {stageSummary.map((item) => (
                        <Cell key={item.stage} fill={STAGE_COLORS[item.stage]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Won vs. lost</CardTitle>
          </CardHeader>
          <CardContent>
            {wonCount + lostCount === 0 ? (
              <EmptyState
                icon={PieChartIcon}
                title="No closed opportunities yet"
                description="Win and loss breakdown will appear here once deals close."
              />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={winLossData} dataKey="count" nameKey="label" innerRadius={60} outerRadius={90} paddingAngle={2}>
                      {winLossData.map((item) => (
                        <Cell key={item.label} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            action={
              <Select
                value={String(rangeMonths)}
                onChange={(event) => setRangeMonths(Number(event.target.value))}
                className="w-auto"
                aria-label="Revenue chart date range"
              >
                <option value="3">Last 3 months</option>
                <option value="6">Last 6 months</option>
                <option value="12">Last 12 months</option>
              </Select>
            }
          >
            <CardTitle>Revenue over time</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByMonth.every((item) => item.revenue === 0) ? (
              <EmptyState
                icon={BarChart3}
                title="No revenue yet"
                description="Won deal revenue will appear here once opportunities close."
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
                    <Bar dataKey="revenue" fill="#1c7d68" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
