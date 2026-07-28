import Link from "next/link";

import { Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ContentTasksNeedsCampaignState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <div
        className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <Megaphone className="size-7" />
      </div>

      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">
          Select a campaign
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Content tasks belong to a campaign. Go to your Campaigns page and
          choose &ldquo;View Content Tasks&rdquo; on the campaign you want
          to manage.
        </p>
      </div>

      <Button asChild className="mt-2">
        <Link href="/campaigns">Go to Campaigns</Link>
      </Button>
    </div>
  );
}
