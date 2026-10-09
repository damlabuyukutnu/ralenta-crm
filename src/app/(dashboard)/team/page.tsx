"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TEAM_MEMBERS } from "@/lib/data/team";
import { useCurrentUser, setCurrentUserId } from "@/lib/data/session";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function TeamPage() {
  const currentUser = useCurrentUser();

  return (
    <div>
      <PageHeader
        title="Team"
        description="Everyone with access to this demo workspace. Roles are simulated for demonstration purposes only."
      />
      <Card>
        <ul className="divide-y divide-slate-100">
          {TEAM_MEMBERS.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {getInitials(member.fullName)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{member.fullName}</p>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={member.role === "admin" ? "teal" : "neutral"}>
                  {member.role === "admin" ? "Admin" : "Sales Representative"}
                </Badge>
                {member.id === currentUser.id ? (
                  <Badge tone="blue">Viewing as</Badge>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={() => setCurrentUserId(member.id)}>
                    View as
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
