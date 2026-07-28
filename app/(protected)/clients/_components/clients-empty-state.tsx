import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ClientFormDialog } from "./client-form-dialog";

interface ClientsEmptyStateProps {
  agencyId: number;
}

export function ClientsEmptyState({ agencyId }: ClientsEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <div
        className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <UserRound className="size-7" />
      </div>

      <div className="max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">No clients yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your first client to start attributing campaigns, content, and
          posts to the businesses you manage.
        </p>
      </div>

      <ClientFormDialog
        agencyId={agencyId}
        client={null}
        trigger={
          <Button type="button" className="mt-2">
            Add Client
          </Button>
        }
      />
    </div>
  );
}
