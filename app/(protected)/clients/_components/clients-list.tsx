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
import type { Client } from "@/types";

import { ClientFormDialog } from "./client-form-dialog";
import { ClientStatusBadge } from "./client-status-badge";
import { ClientsEmptyState } from "./clients-empty-state";
import { DeleteClientDialog } from "./delete-client-dialog";

interface ClientsListProps {
  agencyId: number;
  clients: Client[];
}

export function ClientsList({ agencyId, clients }: ClientsListProps) {
  const [search, setSearch] = React.useState("");

  if (clients.length === 0) {
    return <ClientsEmptyState agencyId={agencyId} />;
  }

  const query = search.trim().toLowerCase();
  const filteredClients = query
    ? clients.filter((client) => {
        const haystack = `${client.client_name} ${client.company_name ?? ""}`.toLowerCase();
        return haystack.includes(query);
      })
    : clients;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Clients
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {clients.length} {clients.length === 1 ? "client" : "clients"} in
            this workspace.
          </p>
        </div>

        <ClientFormDialog
          agencyId={agencyId}
          client={null}
          trigger={<Button type="button">Add Client</Button>}
        />
      </div>

      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search clients..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="pl-9"
          aria-label="Search clients"
        />
      </div>

      {filteredClients.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No clients match &ldquo;{search}&rdquo;.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead className="hidden lg:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Industry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {client.client_name}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {client.company_name ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {client.email ?? "—"}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {client.industry ?? "—"}
                  </TableCell>
                  <TableCell>
                    <ClientStatusBadge status={client.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <ClientFormDialog
                        agencyId={agencyId}
                        client={client}
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${client.client_name}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        }
                      />
                      <DeleteClientDialog
                        agencyId={agencyId}
                        client={client}
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${client.client_name}`}
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
