import { Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CampaignFormDialog } from "./campaign-form-dialog";

interface CampaignsEmptyStateProps {
  clientId: number;
}

export function CampaignsEmptyState({ clientId }: CampaignsEmptyStateProps) {
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
          No campaigns yet
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your first campaign to start organizing content tasks and
          posts for this client.
        </p>
      </div>

      <CampaignFormDialog
        clientId={clientId}
        campaign={null}
        trigger={
          <Button type="button" className="mt-2">
            Add Campaign
          </Button>
        }
      />
    </div>
  );
}
