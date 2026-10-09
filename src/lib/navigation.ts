import {
  LayoutDashboard,
  UserPlus,
  Workflow,
  Users,
  Building2,
  ListChecks,
  BarChart3,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/lib/types/crm";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Leads", href: "/leads", icon: UserPlus },
  { label: "Pipeline", href: "/pipeline", icon: Workflow },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Activities", href: "/activities", icon: ListChecks },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Team", href: "/team", icon: ShieldCheck, adminOnly: true },
];

export function visibleNavItems(role: UserRole): NavItem[] {
  return navItems.filter((item) => !item.adminOnly || role === "admin");
}

export function matchNavItem(pathname: string): NavItem | undefined {
  return navItems.find((item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));
}
