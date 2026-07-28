import { Link2, Pencil, Sparkles, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Agency } from "@/types";

import { AgencyFormDialog } from "./agency-form-dialog";

interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
}

// "Edit Agency" is wired up separately below since it opens the agency
// form dialog. The remaining tiles stay UI-only placeholders — their
// modules (Team, Social Accounts, Billing) are out of scope for Phase 2.5.
const PLACEHOLDER_ACTIONS: QuickAction[] = [
  {
    label: "Invite Team Member",
    description: "Add someone to this workspace.",
    icon: UserPlus,
  },
  {
    label: "Connect Social Account",
    description: "Link a platform for publishing.",
    icon: Link2,
  },
  {
    label: "Upgrade Plan",
    description: "Unlock more workspace features.",
    icon: Sparkles,
  },
];

const TILE_CLASSNAME = cn(
  "flex flex-col items-start gap-2 rounded-md border bg-background p-4 text-left shadow-xs transition-colors",
  "hover:bg-accent hover:text-accent-foreground",
  "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
);

interface QuickActionsSectionProps {
  agency: Agency;
}

export function QuickActionsSection({ agency }: QuickActionsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common agency management actions.</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AgencyFormDialog
          agency={agency}
          trigger={
            <button type="button" className={TILE_CLASSNAME}>
              <Pencil
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-sm font-medium">Edit Agency</span>
              <span className="text-xs font-normal text-muted-foreground">
                Update your profile and branding.
              </span>
            </button>
          }
        />

        {PLACEHOLDER_ACTIONS.map((action) => {
          const Icon = action.icon;

          return (
            <button key={action.label} type="button" className={TILE_CLASSNAME}>
              <Icon
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="text-sm font-medium">{action.label}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {action.description}
              </span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
