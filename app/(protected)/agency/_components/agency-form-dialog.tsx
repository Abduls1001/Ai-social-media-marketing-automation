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
  createAgency,
  updateAgency,
  type AgencyFormValues,
} from "@/lib/supabase/agency-actions";
import type { Agency } from "@/types";

interface AgencyFormDialogProps {
  /** The agency being edited, or `null` when creating a new one. */
  agency: Agency | null;
  /** The button (or other element) that opens the dialog. */
  trigger: React.ReactNode;
}

const EMPTY_VALUES: AgencyFormValues = {
  agency_name: "",
  email: "",
  phone: "",
  website: "",
  country: "",
  timezone: "",
};

function valuesFromAgency(agency: Agency | null): AgencyFormValues {
  if (!agency) {
    return EMPTY_VALUES;
  }

  return {
    agency_name: agency.agency_name ?? "",
    email: agency.email ?? "",
    phone: agency.phone ?? "",
    website: agency.website ?? "",
    country: agency.country ?? "",
    timezone: agency.timezone ?? "",
  };
}

export function AgencyFormDialog({ agency, trigger }: AgencyFormDialogProps) {
  const router = useRouter();
  const isEditMode = agency !== null;

  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<AgencyFormValues>(() =>
    valuesFromAgency(agency)
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset the form to the latest agency data each time the dialog opens,
  // so a previous unsaved edit (or a stale create-mode draft) never leaks
  // into the next time it's opened.
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setValues(valuesFromAgency(agency));
      setError(null);
    }
    setOpen(nextOpen);
  }

  function handleChange(field: keyof AgencyFormValues) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const result = isEditMode
        ? await updateAgency(values)
        : await createAgency(values);

      if (result.error || !result.agency) {
        const message = result.error ?? "Something went wrong. Please try again.";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success(
        isEditMode
          ? "Agency profile updated."
          : "Agency profile created."
      );
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
            <DialogTitle>
              {isEditMode ? "Edit Agency" : "Create Agency"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update your agency workspace profile."
                : "Set up your agency workspace profile to get started."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="agency_name">Agency Name</Label>
              <Input
                id="agency_name"
                value={values.agency_name}
                onChange={handleChange("agency_name")}
                disabled={isSaving}
                autoFocus
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={values.email}
                onChange={handleChange("email")}
                disabled={isSaving}
                required
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
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={values.website}
                onChange={handleChange("website")}
                disabled={isSaving}
                placeholder="https://example.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={values.country}
                  onChange={handleChange("country")}
                  disabled={isSaving}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timezone">Time Zone</Label>
                <Input
                  id="timezone"
                  value={values.timezone}
                  onChange={handleChange("timezone")}
                  disabled={isSaving}
                  placeholder="e.g. UTC+05:00"
                  required
                />
              </div>
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
