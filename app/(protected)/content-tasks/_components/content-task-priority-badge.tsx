import { Badge } from "@/components/ui/badge";

interface ContentTaskPriorityBadgeProps {
  priority: string;
}

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const PRIORITY_VARIANTS: Record<
  string,
  "success" | "secondary" | "warning" | "destructive" | "outline"
> = {
  low: "secondary",
  medium: "outline",
  high: "warning",
  urgent: "destructive",
};

export function ContentTaskPriorityBadge({
  priority,
}: ContentTaskPriorityBadgeProps) {
  const normalized = priority.toLowerCase();
  const label = PRIORITY_LABELS[normalized] ?? priority;
  const variant = PRIORITY_VARIANTS[normalized] ?? "outline";

  return <Badge variant={variant}>{label}</Badge>;
}
