import { Badge } from "@/components/ui/badge";

interface CampaignStatusBadgeProps {
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  planning: "Planning",
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};

const STATUS_VARIANTS: Record<
  string,
  "success" | "secondary" | "warning" | "outline"
> = {
  planning: "outline",
  active: "success",
  paused: "warning",
  completed: "secondary",
};

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const normalized = status.toLowerCase();
  const label = STATUS_LABELS[normalized] ?? status;
  const variant = STATUS_VARIANTS[normalized] ?? "outline";

  return <Badge variant={variant}>{label}</Badge>;
}
