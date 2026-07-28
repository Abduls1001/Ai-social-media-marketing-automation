import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Agency } from "@/types";

import { AgencyFormDialog } from "./agency-form-dialog";

interface AgencyHeaderProps {
  agency: Agency;
}

export function AgencyHeader({ agency }: AgencyHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {agency.agency_name}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {agency.description ?? "No description provided yet."}
        </p>
      </div>

      <AgencyFormDialog
        agency={agency}
        trigger={
          <Button type="button" className="self-start sm:self-auto">
            <Pencil aria-hidden="true" />
            Edit Agency
          </Button>
        }
      />
    </div>
  );
}
