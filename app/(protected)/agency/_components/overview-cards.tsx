import { Megaphone, Share2, UserRound, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface OverviewStat {
  label: string;
  value: string;
  icon: LucideIcon;
}

const OVERVIEW_STATS: OverviewStat[] = [
  { label: "Active Clients", value: "0", icon: Users },
  { label: "Active Campaigns", value: "0", icon: Megaphone },
  { label: "Team Members", value: "1", icon: UserRound },
  { label: "Connected Social Accounts", value: "0", icon: Share2 },
];

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {OVERVIEW_STATS.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.label}>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
