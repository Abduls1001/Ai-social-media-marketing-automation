import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AgencyEmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <div
        className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <Building2 className="size-7" />
      </div>

      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to AI Social Media Operations Platform
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No agency profile has been created yet. Create your agency to
          start managing clients, campaigns and content.
        </p>
      </div>

      <Button type="button" className="mt-2">
        Create Agency
      </Button>
    </div>
  );
}
