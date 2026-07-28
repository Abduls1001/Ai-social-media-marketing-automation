"use client";

import * as React from "react";
import { Pencil, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Campaign, Client } from "@/types";

import { CampaignFormDialog } from "./campaign-form-dialog";
import { CampaignStatusBadge } from "./campaign-status-badge";
import { CampaignsEmptyState } from "./campaigns-empty-state";
import { DeleteCampaignDialog } from "./delete-campaign-dialog";

interface CampaignsListProps {
  clientId: number;
  client: Client;
  campaigns: Campaign[];
}

export function CampaignsList({
  clientId,
  client,
  campaigns,
}: CampaignsListProps) {
  const [search, setSearch] = React.useState("");

  if (campaigns.length === 0) {
    return <CampaignsEmptyState clientId={clientId} />;
  }

  const query = search.trim().toLowerCase();
  const filteredCampaigns = query
    ? campaigns.filter((campaign) =>
        campaign.campaign_name.toLowerCase().includes(query)
      )
    : campaigns;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {campaigns.length} {campaigns.length === 1 ? "campaign" : "campaigns"}{" "}
            for {client.client_name}.
          </p>
        </div>

        <CampaignFormDialog
          clientId={clientId}
          campaign={null}
          trigger={<Button type="button">Add Campaign</Button>}
        />
      </div>

      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search campaigns..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
          aria-label="Search campaigns"
        />
      </div>

      {filteredCampaigns.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No campaigns match &ldquo;{search}&rdquo;.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="hidden md:table-cell">Platform</TableHead>
                <TableHead className="hidden lg:table-cell">Start</TableHead>
                <TableHead className="hidden lg:table-cell">End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    {campaign.campaign_name}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {campaign.platform ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {campaign.start_date ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {campaign.end_date ?? "—"}
                  </TableCell>
                  <TableCell>
                    <CampaignStatusBadge status={campaign.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <CampaignFormDialog
                        clientId={clientId}
                        campaign={campaign}
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${campaign.campaign_name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <DeleteCampaignDialog
                        clientId={clientId}
                        campaign={campaign}
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${campaign.campaign_name}`}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
