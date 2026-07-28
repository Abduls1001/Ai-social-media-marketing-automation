import { Badge } from "@/components/ui/badge";

interface ContentTaskStatusBadgeProps {
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

const STATUS_VARIANTS: Record<
  string,
  "success" | "secondary" | "warning" | "outline"
> = {
  todo: "outline",
  in_progress: "warning",
  in_review: "secondary",
  done: "success",
};

export function ContentTaskStatusBadge({
  status,
}: ContentTaskStatusBadgeProps) {
  const normalized = status.toLowerCase();
  const label = STATUS_LABELS[normalized] ?? status;
  const variant = STATUS_VARIANTS[normalized] ?? "outline";

  return <Badge variant={variant}>{label}</Badge>;
}
