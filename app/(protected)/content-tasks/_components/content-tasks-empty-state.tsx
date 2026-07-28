import { ListChecks } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ContentTaskFormDialog } from "./content-task-form-dialog";

interface ContentTasksEmptyStateProps {
  campaignId: number;
}

export function ContentTasksEmptyState({
  campaignId,
}: ContentTasksEmptyStateProps) {
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
          No content tasks yet
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your first content task to start feeding future AI
          automation for this campaign.
        </p>
      </div>

      <ContentTaskFormDialog
        campaignId={campaignId}
        contentTask={null}
        trigger={
          <Button type="button" className="mt-2">
            Add Content Task
          </Button>
        }
      />
    </div>
  );
}
