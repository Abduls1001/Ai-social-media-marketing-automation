import { Loader2 } from "lucide-react";

export default function AgencyLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <Loader2
        className="size-8 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">
        Loading your agency workspace…
      </p>
    </div>
  );
}
