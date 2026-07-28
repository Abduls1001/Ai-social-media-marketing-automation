import { Activity, Calendar, CreditCard, Hash } from "lucide-react";
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

interface WorkspaceInfoSectionProps {
  agency: Agency;
}

interface WorkspaceField {
  label: string;
  value: string;
  icon: LucideIcon;
  isStatus?: boolean;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getStatusDotClassName(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-500";
    case "suspended":
    case "inactive":
      return "bg-destructive";
    default:
      return "bg-muted-foreground";
  }
}

export function WorkspaceInfoSection({ agency }: WorkspaceInfoSectionProps) {
  const fields: WorkspaceField[] = [
    { label: "Workspace ID", value: String(agency.id), icon: Hash },
    {
      label: "Created Date",
      value: formatDate(agency.created_at),
      icon: Calendar,
    },
    {
      label: "Current Plan",
      value: agency.workspace_plan,
      icon: CreditCard,
    },
    {
      label: "Workspace Status",
      value: agency.workspace_status,
      icon: Activity,
      isStatus: true,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workspace Information</CardTitle>
        <CardDescription>System details for this workspace.</CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((field) => {
          const Icon = field.icon;

          return (
            <div key={field.label} className="flex items-start gap-3">
              <Icon
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {field.label}
                </p>
                {field.isStatus ? (
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm capitalize">
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        getStatusDotClassName(field.value)
                      )}
                      aria-hidden="true"
                    />
                    {field.value}
                  </p>
                ) : (
                  <p className="truncate text-sm">{field.value}</p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
