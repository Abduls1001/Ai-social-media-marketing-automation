import Link from "next/link";

import { ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PostsNeedsContentTaskState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <div
        className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <ListChecks className="size-7" />
      </div>

      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">
          Select a content task
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Posts belong to a content task. Go to your Content Tasks page
          and choose &ldquo;View Posts&rdquo; on the content task you
          want to manage.
        </p>
      </div>

      <Button asChild className="mt-2">
        <Link href="/content-tasks">Go to Content Tasks</Link>
      </Button>
    </div>
  );
}
