import Link from "next/link";

import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ClientsNeedsAgencyState() {
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
          Set up your agency first
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Clients belong to your agency workspace. Create your agency
          profile before adding clients.
        </p>
      </div>

      <Button asChild className="mt-2">
        <Link href="/agency">Go to Agency Setup</Link>
      </Button>
    </div>
  );
}
