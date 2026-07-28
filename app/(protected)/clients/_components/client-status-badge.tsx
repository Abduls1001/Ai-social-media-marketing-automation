import { Badge } from "@/components/ui/badge";

interface ClientStatusBadgeProps {
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  lead: "Lead",
};

const STATUS_VARIANTS: Record<
  string,
  "success" | "secondary" | "warning" | "outline"
> = {
  active: "success",
  inactive: "secondary",
  lead: "warning",
};

export function ClientStatusBadge({ status }: ClientStatusBadgeProps) {
  const normalized = status.toLowerCase();
  const label = STATUS_LABELS[normalized] ?? status;
  const variant = STATUS_VARIANTS[normalized] ?? "outline";

  return <Badge variant={variant}>{label}</Badge>;
}
