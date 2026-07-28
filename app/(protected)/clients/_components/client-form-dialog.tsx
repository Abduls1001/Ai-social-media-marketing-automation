"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createClientRecord,
  updateClientRecord,
  type ClientFormValues,
} from "@/lib/supabase/client-actions";
import type { Client } from "@/types";

interface ClientFormDialogProps {
  /** The agency this client belongs to (or will belong to on create). */
  agencyId: number;
  /** The client being edited, or `null` when creating a new one. */
  client: Client | null;
  /** The button (or other element) that opens the dialog. */
  trigger: React.ReactNode;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "lead", label: "Lead" },
];

const EMPTY_VALUES: ClientFormValues = {
  client_name: "",
  company_name: "",
  email: "",
  phone: "",
  website: "",
  industry: "",
  status: "active",
  notes: "",
};

function valuesFromClient(client: Client | null): ClientFormValues {
  if (!client) {
    return EMPTY_VALUES;
  }

  return {
    client_name: client.client_name ?? "",
    company_name: client.company_name ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    website: client.website ?? "",
    industry: client.industry ?? "",
    status: client.status ?? "active",
    notes: client.notes ?? "",
  };
}

export function ClientFormDialog({
  agencyId,
  client,
  trigger,
}: ClientFormDialogProps) {
  const router = useRouter();
  const isEditMode = client !== null;

  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<ClientFormValues>(() =>
    valuesFromClient(client)
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset the form to the latest client data each time the dialog opens,
  // so a previous unsaved edit (or a stale create-mode draft) never leaks
  // into the next time it's opened.
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(valuesFromClient(client));
      setError(null);
    }
    setOpen(nextOpen);
  }

  function handleChange(
    field: keyof Omit<ClientFormValues, "status">
  ) {
    return (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function handleStatusChange(value: string) {
    setValues((prev) => ({ ...prev, status: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const result =
        isEditMode && client
          ? await updateClientRecord(client.id, agencyId, values)
          : await createClientRecord(agencyId, values);

      if (result.error || !result.client) {
        const message = result.error ?? "Something went wrong. Please try again.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(isEditMode ? "Client updated." : "Client added.");
      setOpen(false);
      router.refresh();
    } catch {
      const message = "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Client" : "Add Client"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update this client's details."
                : "Add a new client to this agency workspace."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
            <div className="grid gap-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                value={values.client_name}
                onChange={handleChange("client_name")}
                disabled={isSaving}
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={values.company_name}
                onChange={handleChange("company_name")}
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange("email")}
                  disabled={isSaving}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={values.phone}
                  onChange={handleChange("phone")}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={values.website}
                onChange={handleChange("website")}
                disabled={isSaving}
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={values.industry}
                  onChange={handleChange("industry")}
                  disabled={isSaving}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={values.status}
                  onValueChange={handleStatusChange}
                  disabled={isSaving}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={values.notes}
                onChange={handleChange("notes")}
                disabled={isSaving}
                rows={3}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="animate-spin" />}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
