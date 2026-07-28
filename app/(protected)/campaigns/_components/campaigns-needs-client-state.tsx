import Link from "next/link";

import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CampaignsNeedsClientState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <div
        className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <UserRound className="size-7" />
      </div>

      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">
          Select a client
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Campaigns belong to a client. Go to your Clients page and choose
          &ldquo;View Campaigns&rdquo; on the client you want to manage.
        </p>
      </div>

      <Button asChild className="mt-2">
        <Link href="/clients">Go to Clients</Link>
      </Button>
    </div>
  );
}
