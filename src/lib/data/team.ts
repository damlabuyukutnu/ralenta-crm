import type { TeamMember } from "@/lib/types/crm";

export const TEAM_MEMBERS: TeamMember[] = [
  { id: "team-dana", fullName: "Dana Whitfield", email: "dana@ralenta.app", role: "admin" },
  { id: "team-marcus", fullName: "Marcus Chen", email: "marcus@ralenta.app", role: "sales_rep" },
  { id: "team-priya", fullName: "Priya Nair", email: "priya@ralenta.app", role: "sales_rep" },
];

export const DEFAULT_TEAM_MEMBER_ID = TEAM_MEMBERS[0].id;

export function getTeamMember(id: string): TeamMember | undefined {
  return TEAM_MEMBERS.find((member) => member.id === id);
}
