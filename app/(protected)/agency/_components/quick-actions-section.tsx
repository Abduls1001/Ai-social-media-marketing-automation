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

interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "Edit Agency",
    description: "Update your profile and branding.",
    icon: Pencil,
  },
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

export function QuickActionsSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common agency management actions.</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              type="button"
              className={cn(
                "flex flex-col items-start gap-2 rounded-md border bg-background p-4 text-left shadow-xs transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              )}
            >
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
