import { Badge } from "@/components/ui/badge";

interface PostStatusBadgeProps {
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  cancelled: "Cancelled",
};

const STATUS_VARIANTS: Record<
  string,
  "success" | "secondary" | "warning" | "destructive" | "outline"
> = {
  draft: "outline",
  scheduled: "warning",
  published: "success",
  cancelled: "destructive",
};

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  const normalized = status.toLowerCase();
  const label = STATUS_LABELS[normalized] ?? status;
  const variant = STATUS_VARIANTS[normalized] ?? "outline";

  return <Badge variant={variant}>{label}</Badge>;
}
