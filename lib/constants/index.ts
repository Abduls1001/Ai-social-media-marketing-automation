/**
 * Application-wide constants barrel file.
 */

import {
  BarChart3,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Send,
  Settings,
  Users,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  /** Label shown in the sidebar and breadcrumb. */
  label: string;
  /** Route the nav item links to. */
  href: string;
  /** Icon rendered next to the label. */
  icon: LucideIcon;
}

/** Primary application navigation, rendered in the dashboard sidebar. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/home", icon: LayoutDashboard },
  { label: "Agency", href: "/agency", icon: Building2 },
  { label: "Team", href: "/team", icon: Users },
  { label: "Clients", href: "/clients", icon: UserRound },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Content Tasks", href: "/content-tasks", icon: ListChecks },
  { label: "Posts", href: "/posts", icon: FileText },
  { label: "Publishing", href: "/publishing", icon: Send },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Reports", href: "/reports", icon: ClipboardList },
  { label: "Settings", href: "/settings", icon: Settings },
];

/** Path prefixes that require an authenticated session. */
export const PROTECTED_PATHS = NAV_ITEMS.map((item) => item.href);

/** Central auth route paths, referenced across pages and middleware. */
export const AUTH_ROUTES = {
  login: "/login",
  forgotPassword: "/forgot-password",
} as const;
